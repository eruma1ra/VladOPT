# VladOPT: Setup and Deploy

## Secrets and `.env`
- `.env` is private and must never be committed to git.
- `.env.example` is public and contains only placeholders.
- In production, preferred approach is environment variables in hosting panel (Render/Railway/Fly/Cloud/etc.).
- If you deploy to your own VPS, keep `.env` on server only, with restricted permissions (`chmod 600 .env`).

## Required environment variables
- `DATABASE_URL`
- `AUTH_MODE` (`google` for production, `local` only for local dev)
- `SESSION_SECRET` (required when `AUTH_MODE` is not `local`)
- `ADMIN_EMAILS` (required when `AUTH_MODE` is not `local`, comma-separated)
- `GOOGLE_CLIENT_ID` (required when `AUTH_MODE=google`)
- `GOOGLE_CLIENT_SECRET` (required when `AUTH_MODE=google`)
- `GOOGLE_CALLBACK_URL` (required when `AUTH_MODE=google`, example `https://YOUR_DOMAIN/api/callback`)
- `PORT` optional (default `5000`)
- `REPL_ID` optional legacy mode (only when `AUTH_MODE=replit`)
- `ISSUER_URL` optional legacy mode (default `https://replit.com/oidc`)

## Local development
1. Install dependencies:
```bash
npm install
```
2. Create local env:
```bash
cp .env.example .env
```
3. Create local database (if missing):
```bash
createdb vladopt_local
```
4. Apply DB schema:
```bash
npm run db:push
```
Optional demo data (products/categories/news):
```bash
npm run seed:demo
```
5. Run checks:
```bash
npm run doctor
```
6. Start app:
```bash
npm run dev
```
If port `5000` is busy:
```bash
PORT=5050 npm run dev
```

## Production deploy (VPS example)
1. Upload project to server, then:
```bash
npm ci
```
2. Create `.env` on server (do not commit it):
```bash
cp .env.production.example .env
chmod 600 .env
```
3. Edit `.env` for production:
- set `AUTH_MODE=google`
- set real `DATABASE_URL`
- set strong `SESSION_SECRET` (32+ random chars)
- set `ADMIN_EMAILS` with your exact admin emails
- set `GOOGLE_CLIENT_ID`
- set `GOOGLE_CLIENT_SECRET`
- set `GOOGLE_CALLBACK_URL=https://vladopt.ru/api/callback`
4. Validate configuration and DB connection:
```bash
npm run doctor:prod
```
5. Apply schema:
```bash
npm run db:push
```
6. Build and start:
```bash
npm run build
npm run start
```

## Security behavior implemented
- Production blocks startup if `AUTH_MODE=local`.
- In `AUTH_MODE=google`, startup fails if any required auth variable is missing.
- Only emails from `ADMIN_EMAILS` can complete login and use admin APIs.
- Non-admin users receive `403 Forbidden`.
- Admin API routes are protected by server-side `isAdmin` middleware.

## Google Console setup
1. Open Google Cloud Console -> APIs & Services -> Credentials.
2. Create OAuth 2.0 Client ID (`Web application`).
3. Add Authorized redirect URI:
`https://vladopt.ru/api/callback`
4. Copy `Client ID` and `Client Secret` into `.env`:
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

## Useful diagnostics
- Full env/db check:
```bash
npm run doctor
```
- Show available tables:
```bash
psql "$DATABASE_URL" -c '\dt'
```
