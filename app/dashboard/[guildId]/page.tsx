import Link from "next/link";
import { redirect } from "next/navigation";
import { safeGetServerSession } from "@/lib/auth";
import { fetchUserGuilds } from "@/lib/discord";
import { GuildSettingsForm } from "@/components/GuildSettingsForm";
import {
  fetchBotGuildChannels,
  fetchBotGuildRoles,
  isBotInGuild,
  isBotTokenConfigured,
} from "@/lib/discord-bot";
import { getGuildConfig } from "@/lib/guild-config";
import { botInviteUrl } from "@/lib/plans";

export const runtime = "nodejs";

type Props = { params: Promise<{ guildId: string }> };

export default async function GuildSettingsPage({ params }: Props) {
  const { guildId } = await params;
  const session = await safeGetServerSession();
  if (!session?.accessToken) redirect("/login");

  const guilds = await fetchUserGuilds(session.accessToken);
  const guild = guilds.find((g) => g.id === guildId);
  if (!guild) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p>Brak dostępu do tego serwera.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-400">
          ← Panel
        </Link>
      </div>
    );
  }

  const hasToken = isBotTokenConfigured();
  const botPresent = hasToken ? await isBotInGuild(guildId) : true;
  const config = getGuildConfig(guildId);
  const [roles, channels] = hasToken
    ? await Promise.all([fetchBotGuildRoles(guildId), fetchBotGuildChannels(guildId)])
    : [[], []];
  const initialMeta = {
    roles: roles.map((r) => ({ id: r.id, name: r.name })),
    channels: channels.map((c) => ({ id: c.id, name: c.name, type: c.type })),
    botTokenConfigured: hasToken,
  };
  const clientId =
    process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";
  const invite = clientId ? botInviteUrl(clientId, guildId) : "#";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <Link href="/dashboard" className="text-sm text-indigo-400 hover:underline">
        ← Wróć do panelu
      </Link>

      {!hasToken && (
        <div className="card mt-4 border-amber-500/40 bg-amber-500/10">
          <p className="text-sm text-amber-100">
            Strona nie może sprawdzić bota — dodaj w Vercel zmienną{" "}
            <code className="text-amber-200">DISCORD_BOT_TOKEN</code> (ten sam token co na
            hostingu bota), potem <strong>Redeploy</strong>. Wtedy zobaczysz listę kanałów i ról.
          </p>
          <p className="mt-2 text-xs text-amber-200/80">
            Możesz i tak zapisywać ustawienia poniżej — bot je pobierze, jeśli token API (
            <code>BOT_PREMIUM_API_SECRET</code>) jest ustawiony.
          </p>
        </div>
      )}

      {hasToken && !botPresent && (
        <div className="card mt-4 border-amber-500/40 bg-amber-500/10">
          <p className="text-sm text-amber-100">
            Discord nie potwierdza bota na tym serwerze. Upewnij się, że zaprosiłeś aplikację{" "}
            <strong>Team-664</strong> (to samo Client ID co na stronie). Jeśli bot już jest —
            sprawdź, czy token w Vercel jest z tej samej aplikacji w Developer Portal.
          </p>
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white"
          >
            Dodaj bota ponownie
          </a>
        </div>
      )}

      <div className="mt-6">
        <GuildSettingsForm
          guildId={guildId}
          guildName={guild.name}
          initialConfig={config}
          initialMeta={initialMeta}
        />
      </div>
    </div>
  );
}
