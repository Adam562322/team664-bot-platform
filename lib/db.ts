import fs from "fs";
import path from "path";
import type { PlanId } from "./plans";

export type SubscriptionRecord = {
  guildId: string;
  guildName?: string;
  plan: PlanId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  active: boolean;
  currentPeriodEnd?: string;
  updatedAt: string;
};

type Store = {
  subscriptions: Record<string, SubscriptionRecord>;
};

function getDataDir(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "team664-bot-platform");
  }
  return path.join(process.cwd(), "data");
}

function getStorePath(): string {
  return path.join(getDataDir(), "subscriptions.json");
}

function ensureStore(): Store {
  const dataDir = getDataDir();
  const storePath = getStorePath();
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(storePath)) {
      const empty: Store = { subscriptions: {} };
      fs.writeFileSync(storePath, JSON.stringify(empty, null, 2), "utf-8");
      return empty;
    }
    const raw = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return { subscriptions: {} };
  }
}

function saveStore(store: Store) {
  const dataDir = getDataDir();
  const storePath = getStorePath();
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // Vercel — brak zapisu; plany wrócą do free po restarcie (OK na start)
  }
}

export function getSubscription(guildId: string): SubscriptionRecord {
  const store = ensureStore();
  return (
    store.subscriptions[guildId] ?? {
      guildId,
      plan: "free",
      active: true,
      updatedAt: new Date().toISOString(),
    }
  );
}

export function upsertSubscription(record: Partial<SubscriptionRecord> & { guildId: string }) {
  const store = ensureStore();
  const existing = getSubscription(record.guildId);
  store.subscriptions[record.guildId] = {
    ...existing,
    ...record,
    updatedAt: new Date().toISOString(),
  };
  saveStore(store);
  return store.subscriptions[record.guildId];
}

export function listSubscriptions(): SubscriptionRecord[] {
  const store = ensureStore();
  return Object.values(store.subscriptions);
}
