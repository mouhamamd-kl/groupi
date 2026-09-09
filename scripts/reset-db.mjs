import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const env = readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "");
const line = env.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));

if (!line) throw new Error("DATABASE_URL not found in .env.local");

const url = line.replace(/^DATABASE_URL="?([^"]+)"?/, "$1");
const sql = neon(url);

await sql`DROP TABLE IF EXISTS years, roles, post_roles, posts, session, account, verification, "user" CASCADE;`;

console.log("Wiped: years, roles, post_roles, posts, session, account, verification, user");