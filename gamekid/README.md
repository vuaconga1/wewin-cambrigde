# wewin-cambrigde — WeWIN Education Fullstack Platform

A modern full-stack system for education management, IELTS testing, class management, and student workflows.

This project includes:

- **Frontend:** Next.js App Router, Tailwind CSS, Framer Motion, NextAuth
- **Backend:** NestJS API with Prisma/TypeORM

## Folder Structure

```
wewin-cambrigde/
├── frontend/     # Next.js app (deploy to Vercel)
├── backend/      # NestJS API
└── scripts/
```

## Development

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Backend

```bash
cd backend
pnpm install
pnpm start:dev
```

## Environment Variables

### Frontend (`frontend/.env.local`)

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`backend/.env`)

```
PORT=3001
DATABASE_URL=your-db-url
JWT_SECRET=your-secret
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

## Deployment

- **Frontend:** Vercel (set Root Directory = `frontend`)
- **Backend:** Railway, Render, or Docker
