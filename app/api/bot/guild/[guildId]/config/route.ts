import { NextRequest, NextResponse } from "next/server";
import { getGuildConfig } from "@/lib/guild-config";

export const runtime = "nodejs";

type Params = { params: Promise<{ guildId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const secret = req.headers.get("x-api-secret") ?? req.nextUrl.searchParams.get("secret");
  const expected = process.env.BOT_PREMIUM_API_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { guildId } = await params;
  return NextResponse.json(getGuildConfig(guildId));
}
