import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "");
const line = env.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
const url = line.replace(/^DATABASE_URL="?([^"]+)"?/, "$1").trim();
const sql = neon(url);

const q = async (text, params = []) => {
  const res = await sql.query(text, params);
  return Array.isArray(res) ? res : res.rows;
};

const cmd = process.argv[2];

if (cmd === "show") {
  console.log(
    JSON.stringify(
      await q(
        "SELECT id, type, project, description, archived, snoozed_until, created_at FROM posts ORDER BY id DESC LIMIT 10"
      )
    )
  );
} else if (cmd === "backdate") {
  console.log(
    "backdated:",
    JSON.stringify(
      await q(
        "UPDATE posts SET created_at = now() - interval '4 days', snoozed_until = NULL WHERE project LIKE 'TEST%' OR description LIKE 'TEST%' RETURNING id, created_at"
      )
    )
  );
} else if (cmd === "expire-snooze") {
  console.log(
    "snooze expired:",
    JSON.stringify(
      await q(
        "UPDATE posts SET snoozed_until = now() - interval '1 hour' WHERE project LIKE 'TEST%' OR description LIKE 'TEST%' RETURNING id, snoozed_until"
      )
    )
  );
} else if (cmd === "cleanup") {
  console.log(
    "deleted:",
    JSON.stringify(await q("DELETE FROM posts WHERE project LIKE 'TEST%' OR description LIKE 'TEST%' RETURNING id"))
  );
  await q("DELETE FROM analytics_events");
  console.log("events cleared");
  console.log("remaining:", JSON.stringify(await q("SELECT count(*)::int AS c FROM posts")));
} else {
  console.log("usage: show|backdate|expire-snooze|cleanup");
}
