# UNIFY — Academic Activity Management Portal

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**UNIFY** is a modern, unified academic management portal designed for university students, Class Representatives (CRs), teachers, and administrators. It consolidates Class Tests (CTs), Labs, Viva, Assignments, and Term Exams into one intuitive dashboard — organized by **Department**, **Batch**, and **Section**.

---

## ⚡ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Shadcn UI, Radix Primitives
- **Data & State**: TanStack React Query v5, Browser LocalStorage Session
- **Icons & UI Utilities**: Lucide Icons, Date-fns v4, Sonner Toasts, Recharts
- **Backend API**: Node.js, Express.js REST API, JWT Authentication, Zod
- **Analytics & Hosting**: Vercel Analytics, Vercel Serverless

---

## 🚀 Key Features

- **Academic Activity Tracking**: See today's activities, interactive countdown card for next deadline (click for exam details), and upcoming deadlines across courses.
- **Role-Based Access Control**:
  - **Student**: View schedules, upcoming tests, assignment deadlines, and calendar events for their section.
  - **Class Representative (CR)**: Create and update activities (Class Tests, Assignments, Labs, Viva) for their batch and section.
  - **Teacher**: Manage academic schedules across their department.
  - **Admin**: Full administrative management of departments, batches, sections, users, and system settings.
- **Multiple Views**:
  - **Class Dashboard**: Real-time overview of current and upcoming activities.
  - **Activities Directory**: Comprehensive list with category filtering (CT, Assignment, Lab, Viva, Exam) and status tracking.
  - **Calendar View**: Visual month timeline of all academic deadlines.
  - **Admin & CR Consoles**: Dedicated management dashboards.
- **Theme & Branding**: Custom Berry Maroon (`#8B003D`) & Dusty Rose (`#B8748A`) brand palette with full dark mode support. Zero FOUC/flash on reload.

---

## ⚙️ Environment Variables

### Client (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://unify-backend.vercel.app
```

### Server (`server/.env`)
```env
JWT_SECRET=your_secure_jwt_secret_key
PORT=3001
```

---

## 📦 Getting Started

### 1. Install dependencies & run client
```bash
npm install
npm run dev
```

The Next.js app will start locally at `http://localhost:3000`.

### 2. Run server (Backend API)
```bash
cd ../server
npm install
npm run dev
```

The API server will listen at `http://localhost:3001`.

---

## 🔑 Demo Credentials

- **Admin**: `admin@unify.edu` / `password`
- **CR**: `cr@unify.edu` / `password`
- **Teacher**: `teacher@unify.edu` / `password`
