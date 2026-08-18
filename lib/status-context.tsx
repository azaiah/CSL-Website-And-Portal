"use client";

/**
 * lib/status-context.tsx
 * ---------------------------------------------------------------------------
 * ONE place that knows what state every record in the portal is actually in.
 *
 * The engine writes a starting status into lib/data/. Humans then change those
 * statuses — a document goes from "Action required" to "Ready to use", a draft
 * goes from "Awaiting approval" to "Sent", an opportunity moves from Found to
 * Contacted. Those overrides live in Postgres and are loaded here, ONCE, for
 * the whole portal session.
 *
 * Loading them in one place is the entire point. If the dashboard counted
 * outreach from the static file while the detail page read from the database,
 * the portal would confidently show two different numbers for the same
 * question, and nobody could tell which one was lying. Every view reads from
 * this provider, so they cannot disagree.
 *
 * Everything here is optimistic with a real rollback: a change appears
 * instantly, and if the write is refused it goes back and says why. Showing a
 * status that was never saved is the exact failure this system exists to
 * prevent.
 * ---------------------------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePortal } from "@/lib/portal-context";
import {
  opportunities as engineOpportunities,
  type Opportunity,
  type OpportunityStatus,
} from "@/lib/data/opportunities";
import { outreach as engineOutreach, type OutreachStatus } from "@/lib/data/outreach";
import { documents as engineDocuments, type DocumentStatus } from "@/lib/data/documents";
import { generatedDocuments } from "@/lib/data/generated-docs";
import {
  fetchPipelineState,
  savePipelineStage,
  clearPipelineStage,
  subscribeToPipelineState,
  type PipelineOverride,
} from "@/lib/supabase/pipeline-state";
import {
  fetchAllStatuses,
  saveStatus,
  clearStatus,
  subscribeToStatuses,
  statusKey,
  type StatusOverride,
  type StatusSubjectKind,
} from "@/lib/supabase/record-status";

/** Status set for a veterinary lead — how far along the call is. */
export type VetLeadStatus =
  | "not-started"
  | "attempted"
  | "spoke"
  | "follow-up"
  | "quoted"
  | "won"
  | "not-a-fit";

export const VET_LEAD_STATUS_LABEL: Record<VetLeadStatus, string> = {
  "not-started": "Not called yet",
  attempted: "Tried — no answer",
  spoke: "Spoke with them",
  "follow-up": "Follow-up needed",
  quoted: "Quote sent",
  won: "Won",
  "not-a-fit": "Not a fit",
};

export const VET_LEAD_STATUSES = Object.keys(
  VET_LEAD_STATUS_LABEL
) as VetLeadStatus[];

/** Which statuses mean an outreach draft actually reached its recipient. */
const REACHED: OutreachStatus[] = ["sent", "replied", "no-response", "closed"];

interface StatusState {
  ready: boolean;
  /** Set when saving is impossible at all (no database / migration missing). */
  problem: string | null;
  /** Most recent failed write, shown then dismissed. */
  lastError: string | null;
  dismissError: () => void;
  saving: boolean;

  /* ── Opportunities (backed by pipeline_state) ───────────────────────── */
  opportunityStatusOf: (o: Pick<Opportunity, "id" | "status">) => OpportunityStatus;
  opportunityOverride: (id: string) => PipelineOverride | undefined;
  /** Every opportunity with any human override already applied. */
  resolvedOpportunities: Opportunity[];
  setOpportunityStatus: (id: string, next: OpportunityStatus) => Promise<boolean>;
  resetOpportunityStatus: (id: string) => Promise<boolean>;

  /* ── Everything else (backed by record_status) ──────────────────────── */
  statusOf: <T extends string>(
    kind: StatusSubjectKind,
    id: string,
    engineStatus: T
  ) => T;
  override: (kind: StatusSubjectKind, id: string) => StatusOverride | undefined;
  setStatus: (
    kind: StatusSubjectKind,
    id: string,
    next: string
  ) => Promise<boolean>;
  resetStatus: (kind: StatusSubjectKind, id: string) => Promise<boolean>;

  /* ── Derived counts, override-aware ─────────────────────────────────── */
  outreachCounts: {
    drafted: number;
    awaitingApproval: number;
    approved: number;
    sent: number;
    responses: number;
  };
  documentsNeedingAction: number;
}

const Ctx = createContext<StatusState | null>(null);

export function StatusProvider({ children }: { children: ReactNode }) {
  const { user, profile, signedIn, ready: authReady } = usePortal();

  const [pipeline, setPipeline] = useState<Map<string, PipelineOverride>>(
    () => new Map()
  );
  const [statuses, setStatuses] = useState<Map<string, StatusOverride>>(
    () => new Map()
  );
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /* ── Load both override tables once, after sign-in ───────────────────── */
  // Gated on the session because RLS returns nothing to an anonymous visitor
  // anyway — firing these on the sign-in screen would be two guaranteed-empty
  // round trips before the user has even authenticated.
  useEffect(() => {
    if (!authReady) return;
    if (!signedIn) {
      setPipeline(new Map());
      setStatuses(new Map());
      setReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const [p, s] = await Promise.all([fetchPipelineState(), fetchAllStatuses()]);
      if (cancelled || !alive.current) return;

      const problems: string[] = [];

      if (p.ok) setPipeline(p.data);
      else if (p.error === "not-configured")
        problems.push("the portal database is not connected");
      else if (p.error === "no-table")
        problems.push("migration 002 has not been run");

      if (s.ok) setStatuses(s.data);
      else if (s.error === "no-table")
        problems.push("migration 003 has not been run");
      else if (s.error !== "not-configured" && !s.ok)
        problems.push("saved statuses could not be loaded");

      setProblem(
        problems.length
          ? `Changes are not being saved — ${problems.join(" and ")}.`
          : null
      );
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, signedIn]);

  /* ── Someone else changed something ──────────────────────────────────── */
  useEffect(() => {
    const offPipeline = subscribeToPipelineState((id, next) => {
      if (!alive.current) return;
      setPipeline((prev) => {
        const m = new Map(prev);
        if (next) m.set(id, next);
        else m.delete(id);
        return m;
      });
    });
    const offStatus = subscribeToStatuses((kind, id, next) => {
      if (!alive.current) return;
      setStatuses((prev) => {
        const m = new Map(prev);
        const k = statusKey(kind, id);
        if (next) m.set(k, next);
        else m.delete(k);
        return m;
      });
    });
    return () => {
      offPipeline();
      offStatus();
    };
  }, [signedIn]);

  const actorName =
    profile?.full_name?.trim() || profile?.email || user?.email || null;

  /* ── Opportunities ───────────────────────────────────────────────────── */
  const opportunityStatusOf = useCallback(
    (o: Pick<Opportunity, "id" | "status">): OpportunityStatus =>
      pipeline.get(o.id)?.status ?? o.status,
    [pipeline]
  );

  const opportunityOverride = useCallback(
    (id: string) => pipeline.get(id),
    [pipeline]
  );

  const resolvedOpportunities = useMemo(
    () =>
      engineOpportunities.map((o) => {
        const s = pipeline.get(o.id)?.status;
        return s && s !== o.status ? { ...o, status: s } : o;
      }),
    [pipeline]
  );

  const setOpportunityStatus = useCallback(
    async (id: string, next: OpportunityStatus) => {
      const previous = pipeline.get(id);
      const optimistic: PipelineOverride = {
        opportunityId: id,
        status: next,
        movedByName: actorName,
        movedAtISO: new Date().toISOString(),
      };
      setPipeline((prev) => new Map(prev).set(id, optimistic));

      if (problem) return true; // local-only; the banner already says so
      setSaving(true);
      const res = await savePipelineStage({
        opportunityId: id,
        status: next,
        movedBy: user?.id ?? null,
        movedByName: actorName,
      });
      if (!alive.current) return false;
      setSaving(false);

      if (res.ok) {
        setPipeline((prev) => new Map(prev).set(id, res.data));
        return true;
      }
      setPipeline((prev) => {
        const m = new Map(prev);
        if (previous) m.set(id, previous);
        else m.delete(id);
        return m;
      });
      setLastError(res.error);
      return false;
    },
    [pipeline, problem, user, actorName]
  );

  const resetOpportunityStatus = useCallback(
    async (id: string) => {
      const previous = pipeline.get(id);
      setPipeline((prev) => {
        const m = new Map(prev);
        m.delete(id);
        return m;
      });
      if (problem) return true;

      setSaving(true);
      const res = await clearPipelineStage(id);
      if (!alive.current) return false;
      setSaving(false);
      if (res.ok) return true;

      if (previous) setPipeline((prev) => new Map(prev).set(id, previous));
      setLastError(res.error);
      return false;
    },
    [pipeline, problem]
  );

  /* ── Documents, generated docs, outreach, vet leads ──────────────────── */
  const statusOf = useCallback(
    <T extends string>(kind: StatusSubjectKind, id: string, engineStatus: T): T => {
      const o = statuses.get(statusKey(kind, id));
      return (o ? (o.status as T) : engineStatus);
    },
    [statuses]
  );

  const override = useCallback(
    (kind: StatusSubjectKind, id: string) => statuses.get(statusKey(kind, id)),
    [statuses]
  );

  const setStatus = useCallback(
    async (kind: StatusSubjectKind, id: string, next: string) => {
      const k = statusKey(kind, id);
      const previous = statuses.get(k);
      const optimistic: StatusOverride = {
        subjectKind: kind,
        subjectId: id,
        status: next,
        note: null,
        changedByName: actorName,
        changedAtISO: new Date().toISOString(),
      };
      setStatuses((prev) => new Map(prev).set(k, optimistic));

      if (problem) return true;
      setSaving(true);
      const res = await saveStatus({
        subjectKind: kind,
        subjectId: id,
        status: next,
        changedBy: user?.id ?? null,
        changedByName: actorName,
      });
      if (!alive.current) return false;
      setSaving(false);

      if (res.ok) {
        setStatuses((prev) => new Map(prev).set(k, res.data));
        return true;
      }
      setStatuses((prev) => {
        const m = new Map(prev);
        if (previous) m.set(k, previous);
        else m.delete(k);
        return m;
      });
      setLastError(res.error);
      return false;
    },
    [statuses, problem, user, actorName]
  );

  const resetStatus = useCallback(
    async (kind: StatusSubjectKind, id: string) => {
      const k = statusKey(kind, id);
      const previous = statuses.get(k);
      setStatuses((prev) => {
        const m = new Map(prev);
        m.delete(k);
        return m;
      });
      if (problem) return true;

      setSaving(true);
      const res = await clearStatus(kind, id);
      if (!alive.current) return false;
      setSaving(false);
      if (res.ok) return true;

      if (previous) setStatuses((prev) => new Map(prev).set(k, previous));
      setLastError(res.error);
      return false;
    },
    [statuses, problem]
  );

  /* ── Derived counts, override-aware ──────────────────────────────────── */
  const outreachCounts = useMemo(() => {
    let awaitingApproval = 0;
    let approved = 0;
    let sent = 0;
    let responses = 0;

    for (const r of engineOutreach) {
      const s = statusOf<OutreachStatus>("outreach", r.id, r.status);
      if (s === "draft") awaitingApproval++;
      if (s === "approved") approved++;
      if (REACHED.includes(s)) sent++;
      if (s === "replied") responses++;
    }
    return {
      drafted: engineOutreach.length,
      awaitingApproval,
      approved,
      sent,
      responses,
    };
  }, [statusOf]);

  const documentsNeedingAction = useMemo(() => {
    let n = 0;
    for (const d of engineDocuments) {
      if (statusOf<DocumentStatus>("document", d.id, d.status) === "action-required") n++;
    }
    for (const d of generatedDocuments) {
      if (statusOf<DocumentStatus>("generated-doc", d.id, d.status) === "action-required") n++;
    }
    return n;
  }, [statusOf]);

  const value: StatusState = {
    ready,
    problem,
    lastError,
    dismissError: () => setLastError(null),
    saving,
    opportunityStatusOf,
    opportunityOverride,
    resolvedOpportunities,
    setOpportunityStatus,
    resetOpportunityStatus,
    statusOf,
    override,
    setStatus,
    resetStatus,
    outreachCounts,
    documentsNeedingAction,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStatuses(): StatusState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useStatuses must be used within a StatusProvider");
  }
  return ctx;
}
