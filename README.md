# Groupi (غروبي)

An Arabic RTL web app where university students find project teammates —
either as a **team looking for a member** or a **member looking for a team**.

Live: https://groupi-app.vercel.app

## What it does

- Students publish posts (role, year, specialization, GitHub, Telegram contact)
- Posts older than 3 days get a "did you find a group?" nudge, then auto-archive
- Google sign-in; owners can edit, delete, and reactivate their posts
- Admin-only analytics dashboard

## Stack

Next.js 16 · React 19 · Tailwind v4 · Drizzle ORM · Neon Postgres · Better Auth · Vercel

## Run it

```bash
npm install
npm run dev
```

Needs a `.env.local` with `DATABASE_URL`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`ADMIN_EMAILS`, and `CRON_SECRET`. Tables self-initialize on first load.

Deploy: `vercel --prod`
