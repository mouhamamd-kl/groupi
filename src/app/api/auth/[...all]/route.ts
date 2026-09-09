import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { initDb } from "@/lib/db";

const authHandler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  await initDb();
  return authHandler.GET(request);
}

export async function POST(request: NextRequest) {
  await initDb();
  return authHandler.POST(request);
}