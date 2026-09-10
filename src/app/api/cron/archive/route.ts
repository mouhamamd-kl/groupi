export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { archiveStalePosts } from "@/lib/posts";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not set" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const archived = await archiveStalePosts();

  return NextResponse.json({ ok: true, archived });
}