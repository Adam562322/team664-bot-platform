"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuildBotConfig } from "@/lib/guild-config";

type DiscordMeta = {
  roles: { id: string; name: string }[];
  channels: { id: string; name: string; type: number }[];
  botTokenConfigured: boolean;
};

const TABS = [
  { id: "verification", label: "✅ Weryfikacja" },
  { id: "welcome", label: "👋 Powitania" },
  { id: "goodbye", label: "🚪 Pożegnania" },
  { id: "waiting", label: "🔔 Poczekalnia" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none";

export function GuildSettingsForm({
  guildId,
  guildName,
}: {
  guildId: string;
  guildName: string;
}) {
  const [tab, setTab] = useState<TabId>("verification");
  const [config, setConfig] = useState<GuildBotConfig | null>(null);
  const [meta, setMeta] = useState<DiscordMeta | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [cfgRes, metaRes] = await Promise.all([
      fetch(`/api/guilds/${guildId}/config`),
      fetch(`/api/guilds/${guildId}/discord-meta`),
    ]);
    if (cfgRes.ok) setConfig(await cfgRes.json());
    if (metaRes.ok) setMeta(await metaRes.json());
    setLoading(false);
  }, [guildId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!config) return;
    setStatus("Zapisywanie…");
    const res = await fetch(`/api/guilds/${guildId}/config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      setConfig(await res.json());
      setStatus("✅ Zapisano! Bot pobierze ustawienia przy następnym działaniu.");
    } else {
      setStatus("❌ Nie udało się zapisać.");
    }
  }

  if (loading || !config) {
    return <p className="text-slate-400">Ładowanie ustawień…</p>;
  }

  const textChannels =
    meta?.channels.filter((c) => c.type === 0 || c.type === 5) ?? [];
  const voiceChannels = meta?.channels.filter((c) => c.type === 2 || c.type === 13) ?? [];
  const roles = meta?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Ustawienia bota</h1>
        <p className="mt-1 text-slate-400">{guildName}</p>
        <p className="mt-2 text-xs text-slate-500">
          Zmienne: {"{nick}"} {"{mention}"} {"{member}"} {"{inviter}"} — bot podstawi przy wysyłce
        </p>
      </div>

      {!meta?.botTokenConfigured && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          Dodaj <code className="text-amber-200">DISCORD_BOT_TOKEN</code> w Vercel, żeby wczytywać
          listę kanałów i ról (bot musi być na serwerze).
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-indigo-500 text-white"
                : "border border-slate-700 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        {tab === "verification" && (
          <>
            <Field label="Włączona">
              <input
                type="checkbox"
                checked={config.verification.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, enabled: e.target.checked },
                  })
                }
                className="h-5 w-5"
              />
            </Field>
            <Field label="Kanał weryfikacji (tekst)">
              <select
                className={inputClass}
                value={config.verification.channelId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, channelId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rola zweryfikowany">
              <select
                className={inputClass}
                value={config.verification.verifiedRoleId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, verifiedRoleId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Rola niezweryfikowany">
              <select
                className={inputClass}
                value={config.verification.unverifiedRoleId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, unverifiedRoleId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Poprawna nazwa serwera (odpowiedź w modalu)">
              <input
                className={inputClass}
                value={config.verification.serverNameAnswer}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, serverNameAnswer: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Wiadomość na kanale weryfikacji">
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={config.verification.panelMessage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, panelMessage: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Tekst przycisku">
              <input
                className={inputClass}
                value={config.verification.buttonLabel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, buttonLabel: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Tytuł okna (modal)">
              <input
                className={inputClass}
                value={config.verification.modalTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, modalTitle: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Etykieta pola w modalu">
              <input
                className={inputClass}
                value={config.verification.modalInputLabel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, modalInputLabel: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Komunikat po sukcesie">
              <input
                className={inputClass}
                value={config.verification.successMessage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, successMessage: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Komunikat — zła odpowiedź">
              <input
                className={inputClass}
                value={config.verification.wrongAnswerMessage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    verification: { ...config.verification, wrongAnswerMessage: e.target.value },
                  })
                }
              />
            </Field>
          </>
        )}

        {tab === "welcome" && (
          <>
            <Field label="Włączone powitania">
              <input
                type="checkbox"
                checked={config.welcome.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, enabled: e.target.checked },
                  })
                }
                className="h-5 w-5"
              />
            </Field>
            <Field label="Kanał powitań">
              <select
                className={inputClass}
                value={config.welcome.channelId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, channelId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tytuł embeda" hint="np. Witaj {nick}">
              <input
                className={inputClass}
                value={config.welcome.embedTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, embedTitle: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Opis embeda" hint="np. {mention} witamy!">
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={config.welcome.embedDescription}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, embedDescription: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Linia zaproszenia (człowiek)">
              <input
                className={inputClass}
                value={config.welcome.humanInviteLine}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, humanInviteLine: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Linia nagrody za zaproszenie">
              <input
                className={inputClass}
                value={config.welcome.inviteRewardLine}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, inviteRewardLine: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="URL GIF">
              <input
                className={inputClass}
                value={config.welcome.gifUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    welcome: { ...config.welcome, gifUrl: e.target.value },
                  })
                }
              />
            </Field>
          </>
        )}

        {tab === "goodbye" && (
          <>
            <Field label="Włączone pożegnania">
              <input
                type="checkbox"
                checked={config.goodbye.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    goodbye: { ...config.goodbye, enabled: e.target.checked },
                  })
                }
                className="h-5 w-5"
              />
            </Field>
            <Field label="Kanał pożegnań">
              <select
                className={inputClass}
                value={config.goodbye.channelId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    goodbye: { ...config.goodbye, channelId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tytuł embeda">
              <input
                className={inputClass}
                value={config.goodbye.embedTitle}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    goodbye: { ...config.goodbye, embedTitle: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Opis embeda">
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={config.goodbye.embedDescription}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    goodbye: { ...config.goodbye, embedDescription: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Treść wiadomości (content)">
              <input
                className={inputClass}
                value={config.goodbye.contentTemplate}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    goodbye: { ...config.goodbye, contentTemplate: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="URL GIF">
              <input
                className={inputClass}
                value={config.goodbye.gifUrl}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    goodbye: { ...config.goodbye, gifUrl: e.target.value },
                  })
                }
              />
            </Field>
          </>
        )}

        {tab === "waiting" && (
          <>
            <Field label="Włączona poczekalnia">
              <input
                type="checkbox"
                checked={config.waitingRoom.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    waitingRoom: { ...config.waitingRoom, enabled: e.target.checked },
                  })
                }
                className="h-5 w-5"
              />
            </Field>
            <Field label="Kanał głosowy — poczekalnia">
              <select
                className={inputClass}
                value={config.waitingRoom.voiceChannelId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    waitingRoom: { ...config.waitingRoom, voiceChannelId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {voiceChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    🔊 {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kanał powiadomień (admin)">
              <select
                className={inputClass}
                value={config.waitingRoom.notifyChannelId}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    waitingRoom: { ...config.waitingRoom, notifyChannelId: e.target.value },
                  })
                }
              >
                <option value="">— wybierz —</option>
                {textChannels.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Treść powiadomienia">
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={config.waitingRoom.notifyMessage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    waitingRoom: { ...config.waitingRoom, notifyMessage: e.target.value },
                  })
                }
              />
            </Field>
            <Field label="Etykieta przycisku przeniesienia">
              <input
                className={inputClass}
                value={config.waitingRoom.moveButtonLabel}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    waitingRoom: { ...config.waitingRoom, moveButtonLabel: e.target.value },
                  })
                }
              />
            </Field>
          </>
        )}
      </div>

      <div className="sticky bottom-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={save}
          className="w-full rounded-xl bg-indigo-500 py-3 font-semibold text-white hover:bg-indigo-600 sm:w-auto sm:px-8"
        >
          Zapisz ustawienia
        </button>
        {status && <p className="text-sm text-slate-400">{status}</p>}
      </div>
    </div>
  );
}
