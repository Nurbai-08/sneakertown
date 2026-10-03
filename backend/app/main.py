from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models  # noqa: F401
from .config import settings
from .database import Base, engine
from .routers import auth, collections, orders, users


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.is_production and settings.secret_key.startswith("change-me"):
        raise RuntimeError("SECRET_KEY must be configured in production")
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(collections.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.mount("/api/uploads", StaticFiles(directory=settings.upload_dir, check_dir=False), name="uploads")


@app.get("/api/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}
