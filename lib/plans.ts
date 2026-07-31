export type PlanId = "free" | "pro" | "premium";

export type Plan = {
  id: PlanId;
  name: string;
  pricePln: number;
  priceLabel: string;
  stripePriceEnv?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    pricePln: 0,
    priceLabel: "0 zł / mies.",
    description: "Podstawy dla małego serwera.",
    features: [
      "Weryfikacja i powitania",
      "Podstawowe komendy",
      "Statystyki serwera",
      "Do 1 000 członków",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    pricePln: 29,
    priceLabel: "29 zł / mies.",
    stripePriceEnv: "STRIPE_PRICE_PRO",
    description: "Dla aktywnych społeczności.",
    highlighted: true,
    features: [
      "Wszystko z Free",
      "Sklep i role premium",
      "Kasyno i minigry",
      "Radio / TTS na voice",
      "Moderacja i logi",
      "Bez limitu członków",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    pricePln: 79,
    priceLabel: "79 zł / mies.",
    stripePriceEnv: "STRIPE_PRICE_PREMIUM",
    description: "Pełny pakiet + priorytet.",
    features: [
      "Wszystko z Pro",
      "Własna rola sklepu (kolor)",
      "Konkursy i giveaway",
      "Poczekalnia voice (admin)",
      "Priorytetowe wsparcie",
      "Własny branding bota (wkrótce)",
    ],
  },
];

export function getPlan(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}

export function planRank(planId: PlanId): number {
  return { free: 0, pro: 1, premium: 2 }[planId];
}

export function hasFeatureAccess(guildPlan: PlanId, required: PlanId): boolean {
  return planRank(guildPlan) >= planRank(required);
}

export const BOT_PERMISSIONS =
  "8" +
  "" /* Administrator for MVP — docelowo zawęzić do minimalnych uprawnień */;

export function botInviteUrl(clientId: string, guildId?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    permissions: "268443648", // Manage roles, channels, messages, voice, move members, etc.
    scope: "bot applications.commands",
  });
  if (guildId) params.set("guild_id", guildId);
  params.set("disable_guild_select", guildId ? "true" : "false");
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export const FEATURE_GATES: Record<string, PlanId> = {
  shop: "pro",
  casino: "pro",
  radio: "pro",
  moderation: "pro",
  custom_role: "premium",
  giveaway: "premium",
  waiting_room: "premium",
};
