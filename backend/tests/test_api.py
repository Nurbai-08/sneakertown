import os
from pathlib import Path


TEST_DB = Path(__file__).resolve().parents[1] / "test.db"
if TEST_DB.exists():
    TEST_DB.unlink()
os.environ["DATABASE_URL"] = f"sqlite+pysqlite:///{TEST_DB}"
os.environ["AUTO_CREATE_TABLES"] = "true"
os.environ["SECRET_KEY"] = "test-secret-key-that-is-long-enough-for-tests"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.routers import auth as auth_router  # noqa: E402


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_complete_account_flow(monkeypatch) -> None:
    with TestClient(app) as client:
        health = client.get("/api/health")
        assert health.status_code == 200

        register = client.post(
            "/api/auth/register",
            json={"email": "buyer@example.com", "password": "strong-password", "display_name": "Buyer"},
        )
        assert register.status_code == 201, register.text
        session = register.json()
        token = session["access_token"]
        assert session["user"]["displayName"] == "Buyer"
        assert client.cookies.get("sneakertown_refresh")

        duplicate = client.post(
            "/api/auth/register",
            json={"email": "buyer@example.com", "password": "strong-password", "display_name": "Buyer"},
        )
        assert duplicate.status_code == 409

        profile = client.patch(
            "/api/users/me",
            headers=auth_header(token),
            json={"display_name": "New name"},
        )
        assert profile.status_code == 200
        assert profile.json()["displayName"] == "New name"

        cart_item = {
            "id": "mock-nike-air-force-1",
            "cartKey": "mock-nike-air-force-1__42",
            "name": "Nike Air Force 1",
            "retailPrice": 4900,
            "selectedSize": 42,
            "quantity": 2,
        }
        saved_cart = client.put(
            "/api/collections/cart",
            headers=auth_header(token),
            json={"items": [cart_item]},
        )
        assert saved_cart.status_code == 200, saved_cart.text
        loaded_cart = client.get("/api/collections/cart", headers=auth_header(token))
        assert loaded_cart.json()["items"] == [cart_item]

        order = client.post(
            "/api/orders",
            headers=auth_header(token),
            json={"items": [cart_item], "totalItems": 999, "totalPrice": 1},
        )
        assert order.status_code == 201, order.text
        assert order.json()["totalItems"] == 2
        assert float(order.json()["totalPrice"]) == 9800

        refreshed = client.post("/api/auth/refresh")
        assert refreshed.status_code == 200, refreshed.text
        assert refreshed.json()["user"]["displayName"] == "New name"

        sent: dict[str, str] = {}
        monkeypatch.setattr(
            auth_router,
            "send_password_reset_email",
            lambda recipient, reset_token: sent.update(recipient=recipient, token=reset_token),
        )
        forgot = client.post("/api/auth/forgot-password", json={"email": "buyer@example.com"})
        assert forgot.status_code == 202
        assert sent["recipient"] == "buyer@example.com"

        reset = client.post(
            "/api/auth/reset-password",
            json={"token": sent["token"], "password": "a-new-strong-password"},
        )
        assert reset.status_code == 200
        reused_reset = client.post(
            "/api/auth/reset-password",
            json={"token": sent["token"], "password": "another-password"},
        )
        assert reused_reset.status_code == 400

        login = client.post(
            "/api/auth/login",
            json={"email": "buyer@example.com", "password": "a-new-strong-password"},
        )
        assert login.status_code == 200

        logout = client.post("/api/auth/logout")
        assert logout.status_code == 204
        assert client.post("/api/auth/refresh").status_code == 401
