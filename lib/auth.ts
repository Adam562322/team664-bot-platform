import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

function buildProviders() {
  const clientId = process.env.DISCORD_CLIENT_ID?.trim();
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return [];
  }
  return [
    DiscordProvider({
      clientId,
      clientSecret,
      authorization: {
        params: { scope: "identify guilds" },
      },
    }),
  ];
}

export const DISCORD_SIGN_IN_URL =
  "/api/auth/signin/discord?callbackUrl=" + encodeURIComponent("/dashboard");

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: buildProviders(),
    callbacks: {
      async jwt({ token, account }) {
        if (account?.access_token) {
          token.accessToken = account.access_token;
        }
        return token;
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken;
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}

/** @deprecated use getAuthOptions() */
export const authOptions = getAuthOptions();

export type SessionWithToken = {
  accessToken?: string;
  user?: { name?: string | null; email?: string | null; image?: string | null };
};

export async function safeGetServerSession(): Promise<SessionWithToken | null> {
  if (!process.env.NEXTAUTH_SECRET) {
    return null;
  }
  try {
    return (await getServerSession(getAuthOptions())) as SessionWithToken | null;
  } catch {
    return null;
  }
}

export function isDiscordAuthConfigured(): boolean {
  return Boolean(
    process.env.DISCORD_CLIENT_ID?.trim() && process.env.DISCORD_CLIENT_SECRET?.trim(),
  );
}
