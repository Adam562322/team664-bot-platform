"use client";

import Link from "next/link";
import type { Plan } from "@/lib/plans";

export function PricingCard({ plan, guildId }: { plan: Plan; guildId?: string }) {
  const checkoutHref = guildId
    ? `/api/stripe/checkout?plan=${plan.id}&guildId=${guildId}`
    : "/api/auth/signin";

  return (
    <div
      className={`card flex flex-col ${
        plan.highlighted ? "border-indigo-500/60 ring-1 ring-indigo-500/30" : ""
      }`}
    >
      {plan.highlighted && (
        <span className="mb-3 inline-block w-fit rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
          Najpopularniejszy
        </span>
      )}
      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className="mt-1 text-2xl font-bold">{plan.priceLabel}</p>
      <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
      <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-300">
        {plan.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-emerald-400">✓</span>
            {f}
          </li>
        ))}
      </ul>
      {plan.id === "free" ? (
        <Link
          href="/api/auth/signin"
          className="mt-8 block rounded-xl border border-slate-700 py-3 text-center text-sm font-medium hover:bg-slate-800"
        >
          Zacznij za darmo
        </Link>
      ) : (
        <a
          href={checkoutHref}
          className="mt-8 block rounded-xl bg-indigo-500 py-3 text-center text-sm font-medium text-white hover:bg-indigo-600"
        >
          Wykup {plan.name}
        </a>
      )}
    </div>
  );
}
