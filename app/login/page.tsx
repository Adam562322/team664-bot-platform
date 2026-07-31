import Link from "next/link";
import { redirect } from "next/navigation";
import { DISCORD_SIGN_IN_URL, isDiscordAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (!isDiscordAuthConfigured()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Panel tymczasowo niedostępny</h1>
        <p className="mt-4 text-slate-400">
          Brak konfiguracji Discord w Vercel. Admin musi dodać{" "}
          <code className="text-indigo-300">DISCORD_CLIENT_ID</code> i{" "}
          <code className="text-indigo-300">DISCORD_CLIENT_SECRET</code>, potem zrobić Redeploy.
        </p>
        <Link href="/" className="mt-8 inline-block text-indigo-400 hover:underline">
          ← Wróć na stronę główną
        </Link>
      </div>
    );
  }

  redirect(DISCORD_SIGN_IN_URL);
}
