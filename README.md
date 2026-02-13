# Idriss Music Promos HQ

Production-ready MVP for managing the full music promo workflow: leads, outreach, campaigns, edits, and payouts.

## Stack
- Next.js App Router + TypeScript
- TailwindCSS (sleek dark UI, gradient accents, motion)
- Supabase (Postgres + Auth)
- Row Level Security (RLS) by `owner_id = auth.uid()`

## 1) Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env:
   ```bash
   cp .env.example .env.local
   ```
3. Add your Supabase values into `.env.local`.
4. Apply SQL migration in Supabase SQL editor:
   - `supabase/migrations/20260213190000_init_idriss_hq.sql`
5. Create at least one auth user via Supabase Auth (email/password).
6. Run dev server:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:3000/auth/login`.

## 2) Supabase notes
- Migration creates all core tables + FKs + timestamp triggers.
- `compute_editor_payout_cents` enforces payout rules in DB.
- `create_or_refresh_payout_for_edit` stores computed payout in `payouts.amount_cents`.
- `campaign_profitability` view tracks `my_revenue`, payouts total, and profit estimate.
- RLS is enabled across all mutable tables and restricted to owner records.

## 3) Feature map
- `/dashboard`: KPI snapshot (active campaigns, leads, payouts due, profit)
- `/artists`: CRUD leads, search + status filters
- `/artists/[id]`: artist detail with conversations and campaigns
- `/conversations`: outreach log + follow-up scheduling
- `/campaigns`: CRUD campaigns + status filter
- `/campaigns/[id]`: edits assignment + payout compute controls
- `/editors`: editor roster CRUD
- `/payouts`: pending payouts with “mark paid” action

## 4) Deployment (Vercel)
1. Push repo to GitHub.
2. Import in Vercel.
3. Set env vars from `.env.example` in Vercel Project Settings.
4. Deploy.
5. Ensure Supabase URL allows your deployed domain in auth redirect settings.

## 5) MVP extension ideas
- Replace inline forms with modal forms and optimistic updates.
- Add reusable toast provider for action feedback.
- Add pagination controls backed by range queries.
- Add automation jobs (scheduled follow-ups, payout reminders).
