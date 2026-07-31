import { NextRequest, NextResponse } from "next/server";
import {
  fetchBotGuildChannels,
  fetchBotGuildRoles,
  userManagesGuild,
} from "@/lib/discord-bot";
import { safeGetServerSession } from "@/lib/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ guildId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { guildId } = await params;
  const session = await safeGetServerSession();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await userManagesGuild(session.accessToken, guildId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const [roles, channels] = await Promise.all([
    fetchBotGuildRoles(guildId),
    fetchBotGuildChannels(guildId),
  ]);
  return NextResponse.json({ roles, channels, botTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN) });
}
