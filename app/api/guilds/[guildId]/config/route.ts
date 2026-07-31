import { NextRequest, NextResponse } from "next/server";
import { getGuildConfig, patchGuildConfig } from "@/lib/guild-config";
import { safeGetServerSession } from "@/lib/auth";
import { userManagesGuild } from "@/lib/discord-bot";

export const runtime = "nodejs";

type Params = { params: Promise<{ guildId: string }> };

async function authorize(guildId: string) {
  const session = await safeGetServerSession();
  if (!session?.accessToken) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const ok = await userManagesGuild(session.accessToken, guildId);
  if (!ok) {
    return { error: NextResponse.json({ error: "Brak uprawnień do tego serwera" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { guildId } = await params;
  const auth = await authorize(guildId);
  if ("error" in auth && auth.error) return auth.error;
  return NextResponse.json(getGuildConfig(guildId));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { guildId } = await params;
  const auth = await authorize(guildId);
  if ("error" in auth && auth.error) return auth.error;
  const body = await req.json();
  const config = patchGuildConfig(guildId, body);
  return NextResponse.json(config);
}
