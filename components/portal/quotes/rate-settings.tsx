"use client";

/**
 * components/portal/quotes/rate-settings.tsx
 * ---------------------------------------------------------------------------
 * The rate card, editable from the UI.
 *
 * Rates live in service_rates and rate_settings rather than in the pricing
 * code, so correcting a per-mile rate is an UPDATE and not a migration and a
 * deploy. The client found a wrong rate in his own spreadsheet; the fix should
 * take him thirty seconds.
 *
 * The line at the top of this panel is the whole design of rate_snapshot,
 * stated once in the only place someone is about to rely on it.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listServiceRates,
  listRateSettings,
  updateServiceRate,
  updateRateSetting,
} from "@/lib/quotes/queries";
import type { RateSetting, ServiceCode, ServiceRate } from "@/lib/quotes/types";
import { sanitizeDecimal } from "@/lib/quotes/format";
import {
  ErrorBanner,
  LoadingPanel,
  NotConnectedPanel,
  isNotConnected,
} from "@/components/portal/data-states";

/** How a rate_settings value is written, so the editor can label the box. */
const UNIT_PREFIX: Record<RateSetting["unit"], string> = {
  usd: "$",
  usd_per_mile: "$",
  usd_per_minute: "$",
  miles: "",
  minutes: "",
  percent: "",
};

const UNIT_SUFFIX: Record<RateSetting["unit"], string> = {
  usd: "",
  usd_per_mile: "/mi",
  usd_per_minute: "/min",
  miles: "mi",
  minutes: "min",
  percent: "(fraction)",
};

export function RateSettings() {
  const [rates, setRates] = useState<ServiceRate[]>([]);
  const [settings, setSettings] = useState<RateSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [ratesRes, settingsRes] = await Promise.all([listServiceRates(), listRateSettings()]);

    const firstError = ratesRes.error || settingsRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setRates(ratesRes.data ?? []);
    setSettings(settingsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /** Optimistic with a real rollback, like the finance dashboard. */
  const saveRate = useCallback(
    async (code: ServiceCode, patch: Partial<ServiceRate>) => {
      let previous: ServiceRate | null = null;
      setRates((prev) =>
        prev.map((r) => {
          if (r.service_code !== code) return r;
          previous = r;
          return { ...r, ...patch };
        })
      );

      const { data, error: writeError } = await updateServiceRate(code, patch);
      if (writeError || !data) {
        if (previous) {
          setRates((prev) => prev.map((r) => (r.service_code === code ? previous! : r)));
        }
        setError(writeError?.message ?? "Could not save that rate.");
        return false;
      }
      setRates((prev) => prev.map((r) => (r.service_code === code ? data : r)));
      return true;
    },
    []
  );

  const saveSetting = useCallback(async (key: string, value: number) => {
    let previous: RateSetting | null = null;
    setSettings((prev) =>
      prev.map((s) => {
        if (s.key !== key) return s;
        previous = s;
        return { ...s, value };
      })
    );

    const { data, error: writeError } = await updateRateSetting(key, value);
    if (writeError || !data) {
      if (previous) {
        setSettings((prev) => prev.map((s) => (s.key === key ? previous! : s)));
      }
      setError(writeError?.message ?? "Could not save that surcharge.");
      return false;
    }
    setSettings((prev) => prev.map((s) => (s.key === key ? data : s)));
    return true;
  }, []);

  if (isNotConnected(error)) {
    return <NotConnectedPanel message={error!} what="Rate card" />;
  }

  return (
    <section className="card">
      <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-navy-deep">
        <SlidersHorizontal className="h-5 w-5 text-gold" aria-hidden />
        Quote rates
      </h2>
      <p className="mb-4 max-w-2xl break-words text-sm text-ink/60">
        These rates apply to <strong className="font-semibold">new quotes only</strong>. Existing
        quotes keep the rates they were calculated with.
      </p>

      {error && !isNotConnected(error) && (
        <div className="mb-4">
          <ErrorBanner
            title="Could not save the rate card"
            message={error}
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {loading ? (
        <LoadingPanel label="Loading rates…" />
      ) : (
        <>
          {/* ── Service rate matrix ─────────────────────────────────────── */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] text-sm">
              <thead>
                <tr className="border-b border-navy/10 text-left text-xs uppercase tracking-wide text-ink/50">
                  <th scope="col" className="py-2 pr-3 font-semibold">Service level</th>
                  <th scope="col" className="px-2 py-2 font-semibold">Base fee</th>
                  <th scope="col" className="px-2 py-2 font-semibold">Per mile</th>
                  <th scope="col" className="px-2 py-2 font-semibold">Per extra stop</th>
                  <th scope="col" className="px-2 py-2 text-center font-semibold">Quotable</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.service_code} className="border-b border-navy/5 last:border-0">
                    <td className="py-3 pr-3 align-middle">
                      <span className="block font-semibold text-navy-deep">{r.service_code}</span>
                      <span className="block break-words text-xs text-ink/55">
                        {r.service_name}
                      </span>
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <MoneyInput
                        value={r.base_pickup_fee}
                        label={`${r.service_code} base pickup fee`}
                        onSave={(v) => saveRate(r.service_code, { base_pickup_fee: v })}
                      />
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <MoneyInput
                        value={r.per_mile_rate}
                        label={`${r.service_code} per mile rate`}
                        onSave={(v) => saveRate(r.service_code, { per_mile_rate: v })}
                      />
                    </td>
                    <td className="px-2 py-3 align-middle">
                      <MoneyInput
                        value={r.per_stop_fee}
                        label={`${r.service_code} per stop fee`}
                        onSave={(v) => saveRate(r.service_code, { per_stop_fee: v })}
                      />
                    </td>
                    <td className="px-2 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={r.is_quotable}
                        aria-label={`${r.service_code} is quotable`}
                        onChange={(e) =>
                          void saveRate(r.service_code, { is_quotable: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-navy/30 text-navy focus-visible:ring-2 focus-visible:ring-gold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Surcharges and thresholds ───────────────────────────────── */}
          <h3 className="mb-1 mt-8 text-sm font-semibold text-navy-deep">
            Surcharges and thresholds
          </h3>
          <p className="mb-3 text-xs text-ink/55">
            Flat fees and cut-offs that apply across every service level.
          </p>

          <ul className="divide-y divide-navy/5">
            {settings.map((s) => (
              <li key={s.key} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-navy-deep">{s.label}</p>
                  {s.note && <p className="break-words text-xs text-ink/55">{s.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <MoneyInput
                    value={s.value}
                    label={s.label}
                    prefix={UNIT_PREFIX[s.unit]}
                    onSave={(v) => saveSetting(s.key, v)}
                  />
                  <span className="w-16 text-xs text-ink/45">{UNIT_SUFFIX[s.unit]}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/**
 * A number box that saves on blur, or on Enter.
 *
 * Held as a string while being typed so a half-entered "1." does not collapse
 * to NaN, and reverted to the stored value if the field is left unparseable.
 */
function MoneyInput({
  value,
  label,
  prefix = "$",
  onSave,
}: {
  value: number;
  label: string;
  prefix?: string;
  onSave: (next: number) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);

  // Follow the row when the server replaces it.
  useEffect(() => setDraft(String(value)), [value]);

  async function commit() {
    const parsed = Number.parseFloat(draft);

    // Unparseable or unchanged — put the stored value back and do nothing.
    if (!Number.isFinite(parsed) || parsed < 0 || parsed === value) {
      setDraft(String(value));
      return;
    }

    setSaving(true);
    await onSave(parsed);
    setSaving(false);
  }

  return (
    <div
      className={cn(
        "flex w-28 items-center rounded-xl border border-navy/15 bg-white px-2",
        saving && "opacity-60"
      )}
    >
      {prefix && <span className="pr-0.5 text-sm text-ink/45">{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        aria-label={label}
        disabled={saving}
        onChange={(e) => setDraft(sanitizeDecimal(e.target.value))}
        onBlur={() => void commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void commit();
          }
        }}
        className="w-full bg-transparent py-1.5 text-sm tabular-nums outline-none"
      />
      {saving && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-ink/40" aria-hidden />}
    </div>
  );
}