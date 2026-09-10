# Groupi (غروبي)

An Arabic RTL platform where university students find project teammates.
Students post either as a **team looking for a member** or a **member looking
for a team**, then connect over Telegram.

Live: https://groupi-app.vercel.app

## Features

- **Team & member posts** — roles, academic year, optional description
- **Specializations** — required for years 4–5 (networking / software / AI)
- **GitHub links** — optional, on member posts
- **Telegram contact modal** — contact actions are logged for analytics
- **Google sign-in** (Better Auth) — owners can edit, delete, and reactivate
  their posts
- **3-day post lifecycle** — stale posts trigger a "did you find a group?"
  nudge for the owner, otherwise they auto-archive; archived posts stay
  visible to the owner in "my posts" with a reactivate option
- **Admin analytics dashboard** — traffic, funnel, and engagement charts
  (allowlisted emails only)

## Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19, TypeScript  |
| Styling  | Tailwind CSS v4, custom Arabic fonts            |
| Database | Neon Postgres via Drizzle ORM (no migrations — schema self-initializes on boot) |
| Auth     | Better Auth with Google OAuth                   |
| Charts   | recharts (admin dashboard)                      |
| Hosting / cron | Vercel (daily archive job)                |

## Project structure

```
src/
  app/            # routes: / (feed), /dashboard, /api/auth, /api/cron/archive
  components/     # feed, post modal, contact modal, nudge modal, layout
  lib/            # db + schema, posts, auth, analytics, specializations
scripts/
  seed-data.mjs   # create tables + seed roles/years
  reset-db.mjs    # row counts; --confirm drops all tables
  nudge-test.mjs  # archive-lifecycle test helpers (show/backdate/expire-snooze/cleanup)
```

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. On first load the app creates all tables and
seeds roles/years automatically.

### Environment variables

Create `.env.local` (git-ignored):

| Variable              | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `DATABASE_URL`        | Neon Postgres connection string                      |
| `BETTER_AUTH_SECRET`  | Auth signing secret                                  |
| `BETTER_AUTH_URL`     | Base URL (`http://localhost:3000` locally)           |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials               |
| `ADMIN_EMAILS`        | Comma-separated dashboard allowlist                  |
| `CRON_SECRET`         | Bearer token protecting `/api/cron/archive`          |

Google Cloud Console → authorized redirect URI:

- Local: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://groupi-app.vercel.app/api/auth/callback/google`

### npm scripts

| Command       | Purpose                  |
| ------------- | ------------------------ |
| `npm run dev` | Start dev server         |
| `npm run build` | Production build       |
| `npm start`   | Serve production build   |
| `npm run lint` | ESLint                  |

## Deployment

There is no Vercel git integration — deploys are manual:

```bash
vercel --prod
```

Set all production env vars in the Vercel dashboard/CLI first
(`DATABASE_URL`, `BETTER_AUTH_*` pointing at the prod URL, Google creds,
`ADMIN_EMAILS`, `CRON_SECRET` as a Secret).

### Archive cron job

`vercel.json` registers `GET /api/cron/archive` daily at `02:00 UTC`.
It requires `Authorization: Bearer $CRON_SECRET` and returns
`{ ok: true, archived: n }`. Notes:

- Cron jobs run on **production deployments only**.
- On the Hobby plan the minimum frequency is **once daily**, so a post can
  archive up to ~24h after its exact 3-day birthday.
- The page-load sweep in `page.tsx` remains as a backstop.

## How archiving works

Each post carries `archived` (bool) and `snoozed_until` (nullable timestamp).
A post becomes due 72 hours after `created_at` (computed live in SQL — there
is no stored deadline and no background worker besides the cron job):

- **Owner visits after the birthday** → one-at-a-time popup:
  “found a group?” Yes → archived; No → snoozed 3 more days; dismiss → asks
  again next visit.
- **Owner never visits** → the next sweep (cron or any page load) archives it
  automatically.
- Archived posts leave the public feeds but stay in the owner's “my posts”
  with a badge and a reactivate button.
