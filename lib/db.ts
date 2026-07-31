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

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "subscriptions.json");

function ensureStore(): Store {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const empty: Store = { subscriptions: {} };
    fs.writeFileSync(STORE_PATH, JSON.stringify(empty, null, 2), "utf-8");
    return empty;
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as Store;
}

function saveStore(store: Store) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
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
