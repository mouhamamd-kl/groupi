import {
  bigint,
  bigserial,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const posts = pgTable("posts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  type: text("type").$type<"team" | "member">().notNull(),
  project: text("project"),
  year: integer("year"),
  description: text("description").notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  github: text("github"),
  specialization: text("specialization"),
  meta: text("meta").notNull().default("طالب جامعي"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  userId: text("user_id").references(() => user.id, {
    onDelete: "set null",
  }),
});

export const roles = pgTable("roles", {
  value: text("value").primaryKey(),
  label: text("label").notNull(),
});

export const postRoles = pgTable(
  "post_roles",
  {
    postId: bigint("post_id", { mode: "number" })
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    roleValue: text("role_value")
      .notNull()
      .references(() => roles.value, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.roleValue] })]
);

export const years = pgTable("years", {
  value: integer("value").primaryKey(),
  label: text("label").notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  type: text("type")
    .$type<"page_view" | "post_created" | "contact_opened">()
    .notNull(),
  postId: bigint("post_id", { mode: "number" }).references(() => posts.id, {
    onDelete: "set null",
  }),
  userId: text("user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});