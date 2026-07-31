import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { botInviteUrl } from "@/lib/plans";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? process.env.DISCORD_CLIENT_ID ?? "";
  const invite = clientId ? botInviteUrl(clientId) : "#";

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
          <Link href="/dashboard" className="hover:text-white">
            Panel
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Panel serwera
            </Link>
          ) : (
            <Link
              href="/api/auth/signin"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-900"
            >
              Zaloguj przez Discord
            </Link>
          )}
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
