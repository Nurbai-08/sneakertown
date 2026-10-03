# SneakerTown

Интернет-магазин кроссовок с React-интерфейсом и собственным Python API. Firebase больше не используется.

## Стек

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Alembic
- База данных: PostgreSQL
- Авторизация: Argon2, короткоживущий JWT access token и refresh token в `HttpOnly` cookie
- Данные аккаунта: профиль, аватар, корзина, избранное и заказы в PostgreSQL
- Дополнительно: Google OAuth и восстановление пароля через SMTP

## Быстрый запуск через Docker

Нужны Docker и Node.js.

```bash
docker compose up -d db api
npm install
npm run dev
```

Сайт откроется на `http://localhost:5173`, API — на `http://localhost:8000`, документация API — на `http://localhost:8000/docs`.

## Запуск без Docker

Создайте PostgreSQL-базу и пользователя, затем:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
cd backend
alembic upgrade head
cd ..
npm install
```

В двух терминалах запустите:

```bash
npm run dev:api
npm run dev:web
```

Стандартная строка подключения из примера:

```text
postgresql+psycopg://sneakertown:sneakertown@localhost:5432/sneakertown
```

Перед production-деплоем обязательно задайте случайный `SECRET_KEY`, включите `SECURE_COOKIES=true`, примените миграции и отключите `AUTO_CREATE_TABLES`.

## Google OAuth

Создайте OAuth Client типа Web application в Google Cloud Console и добавьте redirect URI:

```text
http://localhost:8000/api/auth/google/callback
```

Затем заполните в `backend/.env`:

```text
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

Без этих переменных обычная регистрация и вход работают, а Google-вход возвращает сообщение о том, что он не настроен.

## Восстановление пароля

Для отправки писем заполните `SMTP_*` в `backend/.env`. В development-режиме без SMTP ссылка восстановления печатается в лог API. В production токен в лог не выводится.

## Production

Frontend использует `VITE_API_URL`. Если API размещён отдельно, задайте полный HTTPS URL во время сборки, например:

```text
VITE_API_URL=https://api.example.com/api
```

На backend укажите URL сайта в `FRONTEND_URL` и разрешённый origin в `ALLOWED_ORIGINS`. Загруженные аватары сейчас сохраняются в `backend/uploads`; для нескольких инстансов production-сервера эту папку нужно заменить постоянным S3-совместимым хранилищем.

## Оплата

Оформление создаёт реальный заказ в PostgreSQL, но платёжный провайдер пока не подключён.
