# SmartExpense Backend

Express + Sequelize + PostgreSQL API providing authentication endpoints.

## Endpoints
- POST `/api/auth/register` — body: `{ name, email, password }` → returns `{ id, name, email, token }`
- POST `/api/auth/login` — body: `{ email, password }` → returns `{ id, name, email, token }`

## Environment
Copy `.env.example` to `.env` and adjust as needed.

Important:
- `JWT_SECRET` — set a strong random value in production.
- Database via `DATABASE_URL` or `DB_*` fields.

## Run locally
- `npm install`
- `npm run dev`

The server will attempt to connect to PostgreSQL and sync models on startup.
