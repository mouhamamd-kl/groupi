import "server-only";

import { asc } from "drizzle-orm";

import { db, initDb } from "./db";
import { roles } from "./schema";
import type { Role } from "./types";

export async function getRoles(): Promise<Role[]> {
  await initDb();

  const rows = await db.select().from(roles).orderBy(asc(roles.label));

  return rows.map((row) => ({ value: row.value, label: row.label }));
}