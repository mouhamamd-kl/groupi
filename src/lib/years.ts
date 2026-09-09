import "server-only";

import { asc } from "drizzle-orm";

import { db, initDb } from "./db";
import { years } from "./schema";
import type { Year } from "./types";

export async function getYears(): Promise<Year[]> {
  await initDb();

  const rows = await db.select().from(years).orderBy(asc(years.value));

  return rows.map((row) => ({ value: row.value, label: row.label }));
}