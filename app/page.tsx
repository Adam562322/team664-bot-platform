import Link from "next/link";
import { PricingSection } from "@/components/PricingSection";
import { botInviteUrl } from "@/lib/plans";

const FEATURES = [
  { icon: "🛡️", title: "Moderacja", desc: "Bany, kicki, warny, logi wiadomości i kanały moderacji." },
  { icon: "🎰", title: "Kasyno i gry", desc: "Sloty, crash, plinko, tower, minigry 1v1 i rankingi." },
  { icon: "🛒", title: "Sklep ról", desc: "Własne role kolorowe, monety, zatwierdzanie przez admina." },
  { icon: "📻", title: "Radio i TTS", desc: "Stacje radiowe na voice oraz odtwarzanie TTS." },
  { icon: "✅", title: "Weryfikacja", desc: "Przycisk + modal z nazwą serwera, role zweryfikowany/nie." },
  { icon: "🔔", title: "Poczekalnia", desc: "Powiadomienie adminów i przenoszenie z poczekalni voice." },
];

export default function HomePage() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";
  const invite = clientId ? botInviteUrl(clientId) : "#";

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-indigo-400">
            Discord bot · SaaS
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Twój serwer z botem jak{" "}
            <span className="gradient-text">profesjonalne community</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Dodaj TEAM-664 Bot na swój Discord, wykup plan Pro lub Premium i odblokuj sklep,
            kasyno, radio, moderację i więcej — tak jak u popularnych botów w internecie.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={invite}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-indigo-500 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600"
            >
              Dodaj do Discord
            </a>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-8 py-3 font-semibold hover:bg-slate-900"
            >
              Panel właściciela
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            1. Dodaj bota · 2. Zaloguj się Discordem · 3. Wykup plan dla serwera
          </p>
        </div>
      </section>

      <section id="funkcje" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">Co potrafi bot?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Gotowy na start?</h2>
        <p className="mt-3 text-slate-400">
          Bot działa na wielu serwerach jednocześnie. Każdy serwer ma własny plan i własne ustawienia.
        </p>
        <a
          href={invite}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block rounded-xl bg-indigo-500 px-8 py-3 font-semibold text-white hover:bg-indigo-600"
        >
          Zaproś bota teraz
        </a>
      </section>
    </>
  );
}
