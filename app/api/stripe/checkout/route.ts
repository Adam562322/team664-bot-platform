import { NextRequest, NextResponse } from "next/server";
import { safeGetServerSession } from "@/lib/auth";
import { getStripe, stripePriceIdForPlan } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const session = await safeGetServerSession();
  if (!session) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  const plan = req.nextUrl.searchParams.get("plan") as PlanId | null;
  const guildId = req.nextUrl.searchParams.get("guildId");

  if (!plan || !guildId || (plan !== "pro" && plan !== "premium")) {
    return NextResponse.json({ error: "Nieprawidłowy plan lub brak guildId" }, { status: 400 });
  }

  const priceId = stripePriceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: "Skonfiguruj STRIPE_PRICE_PRO / STRIPE_PRICE_PREMIUM w .env" },
      { status: 500 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const stripe = getStripe();

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?paid=1&guild=${guildId}`,
    cancel_url: `${appUrl}/dashboard?cancel=1`,
    metadata: {
      guildId,
      plan,
    },
    subscription_data: {
      metadata: { guildId, plan },
    },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "Nie udało się utworzyć sesji Stripe" }, { status: 500 });
  }

  return NextResponse.redirect(checkout.url);
}
