# VladOPT Production (Docker)

Проект запускается в Docker как 2 контейнера:
- `app` (Node.js/Express + frontend build)
- `db` (PostgreSQL)

`uploads` и `.env` хранятся на сервере снаружи контейнера.

## 1) Что нужно на VDS
- Docker
- Docker Compose plugin (`docker compose`)
- Домен с HTTPS (для Google OAuth)

## 2) Быстрый старт
```bash
cp .env.example .env
mkdir -p uploads
chmod 600 .env
nano .env
docker compose up -d --build
```

После этого сайт доступен на порту `5000` сервера.

## 3) Что заполнить в `.env`
Обязательные поля:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `PORT` (обычно `5000`)
- `AUTH_MODE=google`
- `SESSION_SECRET`
- `ADMIN_EMAILS`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL=https://vladopt.ru/api/callback`
- SMTP: `SMTP_URL` **или** `SMTP_HOST` + `SMTP_PORT` + `SMTP_SECURE` + `SMTP_USER` + `SMTP_PASS`

Опционально:
- `REQUEST_NOTIFY_EMAIL` (по умолчанию `sale@vladopt.ru`)
- `SMTP_FROM`

`DATABASE_URL` руками задавать не нужно: compose формирует его автоматически как
`postgresql://POSTGRES_USER:POSTGRES_PASSWORD@db:5432/POSTGRES_DB`.

## 4) Управление
Запуск/обновление:
```bash
docker compose up -d --build
```

Проверка:
```bash
docker compose ps
docker compose logs -f app
```

Остановка:
```bash
docker compose down
```

## 5) Что уже сделано в конфиге
- БД поднимается в контейнере `postgres:16-alpine`.
- Данные БД сохраняются в Docker volume `postgres_data`.
- `uploads` сохраняются на хосте через bind mount `./uploads:/app/uploads`.
- Приложение при старте выполняет `npm run db:push`, затем запускается.
- `.env` не попадает в Docker-образ (`.dockerignore`).

## 6) Google OAuth
В Google Cloud Console у OAuth-клиента должны быть:
- Authorized JavaScript origins: `https://vladopt.ru`
- Authorized redirect URI: `https://vladopt.ru/api/callback`

Без HTTPS Google-вход в production работать корректно не будет.

## 7) Бэкап БД
Сделать дамп:
```bash
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
```

Восстановить из дампа:
```bash
cat backup.sql | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```
