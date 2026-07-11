# ASP Cranes — Website & CMS

Full-stack web application for ASP Cranes (Aadishakti Projects) — a professional crane rental company headquartered in Raipur, Chhattisgarh.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (access + refresh tokens), RBAC |

## Project Structure

```
asp-cranes-fixed/
├── backend_asp/        # Express API server
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/      # Auth & RBAC middleware
│   └── utils/          # Seed script
└── frontend_asp/       # Next.js application
    ├── app/(admin)/    # Admin CMS panel
    ├── app/(frontend)/ # Public website
    ├── components/     # Shared components
    └── store/          # Zustand auth store
```

## Setup

### Backend
```bash
cd backend_asp
cp .env.example .env       # fill in your values
npm install
node utils/seed.js         # seed initial data
npm run dev
```

### Frontend
```bash
cd frontend_asp
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Admin CMS

- URL: `http://localhost:3100/admin`
- Superadmin: `superadmin@aspcranes.com` / `Admin@123`
- Admin: `admin@aspcranes.com` / `Admin@123`

## Features

- Public website: Homepage, About, Cranes, Services, Projects, Blog, Careers, Contact
- Admin CMS with RBAC — superadmin controls page-level access per admin
- Real-time access revocation
- Live weather widget (Raipur) — powered by Open-Meteo
- Notifications system
- JWT with auto-refresh
