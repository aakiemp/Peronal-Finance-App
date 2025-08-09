# LedgerIQ – Personal Finance Tracker (MVP)

## Tech Stack
- Next.js 14 App Router (TypeScript, Tailwind CSS)
- Supabase (Auth, Postgres, RLS)
- React Query, shadcn/ui, React Hook Form, Zod, Recharts
- Vitest + React Testing Library

## Getting Started
1. Copy envs
```
cp .env.example .env.local
```
Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project.

2. Install deps
```
npm i
```

3. DB schema
- Open Supabase SQL editor and run `sql/migrations/0001_init.sql`.
- This creates tables, RLS, and seeds system categories per user on signup.

4. Dev server
```
npm run dev
```

## Deploy
- Frontend: Vercel
  - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` envs
- Database: Supabase Cloud

## Scripts
- `db:push`: Run the SQL in Supabase SQL editor (manual) or CLI.

## Notes
- Money is stored in cents (bigint); never use floats.
- All mutations are server actions validated with Zod.
- RLS ensures users only access their own rows.

## Database schema (Supabase)
- Run `sql/migrations/0001_init.sql` in the SQL editor
- Confirm RLS policies are active
- Add an email auth provider (magic link)

## Auth routes
- `/login` – email magic link
- `/auth/callback` – Supabase helper callback

## Pages
- `/` Dashboard
- `/accounts` Accounts list and create
- `/transactions` Recent transactions and add
- `/budgets` Create budgets and list
- `/import` CSV import with de-dupe via `import_hash`
- `/settings` Manage categories

## Shadcn/ui (optional)
This template uses minimal native elements for speed. To add shadcn:
```
npx shadcn-ui@latest init -y
npx shadcn-ui@latest add button input dialog sheet card badge progress table tabs select tooltip toast
```
