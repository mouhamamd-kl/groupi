import "server-only";

import { db, initDb } from "./db";
import { analyticsEvents } from "./schema";

export type AnalyticsEventType = "page_view" | "post_created" | "contact_opened";

export async function logEvent(
  type: AnalyticsEventType,
  opts?: { postId?: number | null; userId?: string | null }
): Promise<void> {
  await initDb();

  await db
    .insert(analyticsEvents)
    .values({
      type,
      postId: opts?.postId ?? null,
      userId: opts?.userId ?? null,
    })
    .catch(() => {
      // Analytics must never break the main flow.
    });
}