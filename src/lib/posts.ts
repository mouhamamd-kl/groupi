import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db, initDb } from "./db";
import { user } from "./auth-schema";
import { postRoles, posts, roles, years } from "./schema";
import type { NewPostInput, Post, PostType } from "./types";

export async function getPosts(): Promise<Post[]> {
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
    .orderBy(desc(posts.createdAt), desc(posts.id));

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