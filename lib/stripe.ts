import Stripe from "stripe";
import type { PlanId } from "./plans";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Brak STRIPE_SECRET_KEY w .env");
    stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" });
  }
  return stripe;
}

export function stripePriceIdForPlan(planId: PlanId): string | null {
  if (planId === "pro") return process.env.STRIPE_PRICE_PRO ?? null;
  if (planId === "premium") return process.env.STRIPE_PRICE_PREMIUM ?? null;
  return null;
}

export function planFromStripePrice(priceId: string | undefined): PlanId {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
  return "free";
}
