import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "");
const line = env.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
if (!line) throw new Error("DATABASE_URL not found in .env.local");
const url = line.replace(/^DATABASE_URL="?([^"]+)"?/, "$1").trim();
const sql = neon(url);

const tables = [
  "analytics_events",
  "post_roles",
  "posts",
  "years",
  "roles",
  "session",
  "account",
  "verification",
  '"user"',
];

const counts = {};
for (const t of tables) {
  try {
    const res = await sql.query(`SELECT count(*)::int AS c FROM ${t}`);
    const rows = Array.isArray(res) ? res : res.rows;
    counts[t] = rows[0].c;
  } catch {
    counts[t] = "missing";
  }
}
console.log("Row counts:", JSON.stringify(counts));

if (!process.argv.includes("--confirm")) {
  console.log("Dry run. Re-run with --confirm to DROP all tables.");
  process.exit(0);
}

for (const t of tables) {
  await sql.query(`DROP TABLE IF EXISTS ${t} CASCADE`);
}
console.log("All tables dropped.");
