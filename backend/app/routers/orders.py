from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Order, OrderItem, User
from ..schemas import OrderCreateIn, OrderOut


router = APIRouter(prefix="/orders", tags=["orders"])


def _order_out(order: Order) -> OrderOut:
    return OrderOut(
        id=order.id,
        status=order.status,
        totalItems=order.total_items,
        totalPrice=order.total_price,
        createdAt=order.created_at,
    )


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    payload: OrderCreateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderOut:
    total_items = sum(item.quantity for item in payload.items)
    total_price = sum((item.retailPrice * item.quantity for item in payload.items), start=Decimal("0"))
    order = Order(user_id=user.id, total_items=total_items, total_price=total_price, status="new")
    db.add(order)
    db.flush()
    for item in payload.items:
        db.add(
            OrderItem(
                order_id=order.id,
                sneaker_id=item.id,
                name=item.name,
                brand=item.brand,
                image=item.image,
                retail_price=item.retailPrice,
                selected_size=str(item.selectedSize),
                quantity=item.quantity,
            )
        )
    db.commit()
    db.refresh(order)
    return _order_out(order)


@router.get("", response_model=list[OrderOut])
def list_orders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OrderOut]:
    orders = db.scalars(select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())).all()
    return [_order_out(order) for order in orders]
