# Tasvirnigor Studio Website

A professional one-page website with full CMS admin panel for Tasvirnigor film and animation studio from Tajikistan.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/tasvirnigor run dev` — run the frontend (port 19998)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, framer-motion, shadcn/ui
- API: Express 5 with express-session for admin auth
- DB: PostgreSQL + Drizzle ORM
- File Storage: Supabase Storage (project-banners, team-photos buckets)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/` — DB tables: projects.ts, team.ts, content.ts
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/supabase.ts` — Supabase client (service role)
- `artifacts/api-server/src/middlewares/auth.ts` — Admin session guard
- `artifacts/tasvirnigor/src/pages/` — Home, AdminLogin, AdminDashboard
- `artifacts/tasvirnigor/src/components/sections/` — Hero, About, Services, Portfolio, Team, Contacts

## Architecture decisions

- Password-only admin auth using express-session (no user accounts needed for single-admin CMS)
- Supabase Storage used exclusively for file uploads (project banners, team photos); two public buckets created: `project-banners` and `team-photos`
- Content tables (about, contacts) use upsert pattern — always exactly one row
- Admin routes protected by `requireAdmin` middleware checking session.isAdmin
- Frontend uses generated Orval hooks for all API calls; raw fetch only for multipart file uploads

## Product

- Public one-page website: Hero, About, Services (static), Portfolio (YouTube links), Team, Contacts
- Admin panel at `/admin` — password protected CMS to manage projects, team, about text, and contact info
- File uploads from computer/phone for project banners and team member photos

## User preferences

- Clean white/light layout with premium amber/gold accent (#C4910A range, hsl 38 82% 42%)
- Dark cinematic hero section and dark footer for contrast
- AnimationSchool.ru-inspired structure: bold typography, generous spacing, clean cards
- No emojis in the UI
- Supabase Storage for file uploads (not object storage or local disk)

## Gotchas

- Supabase buckets (`project-banners`, `team-photos`) must be public — already created
- `SESSION_SECRET` env var required for express-session
- `ADMIN_PASSWORD` env var sets the admin panel password
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` required for file uploads
- After schema changes: run `pnpm --filter @workspace/db run push` then restart API workflow

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
