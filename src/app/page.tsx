import { headers } from "next/headers";

import Home from "@/components/Home";
import { logEvent } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { getPosts } from "@/lib/posts";
import { getRoles } from "@/lib/roles";
import { getYears } from "@/lib/years";
import { createNewPost, deleteOwnPost, editOwnPost, logContactOpened } from "./actions";

export const dynamic = "force-dynamic";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

export default async function Page() {
  await initDb();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const roles = await getRoles();
  const years = await getYears();

  logEvent("page_view", { userId: session?.user?.id ?? null });

  return (
    <Home
      posts={getPosts()}
      createPost={createNewPost}
      editPost={editOwnPost}
      currentUserId={session?.user?.id ?? null}
      deletePost={deleteOwnPost}
      roles={roles}
      years={years}
      isAdmin={isAdmin(session?.user?.email)}
      logContact={logContactOpened}
    />
  );
}