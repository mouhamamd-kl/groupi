import "server-only";

import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";

import { db, initDb } from "./db";
import { user } from "./auth-schema";
import { postRoles, posts, roles, years } from "./schema";
import type { NewPostInput, Post, PostType } from "./types";

interface PostRowData {
  post: PostRow;
  avatar: string | null;
  yearLabel: string | null;
}

export async function getPosts(): Promise<Post[]> {
  await initDb();

  const rows = await selectPosts();

  return hydratePosts(rows);
}

export async function archiveStalePosts(): Promise<number> {
  await initDb();

  const archived = await db
    .update(posts)
    .set({ archived: true })
    .where(
      and(
        eq(posts.archived, false),
        sql`${posts.createdAt} < now() - interval '3 days'`,
        or(
          sql`${posts.snoozedUntil} IS NULL`,
          sql`${posts.snoozedUntil} <= now()`
        ),
        sql`NOT EXISTS (
          SELECT 1 FROM analytics_events e
          WHERE e.type = 'page_view'
            AND e.user_id = ${posts.userId}
            AND e.created_at > ${posts.createdAt} + interval '3 days'
        )`
      )
    )
    .returning({ id: posts.id });

  return archived.length;
}

export async function getPendingNudge(userId: string): Promise<Post | null> {
  await initDb();

  const rows = await db
    .select({
      post: posts,
      avatar: user.image,
      yearLabel: years.label,
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(years, sql`${posts.year} = ${years.value}`)
    .where(
      and(
        eq(posts.userId, userId),
        eq(posts.archived, false),
        sql`${posts.createdAt} < now() - interval '3 days'`,
        or(
          sql`${posts.snoozedUntil} IS NULL`,
          sql`${posts.snoozedUntil} <= now()`
        )
      )
    )
    .orderBy(asc(posts.createdAt), asc(posts.id))
    .limit(1);

  if (rows.length === 0) return null;

  const [hydrated] = await hydratePosts(rows);

  return hydrated;
}

async function selectPosts(): Promise<PostRowData[]> {
  return db
    .select({
      post: posts,
      avatar: user.image,
      yearLabel: years.label,
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(years, sql`${posts.year} = ${years.value}`)
    .orderBy(desc(posts.createdAt), desc(posts.id));
}

async function hydratePosts(rows: PostRowData[]): Promise<Post[]> {
  if (rows.length === 0) return [];

  const roleMap = await getRoleMap();
  const ids = rows.map(({ post }) => post.id);

  const roleLinks = await db
    .select()
    .from(postRoles)
    .where(inArray(postRoles.postId, ids));

  const roleValuesByPost = new Map<number, string[]>();

  for (const link of roleLinks) {
    const list = roleValuesByPost.get(link.postId) ?? [];
    list.push(link.roleValue);
    roleValuesByPost.set(link.postId, list);
  }

  return rows.map(({ post, avatar, yearLabel }) =>
    toPost(
      post,
      avatar,
      roleValuesByPost.get(post.id) ?? [],
      roleMap,
      yearLabel
    )
  );
}

export async function insertPost(
  data: NewPostInput,
  userId: string
): Promise<Post> {
  await initDb();

  const [row] = await db
    .insert(posts)
    .values({
      type: data.type,
      project: data.project,
      year: data.year,
      description: data.description,
      name: data.name,
      contact: data.contact,
      github: data.github,
      specialization: data.specialization,
      userId,
    })
    .returning();

  await db
    .insert(postRoles)
    .values(data.roles.map((roleValue) => ({ postId: row.id, roleValue })));

  const [author] = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, userId));

  const roleMap = await getRoleMap();

  const [yearRow] = await db
    .select({ label: years.label })
    .from(years)
    .where(eq(years.value, data.year));

  return toPost(
    row,
    author?.image ?? null,
    data.roles,
    roleMap,
    yearRow?.label ?? null
  );
}

async function getRoleMap(): Promise<Map<string, string>> {
  const roleRows = await db.select().from(roles);

  return new Map(roleRows.map((role) => [role.value, role.label]));
}

interface PostRow {
  id: number;
  type: "team" | "member";
  project: string | null;
  year: number | null;
  description: string;
  name: string;
  contact: string;
  github: string | null;
  specialization: string | null;
  archived: boolean;
  meta: string;
  createdAt: Date;
  userId: string | null;
}

export async function deletePost(
  postId: number,
  userId: string
): Promise<boolean> {
  await initDb();

  const [deleted] = await db
    .delete(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
    .returning({ id: posts.id });

  return Boolean(deleted);
}

export async function updatePost(
  postId: number,
  userId: string,
  data: NewPostInput
): Promise<Post | null> {
  await initDb();

  const [existing] = await db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, postId));

  if (!existing || existing.userId !== userId) return null;

  await db
    .update(posts)
    .set({
      type: data.type,
      project: data.project,
      year: data.year,
      description: data.description,
      name: data.name,
      contact: data.contact,
      github: data.github,
      specialization: data.specialization,
    })
    .where(eq(posts.id, postId));

  await db
    .delete(postRoles)
    .where(eq(postRoles.postId, postId));

  await db
    .insert(postRoles)
    .values(data.roles.map((roleValue) => ({ postId, roleValue })));

  const [author] = await db
    .select({ image: user.image })
    .from(user)
    .where(eq(user.id, userId));

  const roleMap = await getRoleMap();

  const [yearRow] = await db
    .select({ label: years.label })
    .from(years)
    .where(eq(years.value, data.year));

  const [row] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId));

  if (!row) return null;

  return toPost(
    row,
    author?.image ?? null,
    data.roles,
    roleMap,
    yearRow?.label ?? null
  );
}

function toPost(
  row: PostRow,
  avatar: string | null,
  roleValues: string[],
  roleMap: Map<string, string>,
  yearLabel?: string | null
): Post {
  return {
    id: row.id,
    type: row.type as PostType,
    project: row.project,
    roles: roleValues.map((value) => roleMap.get(value) ?? value),
    roleValues,
    year: row.year,
    yearLabel: yearLabel ?? null,
    description: row.description,
    name: row.name,
    contact: row.contact,
    github: row.github,
    specialization: row.specialization,
    archived: row.archived,
    meta: row.meta,
    time: timeAgo(new Date(row.createdAt)),
    createdAt: new Date(row.createdAt).toISOString(),
    avatar,
    userId: row.userId,
  };
}

function timeAgo(date: Date): string {
  const minutesAgo = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (minutesAgo < 1) return "الآن";
  if (minutesAgo < 60) return `منذ ${minutesAgo} دقيقة`;
  if (minutesAgo < 120) return "منذ ساعة";
  if (minutesAgo < 1440) return `منذ ${Math.floor(minutesAgo / 60)} ساعة`;
  if (minutesAgo < 2880) return "أمس";
  return `منذ ${Math.floor(minutesAgo / 1440)} يوم`;
}