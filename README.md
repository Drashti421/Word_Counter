# Responsive Dashboard With Cards

This project is a full-stack text utility dashboard built with React + Vite (frontend) and Express + MongoDB (backend).

## Stack

- Frontend: React, Vite, TypeScript, Tailwind-style UI components
- Backend: Express, TypeScript, Mongoose, express-session, connect-mongo
- Database: MongoDB Atlas

## Key Features

- Auth: signup, login, logout, session-based auth (httpOnly cookie)
- Forgot password flow:
  - `POST /api/auth/forgot`
  - `POST /api/auth/reset`
- AI Suggestions for draft improvement
- AI Writing generator (prompt-based drafts like leave application / email / resignation)
- Grammar check + text transforms
- History save/load/delete
- Export to TXT / PDF

## Local Development

1. Install frontend dependencies:

```bash
npm i
```

2. Install backend dependencies:

```bash
npm run server:install
```

3. Configure environment files:

- Frontend optional: copy `.env.example` -> `.env`
- Backend required: copy `server/.env.example` -> `server/.env`

4. Run both servers:

```bash
npm run dev:full
```

- Frontend: `http://localhost:5173` (or next free Vite port)
- Backend: `http://localhost:4000`

## Environment Variables

### Backend (`server/.env`)

Required:

- `PORT`
- `MONGODB_URI`
- `CORS_ORIGIN`
- `SESSION_SECRET`

Recommended:

- `MONGO_RETRY_MS`
- `RESET_URL_BASE`

Optional (production email for forgot-password):

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## API Quick Check

- Health: `GET /health`
- Current session user: `GET /api/auth/me`
- Signup: `POST /api/auth/signup`
- Login: `POST /api/auth/login`
- Logout: `POST /api/auth/logout`
- Forgot password: `POST /api/auth/forgot`
- Reset password: `POST /api/auth/reset`

## Testing

Build checks:

```bash
npm --prefix server run build
npm run build
```

Backend auth smoke test (requires running backend):

```bash
npm --prefix server run test:auth
```

## Deployment Recommendation

Best current setup for this codebase:

- Frontend: Netlify (or Vercel)
- Backend: Render
- Database: MongoDB Atlas

### Frontend (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`
- Env: `VITE_API_BASE_URL=https://<your-backend-domain>`

### Backend (Render)

- Build command: `npm --prefix server install && npm --prefix server run build`
- Start command: `node server/dist/index.js`
- Env:
  - `MONGODB_URI`
  - `SESSION_SECRET`
  - `CORS_ORIGIN=https://<your-frontend-domain>`
  - `NODE_ENV=production`
  - `RESET_URL_BASE=https://<your-frontend-domain>/login`
  - (optional) `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

## Architecture Notes

- Session auth is stored in MongoDB (`connect-mongo`) and sent via cookie.
- Backend starts immediately and retries MongoDB connection in background.
- Forgot-password uses short-lived reset tokens hashed in DB.
- In development, reset token is returned in API response for easier testing.
- In production, token should be delivered via email link.

## Tradeoffs / Limitations

- Session-based auth is simple and secure for web apps, but less convenient for non-browser clients.
- AI Writing is template/prompt-based (not external LLM-backed by default).
- Forgot-password email requires external provider configuration in production.

## Security Checklist Before Public Release

- Rotate any exposed DB password immediately.
- Never commit `.env` files.
- Use strong `SESSION_SECRET`.
- Set strict production `CORS_ORIGIN`.
- Enable production email provider for reset flow.

## Interview Demo Flow

1. Signup -> Login
2. Use AI Writing (`generate leave application ...`) -> insert in editor
3. Use Grammar Check / AI Suggestions
4. Save and reload history
5. Forgot password -> reset -> login with new password
6. Logout -> login again
