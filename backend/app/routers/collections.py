from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import CartItem, Favorite, User
from ..schemas import CollectionIn, CollectionOut


router = APIRouter(prefix="/collections", tags=["collections"])


def _validate_item(item: dict, key: str) -> str:
    value = str(item.get(key) or "").strip()
    if not value or len(value) > 255:
        raise HTTPException(status_code=422, detail=f"Некорректный идентификатор: {key}")
    return value


@router.get("/{collection_name}", response_model=CollectionOut)
def get_collection(
    collection_name: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionOut:
    if collection_name == "cart":
        rows = db.scalars(select(CartItem).where(CartItem.user_id == user.id).order_by(CartItem.updated_at)).all()
    elif collection_name == "favorites":
        rows = db.scalars(select(Favorite).where(Favorite.user_id == user.id).order_by(Favorite.updated_at)).all()
    else:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    return CollectionOut(items=[row.data for row in rows])


@router.put("/{collection_name}", response_model=CollectionOut)
def replace_collection(
    collection_name: str,
    payload: CollectionIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CollectionOut:
    if collection_name == "cart":
        db.execute(delete(CartItem).where(CartItem.user_id == user.id))
        seen: set[str] = set()
        for item in payload.items:
            cart_key = _validate_item(item, "cartKey")
            if cart_key in seen:
                continue
            seen.add(cart_key)
            db.add(CartItem(user_id=user.id, cart_key=cart_key, data=item))
    elif collection_name == "favorites":
        db.execute(delete(Favorite).where(Favorite.user_id == user.id))
        seen = set()
        for item in payload.items:
            sneaker_id = _validate_item(item, "id")
            if sneaker_id in seen:
                continue
            seen.add(sneaker_id)
            db.add(Favorite(user_id=user.id, sneaker_id=sneaker_id, data=item))
    else:
        raise HTTPException(status_code=404, detail="Коллекция не найдена")
    db.commit()
    return CollectionOut(items=payload.items)
