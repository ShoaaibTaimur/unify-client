# UNIFY Frontend

Frontend for UNIFY, an academic activity portal for students, class representatives, teachers, and administrators. It provides public class schedules, role-based dashboards, activity management, organization management, and user administration.

## Technology

- Next.js 16 with App Router and Turbopack
- React 19 and TypeScript 6
- Tailwind CSS 4
- Redux Toolkit and RTK Query
- React Hook Form and Zod
- Radix UI primitives and reusable local UI components
- Lucide React icons
- Sonner notifications
- Vercel Analytics

## Requirements

- Node.js 20 or newer
- npm
- Running UNIFY backend API

## Local setup

From the `client` directory:

```bash
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).

Set the backend origin in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Do not include a trailing slash. Authentication uses backend-owned HttpOnly cookies, so the backend must allow credentialed requests from the frontend origin.

## Scripts

```bash
npm run dev       # Start development server with Turbopack
npm run build     # Create production build with Turbopack
npm run start     # Start production server
npm run lint      # Lint application source
npm test          # Run Node test suite
```

Run a full local check with:

```bash
npm run lint
npm test
npx tsc --noEmit --incremental false
npm run build
```

## Routes

Route groups organize files without changing URLs.

### Public routes

- `/` - class activity overview
- `/activities` - filtered activity directory
- `/calendar` - monthly activity calendar

### Authentication routes

- `/login` - portal sign-in
- `/change-password` - required or voluntary password update

### Dashboard routes

- `/cr` - class representative dashboard
- `/teacher` - teacher dashboard
- `/admin` - administrator overview
- `/admin/activities` - university-wide activity management
- `/admin/organization` - department, batch, and section management
- `/admin/users` - account and role management

## Project structure

```text
client/
|-- app/
|   |-- (public)/            Public route group
|   |-- (auth)/              Authentication route group
|   `-- (dashboard)/         Role-protected dashboard route group
|-- components/
|   |-- common/              Shared application components
|   |-- layout/              Site and dashboard layouts
|   `-- ui/                  Reusable UI primitives
|-- features/                Domain-specific screens and components
|   |-- activities/
|   |-- admin/
|   |-- auth/
|   |-- calendar/
|   |-- class-selection/
|   |-- dashboard/
|   `-- home/
|-- lib/                     API, authentication, state, and utilities
|-- public/                  Static assets
|-- styles/                  Global CSS and Tailwind theme styles
|-- test/                    Node tests
`-- types/                   Shared TypeScript declarations
```

Keep route files small. Route files should define metadata and render a feature component. Feature-specific code belongs in `features/<feature>`. Components used across features belong in `components`. Shared declarations belong in `types`.

## Application architecture

### Data and state

`lib/api.ts` defines the RTK Query API layer. Queries cache dashboard, activity, organization, and user data. Mutations invalidate relevant cache tags.

`lib/state.tsx` creates the Redux store, verifies the current session, provides application state, and listens for server-sent update events. Live updates invalidate affected RTK Query data.

### Authentication

`lib/auth-client.ts` communicates with backend authentication endpoints using credentialed requests. Access and refresh tokens remain in HttpOnly cookies rather than browser-managed tokens. Session refresh is coordinated across tabs, and authentication changes are synchronized through `BroadcastChannel`.

Dashboard layouts enforce role access for `admin`, `cr`, and `teacher`. Users marked for a password change are redirected to `/change-password`.

### Styling

Global styles live in `styles/globals.css`. Tailwind CSS is configured through `postcss.config.mjs`. Theme preference is stored under `unify_theme`, with system preference used when no saved theme exists.

### Imports

Use the `@/` alias for paths relative to the `client` directory:

```ts
import { ActivitiesContent } from "@/features/activities/ActivitiesContent";
```

## Deployment

The project is configured for Vercel through `vercel.json`. Configure `NEXT_PUBLIC_API_URL` in the deployment environment before building. The production backend must permit credentialed requests from the deployed frontend origin and use cookie settings appropriate for HTTPS and the selected domains.
