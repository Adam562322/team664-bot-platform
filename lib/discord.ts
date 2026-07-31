const DISCORD_API = "https://discord.com/api/v10";

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return [];
  const guilds = (await res.json()) as DiscordGuild[];
  // MANAGE_GUILD (0x20) — tylko serwery, którymi user zarządza
  return guilds.filter((g) => {
    const perms = BigInt(g.permissions);
    return g.owner || (perms & 0x20n) === 0x20n;
  });
}

export function guildIconUrl(guild: DiscordGuild, size = 128): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=${size}`;
}
