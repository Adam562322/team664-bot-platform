import fs from "fs";
import path from "path";

export type GuildBotConfig = {
  guildId: string;
  updatedAt: string;
  verification: {
    enabled: boolean;
    channelId: string;
    verifiedRoleId: string;
    unverifiedRoleId: string;
    serverNameAnswer: string;
    panelMessage: string;
    buttonLabel: string;
    modalTitle: string;
    modalInputLabel: string;
    modalPlaceholder: string;
    wrongAnswerMessage: string;
    successMessage: string;
    alreadyVerifiedMessage: string;
  };
  welcome: {
    enabled: boolean;
    channelId: string;
    embedTitle: string;
    embedDescription: string;
    contentTemplate: string;
    gifUrl: string;
    humanInviteLine: string;
    inviteRewardLine: string;
  };
  goodbye: {
    enabled: boolean;
    channelId: string;
    embedTitle: string;
    embedDescription: string;
    contentTemplate: string;
    gifUrl: string;
  };
  waitingRoom: {
    enabled: boolean;
    voiceChannelId: string;
    notifyChannelId: string;
    notifyMessage: string;
    moveButtonLabel: string;
  };
};

export function defaultGuildConfig(guildId: string): GuildBotConfig {
  return {
    guildId,
    updatedAt: new Date().toISOString(),
    verification: {
      enabled: true,
      channelId: "",
      verifiedRoleId: "",
      unverifiedRoleId: "",
      serverNameAnswer: "team-664",
      panelMessage:
        "Kliknij **Zweryfikuj się**, wpisz nazwę serwera i odbierz dostęp do kanałów.",
      buttonLabel: "Zweryfikuj się",
      modalTitle: "Weryfikacja",
      modalInputLabel: "Wpisz nazwę serwera",
      modalPlaceholder: "np. TEAM-664",
      wrongAnswerMessage:
        "❌ Niepoprawna nazwa serwera. Wpisz dokładnie nazwę podaną przez administrację.",
      successMessage: "✅ Zostałeś zweryfikowany!",
      alreadyVerifiedMessage: "⚠️ Jesteś już zweryfikowany.",
    },
    welcome: {
      enabled: true,
      channelId: "",
      embedTitle: "Witaj {nick}",
      embedDescription: "{mention} witamy na serwerze!",
      contentTemplate: "",
      gifUrl: "https://media.giphy.com/media/nJD7IbhQ20KOVZFf0C/giphy.gif",
      humanInviteLine: "📨 **{inviter}** zaprosił **{member}**!",
      inviteRewardLine: "💰 **{inviter}** otrzymuje 1 000 🪙 za zaproszenie.",
    },
    goodbye: {
      enabled: true,
      channelId: "",
      embedTitle: "Pożegnanie {nick}",
      embedDescription: "{mention} mamy nadzieję, że do zobaczenia!",
      contentTemplate: "{mention}",
      gifUrl: "https://media.giphy.com/media/l1J9D0t6AfjUfC6Vq/giphy.gif",
    },
    waitingRoom: {
      enabled: false,
      voiceChannelId: "",
      notifyChannelId: "",
      notifyMessage:
        "🔔 **{member}** czeka w poczekalni. Wejdź na voice i kliknij **Przenieś tutaj**.",
      moveButtonLabel: "Przenieś tutaj",
    },
  };
}

type ConfigStore = { configs: Record<string, GuildBotConfig> };

function getDataDir(): string {
  if (process.env.VERCEL) return path.join("/tmp", "team664-bot-platform");
  return path.join(process.cwd(), "data");
}

function readStore(): ConfigStore {
  const storePath = path.join(getDataDir(), "guild-configs.json");
  try {
    const dir = getDataDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(storePath)) return { configs: {} };
    return JSON.parse(fs.readFileSync(storePath, "utf-8")) as ConfigStore;
  } catch {
    return { configs: {} };
  }
}

function writeStore(store: ConfigStore) {
  try {
    const dir = getDataDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, "guild-configs.json"),
      JSON.stringify(store, null, 2),
      "utf-8",
    );
  } catch {
    /* serverless */
  }
}

export function getGuildConfig(guildId: string): GuildBotConfig {
  const store = readStore();
  return store.configs[guildId] ?? defaultGuildConfig(guildId);
}

export function saveGuildConfig(config: GuildBotConfig): GuildBotConfig {
  const store = readStore();
  const merged: GuildBotConfig = {
    ...defaultGuildConfig(config.guildId),
    ...config,
    verification: { ...defaultGuildConfig(config.guildId).verification, ...config.verification },
    welcome: { ...defaultGuildConfig(config.guildId).welcome, ...config.welcome },
    goodbye: { ...defaultGuildConfig(config.guildId).goodbye, ...config.goodbye },
    waitingRoom: { ...defaultGuildConfig(config.guildId).waitingRoom, ...config.waitingRoom },
    updatedAt: new Date().toISOString(),
  };
  store.configs[config.guildId] = merged;
  writeStore(store);
  return merged;
}

export function patchGuildConfig(
  guildId: string,
  patch: Partial<Omit<GuildBotConfig, "guildId" | "updatedAt">>,
): GuildBotConfig {
  const current = getGuildConfig(guildId);
  return saveGuildConfig({
    ...current,
    ...patch,
    verification: { ...current.verification, ...patch.verification },
    welcome: { ...current.welcome, ...patch.welcome },
    goodbye: { ...current.goodbye, ...patch.goodbye },
    waitingRoom: { ...current.waitingRoom, ...patch.waitingRoom },
  });
}
