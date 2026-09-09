export type PostType = "team" | "member";

export interface Role {
  value: string;
  label: string;
}

export interface Year {
  value: number;
  label: string;
}

export interface Post {
  id: number;
  type: PostType;
  project: string | null;
  roles: string[];
  roleValues: string[];
  year: number | null;
  yearLabel: string | null;
  description: string;
  name: string;
  contact: string;
  github: string | null;
  meta: string;
  time: string;
  createdAt: string;
  avatar: string | null;
  userId: string | null;
}

export interface NewPostInput {
  type: PostType;
  project: string | null;
  roles: string[];
  year: number;
  description: string;
  name: string;
  contact: string;
  github: string | null;
}

export const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();