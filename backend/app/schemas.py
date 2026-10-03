from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserOut(BaseModel):
    uid: UUID
    email: EmailStr
    displayName: str
    photoURL: str
    role: str
    createdAt: datetime


class AuthOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(default="", max_length=50)

    @field_validator("display_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return value.strip()


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str = Field(min_length=20, max_length=512)
    password: str = Field(min_length=8, max_length=128)


class ProfileUpdateIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=50)

    @field_validator("display_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Введите имя")
        return value


class CollectionIn(BaseModel):
    items: list[dict[str, Any]] = Field(default_factory=list, max_length=200)


class CollectionOut(BaseModel):
    items: list[dict[str, Any]]


class OrderItemIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(min_length=1, max_length=255)
    name: str = Field(default="Кроссовки", max_length=255)
    brand: str = Field(default="", max_length=120)
    image: str = Field(default="", max_length=3000)
    retailPrice: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    selectedSize: str | int | float = ""
    quantity: int = Field(default=1, ge=1, le=20)


class OrderCreateIn(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1, max_length=100)
    totalItems: int | None = None
    totalPrice: Decimal | None = None


class OrderOut(BaseModel):
    id: UUID
    status: str
    totalItems: int
    totalPrice: Decimal
    createdAt: datetime


def user_out(user: Any) -> UserOut:
    return UserOut(
        uid=user.id,
        email=user.email,
        displayName=user.display_name,
        photoURL=user.photo_url,
        role=user.role,
        createdAt=user.created_at,
    )
