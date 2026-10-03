from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User
from .security import decode_access_token


bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Требуется авторизация",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise unauthorized
    try:
        user_id = UUID(decode_access_token(credentials.credentials))
    except (ValueError, jwt.PyJWTError):
        raise unauthorized from None
    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise unauthorized
    return user
