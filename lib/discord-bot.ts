const DISCORD_API = "https://discord.com/api/v10";
const DISCORD_TIMEOUT_MS = 8000;

function botHeaders(): HeadersInit | null {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) return null;
  return { Authorization: `Bot ${token}` };
}

async function discordFetch(url: string, headers: HeadersInit): Promise<Response | null> {
  try {
    return await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(DISCORD_TIMEOUT_MS),
    });
  } catch {
    return null;
  }
}

export type DiscordRole = {
  id: string;
  name: string;
  color: number;
  position: number;
};

export type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  position: number;
};

export async function fetchBotGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const headers = botHeaders();
  if (!headers) return [];
  const res = await discordFetch(`${DISCORD_API}/guilds/${guildId}/roles`, headers);
  if (!res?.ok) return [];
  const roles = (await res.json()) as DiscordRole[];
  return roles.filter((r) => r.name !== "@everyone").sort((a, b) => b.position - a.position);
}

export async function fetchBotGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  const headers = botHeaders();
  if (!headers) return [];
  const res = await discordFetch(`${DISCORD_API}/guilds/${guildId}/channels`, headers);
  if (!res?.ok) return [];
  const channels = (await res.json()) as DiscordChannel[];
  return channels.sort((a, b) => a.position - b.position);
}

export function isTextChannel(type: number): boolean {
  return type === 0 || type === 5;
}

export function isVoiceChannel(type: number): boolean {
  return type === 2 || type === 13;
}

export async function userManagesGuild(accessToken: string, guildId: string): Promise<boolean> {
  const res = await discordFetch(`${DISCORD_API}/users/@me/guilds`, {
    Authorization: `Bearer ${accessToken}`,
  });
  if (!res?.ok) return false;
  const guilds = (await res.json()) as { id: string; owner: boolean; permissions: string }[];
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild) return false;
  const manageGuild = BigInt(0x20);
  return guild.owner || (BigInt(guild.permissions) & manageGuild) === manageGuild;
}

export function isBotTokenConfigured(): boolean {
  return Boolean(process.env.DISCORD_BOT_TOKEN?.trim());
}

export async function isBotInGuild(guildId: string): Promise<boolean> {
  const headers = botHeaders();
  if (!headers) return false;
  const res = await discordFetch(`${DISCORD_API}/guilds/${guildId}`, headers);
  return Boolean(res?.ok);
}
