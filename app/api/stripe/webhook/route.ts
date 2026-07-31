import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertSubscription } from "@/lib/db";
import { getStripe, planFromStripePrice } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Brak STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Brak signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const guildId = session.metadata?.guildId;
    const plan = (session.metadata?.plan ?? "pro") as PlanId;
    if (guildId) {
      upsertSubscription({
        guildId,
        plan,
        active: true,
        stripeCustomerId: session.customer as string | undefined,
        stripeSubscriptionId: session.subscription as string | undefined,
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const guildId = sub.metadata?.guildId;
    const priceId = sub.items.data[0]?.price.id;
    const plan = planFromStripePrice(priceId);
    const active = sub.status === "active" || sub.status === "trialing";
    if (guildId) {
      upsertSubscription({
        guildId,
        plan: active ? plan : "free",
        active,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
