# MoneySecurity

- `backend/` — Express API (Node.js, PostgreSQL via `pg`)
- `frontend/` — Vue 3 SPA (Vite, Vue Router)

## Menjalankan dengan Docker

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/health
- PostgreSQL: localhost:5432 (user/password: `postgres`, db: `moneysecurity`)

## Menjalankan tanpa Docker

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```
