import io
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User
from ..schemas import ProfileUpdateIn, UserOut, user_out


router = APIRouter(prefix="/users", tags=["users"])
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
}


@router.get("/me", response_model=UserOut)
def get_profile(user: User = Depends(get_current_user)) -> UserOut:
    return user_out(user)


@router.patch("/me", response_model=UserOut)
def update_profile(
    payload: ProfileUpdateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    user.display_name = payload.display_name
    db.commit()
    return user_out(user)


@router.post("/me/avatar", response_model=UserOut)
async def upload_avatar(
    avatar: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    extension = ALLOWED_IMAGE_TYPES.get(avatar.content_type or "")
    if not extension:
        raise HTTPException(status_code=415, detail="Допустимы только JPG, PNG, GIF, WebP и AVIF")
    content = await avatar.read(settings.max_avatar_bytes + 1)
    if len(content) > settings.max_avatar_bytes:
        raise HTTPException(status_code=413, detail="Размер файла не должен превышать 5 МБ")
    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=415, detail="Файл не является корректным изображением") from None

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{user.id}_{uuid.uuid4().hex}.{extension}"
    (settings.upload_dir / filename).write_bytes(content)
    user.photo_url = f"/api/uploads/{filename}"
    db.commit()
    return user_out(user)
