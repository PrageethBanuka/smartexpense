# SmartExpense Frontend

React app bootstrapped with react-scripts (no Vite) as per proposal.

## Environment
Copy `.env.example` to `.env` and adjust:
- `REACT_APP_API_URL` — Backend base URL (default `http://localhost:4000/api`)

## Scripts
- `npm start` — run dev server on port 3000
- `npm run build` — production build

## Pages
- Login — POST `/api/auth/login`
- Register — POST `/api/auth/register`

API base URL is taken from `REACT_APP_API_URL`.
