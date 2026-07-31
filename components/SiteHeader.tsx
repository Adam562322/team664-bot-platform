import Link from "next/link";
import { botInviteUrl } from "@/lib/plans";

const DISCORD_CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ??
  process.env.DISCORD_CLIENT_ID ??
  "1437907745704644829";

export function SiteHeader() {
  const invite = botInviteUrl(DISCORD_CLIENT_ID);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          <span className="gradient-text">TEAM-664</span> Bot
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a href="#funkcje" className="hover:text-white">
            Funkcje
          </a>
          <a href="#cennik" className="hover:text-white">
            Cennik
          </a>
          <Link href="/login" className="hover:text-white">
            Panel
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
          >
            Panel właściciela
          </Link>
          <a
            href={invite}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 sm:inline-block"
          >
            Dodaj bota
          </a>
        </div>
      </div>
    </header>
  );
}
