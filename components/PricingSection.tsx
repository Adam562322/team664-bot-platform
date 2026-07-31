import { PLANS } from "@/lib/plans";
import { PricingCard } from "./PricingCard";

export function PricingSection() {
  return (
    <section id="cennik" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold">Prosty cennik</h2>
        <p className="mt-3 text-slate-400">
          Wykup plan dla swojego serwera Discord. Bot automatycznie odblokowuje funkcje po płatności.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </section>
  );
}
