export type PostType = "team" | "member";

export interface Post {
  type: PostType;
  project: string;
  role: string;
  description: string;
  name: string;
  contact: string;
  meta: string;
  time: string;
}

export const getInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();