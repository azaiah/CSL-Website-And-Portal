"use client";

import { useState } from "react";
import { Bell, Radar, Plug, UserCog } from "lucide-react";
import { usePortal, ROLES, type Role } from "@/lib/portal-context";
import { cn } from "@/lib/utils";
import { RateSettings } from "@/components/portal/quotes/rate-settings";

const notificationDefaults = [
  { id: "new-opps", label: "New opportunities found", desc: "Alert when the Opportunity Finder surfaces a match.", on: true },
  { id: "top-leads", label: "High-fit leads (80+)", desc: "Alert when the Lead Qualifier scores a strong fit.", on: true },
  { id: "deadlines", label: "Approaching deadlines", desc: "Remind before opportunity due dates.", on: true },
  { id: "weekly", label: "Weekly briefing ready", desc: "Notify when the weekly report is compiled.", on: false },
];

const sourceDefaults = [
  { id: "sam", label: "SAM.gov", on: true },
  { id: "eva", label: "Virginia eVA", on: true },
  { id: "dmas", label: "Virginia Medicaid / DMAS", on: true },
  { id: "va", label: "VA medical centers & clinics", on: true },
  { id: "hospitals", label: "Regional hospital systems", on: true },
  { id: "labs", label: "Independent laboratories", on: false },
];

const integrations = [
  { id: "email", label: "Email / CRM", desc: "Send approved outreach and sync contacts.", status: "Planned" },
  { id: "calendar", label: "Calendar", desc: "Add deadlines and meetings automatically.", status: "Planned" },
  { id: "sam-api", label: "SAM.gov API", desc: "Live opportunity ingestion.", status: "Phase 2" },
];

export function SettingsPanel() {
  const { role, setRole } = usePortal();
  const [notifs, setNotifs] = useState(notificationDefaults);
  const [sources, setSources] = useState(sourceDefaults);

  return (
    <div className="space-y-6">
      {/* Role */}
      <section className="card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-navy-deep">
          <UserCog className="h-5 w-5 text-gold" aria-hidden />
          Your role
        </h2>
        <p className="mb-4 text-sm text-ink/60">
          Roles change labels and access hints in this Phase 1 preview.{" "}
          Google sign-in via Supabase. Access limited to allowlisted accounts.
        </p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r: Role) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                r === role
                  ? "border-gold bg-gold/10 text-navy-deep"
                  : "border-navy/15 bg-white text-ink/70 hover:border-navy/30"
              )}
              aria-pressed={r === role}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* Quote rates. Its own component because it is the only section here
          backed by live Supabase rows rather than local UI state. */}
      <RateSettings />

      {/* Notifications */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy-deep">
          <Bell className="h-5 w-5 text-gold" aria-hidden />
          Notifications
        </h2>
        <ul className="divide-y divide-navy/5">
          {notifs.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-navy-deep">{n.label}</p>
                <p className="text-xs text-ink/55">{n.desc}</p>
              </div>
              <Toggle
                on={n.on}
                onChange={() =>
                  setNotifs((list) =>
                    list.map((x) => (x.id === n.id ? { ...x, on: !x.on } : x))
                  )
                }
                label={n.label}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Sources */}
      <section className="card">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-navy-deep">
          <Radar className="h-5 w-5 text-gold" aria-hidden />
          Opportunity sources
        </h2>
        <p className="mb-4 text-sm text-ink/60">
          Choose which sources the Opportunity Finder will scan when it goes live.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {sources.map((s) => (
            <label
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 bg-surface px-3 py-2.5"
            >
              <span className="text-sm text-navy-deep">{s.label}</span>
              <Toggle
                on={s.on}
                onChange={() =>
                  setSources((list) =>
                    list.map((x) => (x.id === s.id ? { ...x, on: !x.on } : x))
                  )
                }
                label={s.label}
              />
            </label>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="card">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy-deep">
          <Plug className="h-5 w-5 text-gold" aria-hidden />
          Integrations
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {integrations.map((i) => (
            <li key={i.id} className="rounded-xl border border-navy/10 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-deep">{i.label}</p>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#8a6c1f]">
                  {i.status}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink/60">{i.desc}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-ink/45">
          Integrations are placeholders for a future phase and are not yet
          connected.
        </p>
      </section>
    </div>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        on ? "bg-success" : "bg-navy/20"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
