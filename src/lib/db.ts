import "server-only";

import { sql } from "drizzle-orm";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { roles, years } from "./schema";
import { roleSeeds, yearSeeds } from "./seed";

type NeonClient = NeonQueryFunction<false, false>;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

function isTransientDbError(error: unknown): boolean {
  let current: unknown = error;

  while (current && typeof current === "object") {
    const message =
      (current as { message?: string }).message ??
      (current as { toString?: () => string }).toString?.() ??
      "";

    if (
      /fetch failed|Error connecting to database|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|socket hang up/i.test(
        message
      )
    ) {
      return true;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return false;
}

function withDbRetry(client: NeonClient, attempts = 3): NeonClient {
  const retry = async <T>(run: () => Promise<T>): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        return await run();
      } catch (error) {
        lastError = error;
        if (!isTransientDbError(error)) throw error;
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }

    throw lastError;
  };

  const wrapped = (async (strings: TemplateStringsArray, ...params: unknown[]) =>
    retry(() => client(strings, ...params))) as unknown as NeonClient;

  wrapped.query = ((queryWithPlaceholders: string, params?: unknown[], queryOpts?: never) =>
    retry(() => client.query(queryWithPlaceholders, params as unknown[], queryOpts))) as unknown as NeonClient["query"];

  wrapped.transaction = ((queriesOrFn: unknown, opts?: never) =>
    retry(() => client.transaction(queriesOrFn as Parameters<NeonClient["transaction"]>[0], opts))) as unknown as NeonClient["transaction"];

  wrapped.unsafe = ((rawSQL: string) => client.unsafe(rawSQL)) as NeonClient["unsafe"];

  return wrapped;
}

export const db = drizzle(withDbRetry(neon(connectionString)));

let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  if (!initPromise) {
    initPromise = runInit();
  }

  return initPromise;
}

async function runInit(): Promise<void> {

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      email_verified boolean NOT NULL DEFAULT false,
      image text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS session (
      id text PRIMARY KEY,
      expires_at timestamptz NOT NULL,
      token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      ip_address text,
      user_agent text,
      user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS account (
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
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS verification (
      id text PRIMARY KEY,
      identifier text NOT NULL,
      value text NOT NULL,
      expires_at timestamptz NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS posts (
      id bigserial PRIMARY KEY,
      type text NOT NULL,
      project text,
      year integer,
      description text NOT NULL,
      name text NOT NULL,
      contact text NOT NULL,
      github text,
      meta text NOT NULL DEFAULT 'طالب جامعي',
      created_at timestamptz NOT NULL DEFAULT now(),
      user_id text REFERENCES "user"(id) ON DELETE SET NULL
    );
  `);

  await db.execute(sql`
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS github text;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS years (
      value int PRIMARY KEY,
      label text NOT NULL
    );
  `);

  const yearRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(years);

  if (yearRows[0].count === 0) {
    await db.insert(years).values(yearSeeds);
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS roles (
      value text PRIMARY KEY,
      label text NOT NULL
    );
  `);

  const roleRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(roles);

  if (roleRows[0].count === 0) {
    await db.insert(roles).values(roleSeeds);
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS post_roles (
      post_id bigint REFERENCES posts(id) ON DELETE CASCADE,
      role_value text REFERENCES roles(value) ON DELETE CASCADE,
      PRIMARY KEY (post_id, role_value)
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id bigserial PRIMARY KEY,
      type text NOT NULL,
      post_id bigint REFERENCES posts(id) ON DELETE SET NULL,
      user_id text REFERENCES "user"(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS analytics_events_type_created_idx
    ON analytics_events (type, created_at);
  `);
}