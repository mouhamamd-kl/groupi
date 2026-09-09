import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "");
const line = env.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
if (!line) throw new Error("DATABASE_URL not found in .env.local");
const url = line.replace(/^DATABASE_URL="?([^"]+)"?/, "$1").trim();
const sql = neon(url);

await sql`CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
)`;

await sql`CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY,
  account_id text NOT NULL,
  provider_id text NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)`;

await sql`CREATE TABLE IF NOT EXISTS posts (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  project text,
  year integer,
  description text NOT NULL,
  name text NOT NULL,
  contact text NOT NULL,
  github text,
  specialization text,
  meta text NOT NULL DEFAULT 'طالب جامعي',
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id text REFERENCES "user"(id) ON DELETE SET NULL
)`;

await sql`CREATE TABLE IF NOT EXISTS years (
  value int PRIMARY KEY,
  label text NOT NULL
)`;

await sql`CREATE TABLE IF NOT EXISTS roles (
  value text PRIMARY KEY,
  label text NOT NULL
)`;

await sql`CREATE TABLE IF NOT EXISTS post_roles (
  post_id bigint REFERENCES posts(id) ON DELETE CASCADE,
  role_value text REFERENCES roles(value) ON DELETE CASCADE,
  PRIMARY KEY (post_id, role_value)
)`;

console.log("Tables created");

const roles = [
  { value: "general", label: "بدون تخصص محدد" },
  { value: "backend", label: "مطوّر Backend" },
  { value: "frontend", label: "مطوّر Frontend" },
  { value: "uiux", label: "مصمم UI/UX" },
  { value: "qatester", label: "مختبر QA" },
  { value: "mobile", label: "مطوّر Mobile" },
  { value: "database", label: "مهندس Database" },
  { value: "ai", label: "متخصص AI / Data" },
  { value: "devops", label: "مهندس DevOps" },
  { value: "security", label: "متخصص Security" },
];

const years = [
  { value: 1, label: "السنة الأولى" },
  { value: 2, label: "السنة الثانية" },
  { value: 3, label: "السنة الثالثة" },
  { value: 4, label: "السنة الرابعة" },
  { value: 5, label: "السنة الخامسة" },
];

for (const r of roles) {
  await sql`INSERT INTO roles (value, label) VALUES (${r.value}, ${r.label}) ON CONFLICT DO NOTHING`;
}
console.log(`Seeded ${roles.length} roles`);

for (const y of years) {
  await sql`INSERT INTO years (value, label) VALUES (${y.value}, ${y.label}) ON CONFLICT DO NOTHING`;
}
console.log(`Seeded ${years.length} years`);

const count = await sql`SELECT (SELECT count(*)::int FROM roles) AS roles, (SELECT count(*)::int FROM years) AS years`;
console.log("Counts:", JSON.stringify(count));
