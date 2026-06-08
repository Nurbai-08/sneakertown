# SneakerTown SPA

Интернет-магазин кроссовок на React, Redux Toolkit, Tailwind CSS и Firebase.

## Стек

- Frontend: React (Vite)
- Стейт: Redux Toolkit + axios
- Стили: Tailwind CSS
- Auth: Firebase
- Каталог: локальный API (`server/`) — **48 моделей**, цены в **кыргызских сомах (KGS)**

## Запуск

```bash
npm install
npm run dev
```

Откроются API (`http://localhost:4000`) и сайт (`http://localhost:5173`).

Только фронт (каталог подгрузится локально без сервера):

```bash
npm run dev:web
```

## Оплата

Кнопки «Оформить заказ» и «Купить сейчас» показывают **демо-заглушку** — реальная оплата не подключена.
