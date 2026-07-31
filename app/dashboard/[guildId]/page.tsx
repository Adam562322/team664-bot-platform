import Link from "next/link";
import { redirect } from "next/navigation";
import { safeGetServerSession } from "@/lib/auth";
import { fetchUserGuilds } from "@/lib/discord";
import { GuildSettingsForm } from "@/components/GuildSettingsForm";
import { isBotInGuild } from "@/lib/discord-bot";
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

  const botPresent = await isBotInGuild(guildId);
  const clientId =
    process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";
  const invite = clientId ? botInviteUrl(clientId, guildId) : "#";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <Link href="/dashboard" className="text-sm text-indigo-400 hover:underline">
        ← Wróć do panelu
      </Link>

      {!botPresent && (
        <div className="card mt-4 border-amber-500/40 bg-amber-500/10">
          <p className="text-sm text-amber-100">
            Bot nie jest jeszcze na tym serwerze. Najpierw go dodaj, potem zapisz ustawienia.
          </p>
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white"
          >
            Dodaj bota na serwer
          </a>
        </div>
      )}

      <div className="mt-6">
        <GuildSettingsForm guildId={guildId} guildName={guild.name} />
      </div>
    </div>
  );
}
