import { NextRequest, NextResponse } from "next/server";
import { getSubscription } from "@/lib/db";
import { FEATURE_GATES, hasFeatureAccess, type PlanId } from "@/lib/plans";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-api-secret") ?? req.nextUrl.searchParams.get("secret");
  const expected = process.env.BOT_PREMIUM_API_SECRET;
  if (!expected || secret !== expected) return unauthorized();

  const guildId = req.nextUrl.searchParams.get("guild_id");
  if (!guildId) {
    return NextResponse.json({ error: "Brak guild_id" }, { status: 400 });
  }

  const sub = getSubscription(guildId);
  const plan = (sub.active ? sub.plan : "free") as PlanId;

  const features: Record<string, boolean> = {};
  for (const [feature, required] of Object.entries(FEATURE_GATES)) {
    features[feature] = hasFeatureAccess(plan, required);
  }

  return NextResponse.json({
    guild_id: guildId,
    plan,
    active: sub.active,
    features,
    current_period_end: sub.currentPeriodEnd ?? null,
  });
}
