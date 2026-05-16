# Rural Smart Kisan Backend

Express API for Rural Smart Kisan with JWT authentication, bcrypt password hashing, and Supabase PostgreSQL storage.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your Supabase PostgreSQL connection string.
3. Set `JWT_SECRET` to a long random value.
4. Run:

```bash
npm install
npm run dev
```

The API starts on `http://localhost:4000` by default. Tables are created automatically on startup.

## Seed Demo Data

```bash
npm run seed
```

Demo login:

- Email: `former1@example.com`
- Password: `Charan@9642`

## Main Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `GET /api/products`
- `POST /api/products`
- `POST /api/products/:id/feedback`
- `POST /api/products/:id/like`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/cold-storage/requests`
- `GET /api/features/monitor/sensor-data`
- `POST /api/features/disease/analyze`
- `POST /api/features/crop/recommend`
- `GET /api/features/weather`
- `GET /api/features/market-trends`
