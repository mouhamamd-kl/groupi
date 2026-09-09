import "server-only";

import { sql } from "drizzle-orm";

import { db, initDb } from "./db";

type Row = Record<string, unknown>;

const WEEKDAY_LABELS = [
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
  "الأحد",
];

function rowsOf(result: unknown): Row[] {
  const candidate = result as { rows?: Row[] } | Row[];

  if (Array.isArray(candidate)) return candidate;

  return candidate.rows ?? [];
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("ar", {
    day: "numeric",
    month: "short",
  });
}

export interface ActivityPoint {
  label: string;
  views: number;
  posts: number;
  contacts: number;
}

export async function pruneEvents(olderThanDays = 90): Promise<void> {
  await initDb();

  await db.execute(sql`
    DELETE FROM analytics_events
    WHERE created_at < now() - make_interval(days => ${olderThanDays});
  `);
}

export async function getActivitySeries(days = 14): Promise<ActivityPoint[]> {
  await initDb();

  const result = await db.execute(sql`
    SELECT date_trunc('day', created_at)::date AS day, type, count(*) AS count
    FROM analytics_events
    WHERE created_at >= now() - make_interval(days => ${days})
    GROUP BY 1, 2
  `);

  const byDay = new Map<string, ActivityPoint>();
  const today = new Date();
  const points: ActivityPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - offset);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { label: formatDay(key), views: 0, posts: 0, contacts: 0 });
  }

  for (const row of rowsOf(result)) {
    const day = String(row.day);
    const point = byDay.get(day);
    if (!point) continue;

    const type = String(row.type);
    if (type === "page_view") point.views = num(row.count);
    else if (type === "post_created") point.posts = num(row.count);
    else if (type === "contact_opened") point.contacts = num(row.count);
  }

  for (const point of byDay.values()) points.push(point);

  return points;
}

export interface Totals {
  views: number;
  posts: number;
  contacts: number;
  signups: number;
}

export async function getTotals(days = 30): Promise<Totals> {
  await initDb();

  const result = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM analytics_events
        WHERE type = 'page_view' AND created_at >= now() - make_interval(days => ${days})) AS views,
      (SELECT count(*) FROM analytics_events
        WHERE type = 'post_created' AND created_at >= now() - make_interval(days => ${days})) AS posts,
      (SELECT count(*) FROM analytics_events
        WHERE type = 'contact_opened' AND created_at >= now() - make_interval(days => ${days})) AS contacts,
      (SELECT count(*) FROM "user"
        WHERE created_at >= now() - make_interval(days => ${days})) AS signups
  `);

  const row = rowsOf(result)[0] ?? {};

  return {
    views: num(row.views),
    posts: num(row.posts),
    contacts: num(row.contacts),
    signups: num(row.signups),
  };
}

export interface RoleStat {
  value: string;
  label: string;
  posts: number;
  contacts: number;
}

export async function getTopRoles(limit = 8, days = 30): Promise<RoleStat[]> {
  await initDb();

  const result = await db.execute(sql`
    SELECT r.value, r.label,
      COALESCE(rp.posts, 0) AS posts,
      COALESCE(rc.contacts, 0) AS contacts
    FROM roles r
    LEFT JOIN (
      SELECT pr.role_value, count(DISTINCT pr.post_id) AS posts
      FROM post_roles pr
      JOIN posts p ON p.id = pr.post_id
      WHERE p.created_at >= now() - make_interval(days => ${days})
      GROUP BY pr.role_value
    ) rp ON rp.role_value = r.value
    LEFT JOIN (
      SELECT pr.role_value, count(*) AS contacts
      FROM analytics_events e
      JOIN post_roles pr ON pr.post_id = e.post_id
      WHERE e.type = 'contact_opened'
        AND e.created_at >= now() - make_interval(days => ${days})
      GROUP BY pr.role_value
    ) rc ON rc.role_value = r.value
    ORDER BY rp.posts + rc.contacts DESC, rp.posts DESC
    LIMIT ${limit}
  `);

  return rowsOf(result).map((row) => ({
    value: String(row.value),
    label: String(row.label),
    posts: num(row.posts),
    contacts: num(row.contacts),
  }));
}

export interface HourStat {
  hour: number;
  label: string;
  count: number;
}

export async function getHourHistogram(days = 30): Promise<HourStat[]> {
  await initDb();

  const result = await db.execute(sql`
    SELECT EXTRACT(hour FROM created_at)::int AS hour, count(*) AS count
    FROM analytics_events
    WHERE created_at >= now() - make_interval(days => ${days})
    GROUP BY 1
    ORDER BY 1
  `);

  const counts = new Map<number, number>();
  for (const row of rowsOf(result)) counts.set(num(row.hour), num(row.count));

  const hours: HourStat[] = [];
  for (let h = 0; h < 24; h++) {
    hours.push({ hour: h, label: `${h}:00`, count: counts.get(h) ?? 0 });
  }

  return hours;
}

export interface WeekdayStat {
  label: string;
  count: number;
}

export async function getWeekdayHistogram(days = 30): Promise<WeekdayStat[]> {
  await initDb();

  const result = await db.execute(sql`
    SELECT EXTRACT(isodow FROM created_at)::int AS dow, count(*) AS count
    FROM analytics_events
    WHERE created_at >= now() - make_interval(days => ${days})
    GROUP BY 1
    ORDER BY 1
  `);

  const counts = new Map<number, number>();
  for (const row of rowsOf(result)) counts.set(num(row.dow), num(row.count));

  return WEEKDAY_LABELS.map((label, index) => ({
    label,
    count: counts.get(index + 1) ?? 0,
  }));
}

export interface Funnel {
  published: number;
  contacted: number;
  contactEvents: number;
}

export async function getFunnel(days = 30): Promise<Funnel> {
  await initDb();

  const result = await db.execute(sql`
    SELECT
      (SELECT count(*) FROM posts WHERE created_at >= now() - make_interval(days => ${days})) AS published,
      (SELECT count(DISTINCT post_id) FROM analytics_events
        WHERE type = 'contact_opened' AND post_id IS NOT NULL
          AND created_at >= now() - make_interval(days => ${days})) AS contacted,
      (SELECT count(*) FROM analytics_events
        WHERE type = 'contact_opened' AND created_at >= now() - make_interval(days => ${days})) AS contact_events
  `);

  const row = rowsOf(result)[0] ?? {};

  return {
    published: num(row.published),
    contacted: num(row.contacted),
    contactEvents: num(row.contact_events),
  };
}