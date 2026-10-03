import secrets
from datetime import timedelta
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, BackgroundTasks, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import PasswordResetToken, RefreshSession, User
from ..rate_limit import limit_auth_request
from ..schemas import AuthOut, ForgotPasswordIn, LoginIn, RegisterIn, ResetPasswordIn, user_out
from ..security import (
    create_access_token,
    hash_password,
    is_expired,
    new_opaque_token,
    token_digest,
    utcnow,
    verify_password,
)
from ..services.email import send_password_reset_email


router = APIRouter(prefix="/auth", tags=["auth"])
REFRESH_COOKIE = "sneakertown_refresh"
OAUTH_STATE_COOKIE = "sneakertown_oauth_state"


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=settings.refresh_token_days * 24 * 60 * 60,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="none" if settings.secure_cookies else "lax",
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="none" if settings.secure_cookies else "lax",
        path="/api/auth",
    )


def _create_session(db: Session, user: User, response: Response) -> AuthOut:
    raw_refresh = new_opaque_token()
    db.add(
        RefreshSession(
            user_id=user.id,
            token_hash=token_digest(raw_refresh),
            expires_at=utcnow() + timedelta(days=settings.refresh_token_days),
        )
    )
    db.commit()
    _set_refresh_cookie(response, raw_refresh)
    response.headers["Cache-Control"] = "no-store"
    return AuthOut(access_token=create_access_token(str(user.id)), user=user_out(user))


@router.post("/register", response_model=AuthOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthOut:
    limit_auth_request(request, "register", limit=5, window_seconds=60)
    email = _normalize_email(str(payload.email))
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="Этот email уже зарегистрирован")

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        display_name=payload.display_name,
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Этот email уже зарегистрирован") from None
    return _create_session(db, user, response)


@router.post("/login", response_model=AuthOut)
def login(payload: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthOut:
    limit_auth_request(request, "login", limit=10, window_seconds=60)
    user = db.scalar(select(User).where(User.email == _normalize_email(str(payload.email))))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return _create_session(db, user, response)


@router.post("/refresh", response_model=AuthOut)
def refresh_session(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
    db: Session = Depends(get_db),
) -> AuthOut:
    unauthorized = HTTPException(status_code=401, detail="Сессия истекла")
    if not refresh_token:
        raise unauthorized

    session = db.scalar(select(RefreshSession).where(RefreshSession.token_hash == token_digest(refresh_token)))
    if not session or is_expired(session.expires_at):
        if session:
            db.delete(session)
            db.commit()
        _clear_refresh_cookie(response)
        raise unauthorized

    user = db.get(User, session.user_id)
    if not user or not user.is_active:
        db.delete(session)
        db.commit()
        _clear_refresh_cookie(response)
        raise unauthorized

    db.delete(session)
    db.flush()
    return _create_session(db, user, response)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE),
    db: Session = Depends(get_db),
) -> None:
    if refresh_token:
        session = db.scalar(select(RefreshSession).where(RefreshSession.token_hash == token_digest(refresh_token)))
        if session:
            db.delete(session)
            db.commit()
    _clear_refresh_cookie(response)


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    payload: ForgotPasswordIn,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    limit_auth_request(request, "forgot-password", limit=5, window_seconds=300)
    user = db.scalar(select(User).where(User.email == _normalize_email(str(payload.email))))
    if user and user.is_active:
        raw_token = new_opaque_token()
        db.execute(delete(PasswordResetToken).where(PasswordResetToken.user_id == user.id))
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=token_digest(raw_token),
                expires_at=utcnow() + timedelta(minutes=settings.password_reset_minutes),
            )
        )
        db.commit()
        background_tasks.add_task(send_password_reset_email, user.email, raw_token)
    return {"message": "Если аккаунт существует, письмо для восстановления отправлено"}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordIn, db: Session = Depends(get_db)) -> dict[str, str]:
    reset_token = db.scalar(
        select(PasswordResetToken).where(PasswordResetToken.token_hash == token_digest(payload.token))
    )
    if not reset_token or reset_token.used_at or is_expired(reset_token.expires_at):
        raise HTTPException(status_code=400, detail="Ссылка недействительна или истекла")

    user = db.get(User, reset_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=400, detail="Ссылка недействительна или истекла")

    user.password_hash = hash_password(payload.password)
    reset_token.used_at = utcnow()
    db.execute(delete(RefreshSession).where(RefreshSession.user_id == user.id))
    db.commit()
    return {"message": "Пароль обновлён"}


@router.get("/google/start")
def google_start() -> RedirectResponse:
    if not settings.google_client_id or not settings.google_client_secret:
        return RedirectResponse(f"{settings.frontend_url.rstrip('/')}/login?auth_error=google-not-configured", status_code=303)
    state = secrets.token_urlsafe(32)
    query = urlencode(
        {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "select_account",
        }
    )
    response = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{query}")
    response.set_cookie(
        OAUTH_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        secure=settings.secure_cookies,
        samesite="none" if settings.secure_cookies else "lax",
        path="/api/auth/google",
    )
    return response


@router.get("/google/callback")
def google_callback(
    code: str,
    state: str,
    oauth_state: str | None = Cookie(default=None, alias=OAUTH_STATE_COOKIE),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    if not oauth_state or not secrets.compare_digest(oauth_state, state):
        raise HTTPException(status_code=400, detail="Некорректное состояние OAuth")
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Вход через Google не настроен")

    with httpx.Client(timeout=15) as client:
        token_response = client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if token_response.is_error:
            raise HTTPException(status_code=400, detail="Не удалось выполнить вход через Google")
        google_token = token_response.json().get("access_token")
        user_response = client.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {google_token}"},
        )
        if user_response.is_error:
            raise HTTPException(status_code=400, detail="Не удалось получить профиль Google")
        profile = user_response.json()

    if not profile.get("email") or not profile.get("email_verified") or not profile.get("sub"):
        raise HTTPException(status_code=400, detail="Google не подтвердил email")

    email = _normalize_email(profile["email"])
    user = db.scalar(select(User).where((User.google_sub == profile["sub"]) | (User.email == email)))
    if not user:
        user = User(
            email=email,
            google_sub=profile["sub"],
            display_name=(profile.get("name") or "")[:50],
            photo_url=profile.get("picture") or "",
        )
        db.add(user)
        db.flush()
    else:
        user.google_sub = user.google_sub or profile["sub"]
        user.display_name = user.display_name or (profile.get("name") or "")[:50]
        user.photo_url = user.photo_url or profile.get("picture") or ""

    response = RedirectResponse(f"{settings.frontend_url.rstrip('/')}/auth/callback")
    response.delete_cookie(OAUTH_STATE_COOKIE, path="/api/auth/google")
    _create_session(db, user, response)
    return response
