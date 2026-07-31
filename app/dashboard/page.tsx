import Link from "next/link";
import { redirect } from "next/navigation";
import { safeGetServerSession, type SessionWithToken } from "@/lib/auth";
import { fetchUserGuilds, guildIconUrl } from "@/lib/discord";
import { getSubscription } from "@/lib/db";
import { botInviteUrl, PLANS, planRank } from "@/lib/plans";
import { PricingCard } from "@/components/PricingCard";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const session = await safeGetServerSession();
  if (!session?.accessToken) redirect("/login");

  const guilds = await fetchUserGuilds(session.accessToken);
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold">Panel serwera</h1>
      <p className="mt-2 text-slate-400">
        Wybierz serwer Discord, dla którego chcesz zarządzać planem i zaproszeniem bota.
      </p>

      {guilds.length === 0 ? (
        <div className="card mt-8">
          <p>Brak serwerów z uprawnieniem „Zarządzaj serwerem”.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {guilds.map((guild) => {
            const sub = getSubscription(guild.id);
            const plan = PLANS.find((p) => p.id === sub.plan) ?? PLANS[0];
            const icon = guildIconUrl(guild);
            const invite = clientId ? botInviteUrl(clientId, guild.id) : "#";

            return (
              <div key={guild.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={icon} alt="" className="h-14 w-14 rounded-2xl" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-xl font-bold">
                        {guild.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{guild.name}</h2>
                      <p className="text-sm text-slate-400">
                        Plan: <span className="font-medium text-indigo-300">{plan.name}</span>
                        {sub.currentPeriodEnd && (
                          <> · ważny do {new Date(sub.currentPeriodEnd).toLocaleDateString("pl-PL")}</>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">ID serwera: {guild.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/${guild.id}`}
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                    >
                      ⚙️ Ustawienia bota
                    </Link>
                    <a
                      href={invite}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                    >
                      Dodaj / zarządzaj botem
                    </a>
                  </div>
                </div>

                {plan.id !== "premium" && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {PLANS.filter((p) => p.id !== "free" && planRank(p.id) > planRank(plan.id)).map(
                      (p) => (
                        <PricingCard key={p.id} plan={p} guildId={guild.id} />
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

