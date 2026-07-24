# UNIFY — Academic Activity Management Portal

**UNIFY** is a modern, unified academic management portal designed for university students, Class Representatives (CRs), teachers, and administrators. It consolidates Class Tests (CTs), Labs, Viva, Assignments, and Term Exams into one intuitive dashboard — organized by **Department**, **Batch**, and **Section**.

---

## 🚀 Key Features

- **Academic Activity Tracking**: See what's today, what's next, and what's coming up across all your courses.
- **Role-Based Access Control**:
  - **Student**: View schedules, upcoming tests, assignment deadlines, and calendar events for their section.
  - **Class Representative (CR)**: Create and update activities (Class Tests, Assignments, Labs, Viva) for their batch and section.
  - **Teacher**: Manage academic schedules across their department.
  - **Admin**: Full administrative management of departments, batches, sections, users, and system settings.
- **Multiple Views**:
  - **Class Dashboard**: Real-time overview of current and upcoming activities.
  - **Activities Directory**: Comprehensive list with category filtering (CT, Assignment, Lab, Viva, Exam) and status tracking.
  - **Calendar View**: Visual month/week timeline of all academic deadlines.
  - **Admin & CR Consoles**: Dedicated management dashboards.
- **Theme & Branding**: Custom Maroon (`#800000`) & Dusty Rose (`#B8748A`) brand palette with full dark mode support.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TanStack Start, TanStack Router, TypeScript
- **Styling & UI**: Tailwind CSS, Shadcn UI / Radix Primitives, Lucide Icons, `date-fns`
- **Backend API**: Node.js, Express, JWT Authentication, Zod
- **Build & Deploy**: Vite, Nitro, Vercel

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:3001 # Or your deployed Vercel backend API URL
```

### Server (`server/.env`)
```env
JWT_SECRET=your_secure_jwt_secret_key
PORT=3001
```

---

## 📦 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/ShoaaibTaimur/unify-client.git
cd unify-client
```

### 2. Install dependencies & run client
```bash
npm install
npm run dev
```

The client will start locally at `http://localhost:3000`.

### 3. Run server (Backend API)
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
