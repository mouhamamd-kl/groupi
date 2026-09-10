import { headers } from "next/headers";

import Home from "@/components/Home";
import { logEvent } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { initDb } from "@/lib/db";
import { archiveStalePosts, getPendingNudge, getPosts } from "@/lib/posts";
import { getRoles } from "@/lib/roles";
import { getYears } from "@/lib/years";
import {
  answerNudge,
  createNewPost,
  deleteOwnPost,
  editOwnPost,
  logContactOpened,
  reactivatePost,
} from "./actions";

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

  const currentUser = session?.user?.id ?? null;

  await logEvent("page_view", { userId: currentUser });

  await archiveStalePosts();

  let pendingNudge: Awaited<ReturnType<typeof getPendingNudge>> | null = null;

  if (currentUser) {
    pendingNudge = await getPendingNudge(currentUser);
  }

  return (
    <Home
      posts={getPosts()}
      createPost={createNewPost}
      editPost={editOwnPost}
      currentUserId={currentUser}
      deletePost={deleteOwnPost}
      roles={roles}
      years={years}
      isAdmin={isAdmin(session?.user?.email)}
      logContact={logContactOpened}
      pendingNudge={pendingNudge}
      answerNudge={answerNudge}
      reactivatePost={reactivatePost}
    />
  );
}