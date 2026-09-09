"use server";

import { headers } from "next/headers";

import { logEvent } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { deletePost, insertPost, updatePost } from "@/lib/posts";
import { getRoles } from "@/lib/roles";
import { getYears } from "@/lib/years";
import type { NewPostInput, Post, PostType } from "@/lib/types";

const MAX_LENGTHS = {
  project: 200,
  description: 2000,
  name: 100,
  github: 200,
} as const;

const MAX_ROLES = 8;

export async function createNewPost(data: NewPostInput): Promise<Post> {
  await initDb();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("سجّل الدخول بحساب Google لإنشاء منشور");
  }

  const type = cleanType(data.type);
  const project =
    type === "team" ? clean(data.project ?? "", MAX_LENGTHS.project) : null;
  const github = type === "member" ? cleanGithub(data.github) : null;
  const roles = cleanRoles(data.roles);
  const description = clean(data.description, MAX_LENGTHS.description);
  const name = clean(data.name, MAX_LENGTHS.name);
  const telegram = cleanTelegram(data.contact);
  const year = Number(data.year);

  if (
    !name ||
    !telegram ||
    !Number.isInteger(year) ||
    (type === "team" && !project)
  ) {
    throw new Error("يرجى ملء جميع الحقول");
  }

  if (roles.length === 0) {
    throw new Error("يرجى ملء جميع الحقول");
  }

  if (type === "team" && roles.length !== 1) {
    throw new Error("اختر تخصصًا واحدًا مطلوبًا");
  }

  const availableRoles = await getRoles();
  const roleValues = new Set(availableRoles.map((r) => r.value));

  if (!roles.every((role) => roleValues.has(role))) {
    throw new Error("التخصص المختار غير صالح");
  }

  const availableYears = await getYears();

  if (!availableYears.some((y) => y.value === year)) {
    throw new Error("السنة المختارة غير صالحة");
  }

  const created = await insertPost(
    { type, project, roles, year, description, name, contact: telegram, github },
    session.user.id
  );

  logEvent("post_created", { postId: created.id, userId: session.user.id });

  return created;
}

export async function logContactOpened(postId: number): Promise<void> {
  await initDb();

  if (!Number.isInteger(postId) || postId <= 0) {
    return;
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  await logEvent("contact_opened", {
    postId,
    userId: session?.user?.id ?? null,
  });
}

export async function deleteOwnPost(postId: number): Promise<void> {
  await initDb();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("سجّل الدخول لحذف منشور");
  }

  if (!Number.isInteger(postId) || postId <= 0) {
    throw new Error("منشور غير صالح");
  }

  const deleted = await deletePost(postId, session.user.id);

  if (!deleted) {
    throw new Error("لا يمكنك حذف هذا المنشور");
  }
}

export async function editOwnPost(
  postId: number,
  data: NewPostInput
): Promise<Post> {
  await initDb();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("سجّل الدخول لتعديل المنشور");
  }

  if (!Number.isInteger(postId) || postId <= 0) {
    throw new Error("منشور غير صالح");
  }

  const type = cleanType(data.type);
  const project =
    type === "team" ? clean(data.project ?? "", MAX_LENGTHS.project) : null;
  const github = type === "member" ? cleanGithub(data.github) : null;
  const roles = cleanRoles(data.roles);
  const description = clean(data.description, MAX_LENGTHS.description);
  const name = clean(data.name, MAX_LENGTHS.name);
  const telegram = cleanTelegram(data.contact);
  const year = Number(data.year);

  if (
    !name ||
    !telegram ||
    !Number.isInteger(year) ||
    (type === "team" && !project)
  ) {
    throw new Error("يرجى ملء جميع الحقول");
  }

  if (roles.length === 0) {
    throw new Error("يرجى ملء جميع الحقول");
  }

  if (type === "team" && roles.length !== 1) {
    throw new Error("اختر تخصصًا واحدًا مطلوبًا");
  }

  const availableRoles = await getRoles();
  const roleValues = new Set(availableRoles.map((r) => r.value));

  if (!roles.every((role) => roleValues.has(role))) {
    throw new Error("التخصص المختار غير صالح");
  }

  const availableYears = await getYears();

  if (!availableYears.some((y) => y.value === year)) {
    throw new Error("السنة المختارة غير صالحة");
  }

  const updated = await updatePost(postId, session.user.id, {
    type,
    project,
    roles,
    year,
    description,
    name,
    contact: telegram,
    github,
  });

  if (!updated) {
    throw new Error("لا يمكنك تعديل هذا المنشور");
  }

  return updated;
}

function clean(value: string, max: number): string {
  if (typeof value !== "string") {
    throw new Error("بيانات غير صالحة");
  }

  return value.trim().slice(0, max);
}

function cleanRoles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("بيانات غير صالحة");
  }

  const roles = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, MAX_ROLES);

  if (new Set(roles).size !== roles.length) {
    throw new Error("التخصص المكرر غير مقبول");
  }

  return roles;
}

function cleanTelegram(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("بيانات غير صالحة");
  }

  const username = value.trim().replace(/^@+/, "");

  if (!/^[A-Za-z0-9_]{5,32}$/.test(username)) {
    throw new Error("معرف تيليجرام غير صالح");
  }

  return username;
}

function cleanGithub(value: unknown): string | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("بيانات غير صالحة");
  }

  const trimmed = value.trim().slice(0, MAX_LENGTHS.github);

  if (!trimmed) {
    return null;
  }

  let url = trimmed;

  if (!/^https?:\/\//i.test(url)) {
    url = `https://github.com/${url}`;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "github.com") {
      throw new Error("رابط GitHub غير صالح");
    }

    const parts = parsed.pathname.split("/").filter(Boolean);

    if (parts.length < 1 || parts.length > 2) {
      throw new Error("رابط GitHub غير صالح");
    }

    return `https://github.com/${parts.join("/")}`;
  } catch (error) {
    if (error instanceof Error && error.message === "رابط GitHub غير صالح") {
      throw error;
    }

    throw new Error("رابط GitHub غير صالح");
  }
}

function cleanType(value: string): PostType {
  if (value === "member") return "member";
  if (value === "team") return "team";
  throw new Error("صيغة الإعلان غير صحيحة");
}