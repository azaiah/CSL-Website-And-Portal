"use client";

/**
 * components/portal/notes-thread.tsx
 * ---------------------------------------------------------------------------
 * The shared notes thread, rendered on any portal record that has an id.
 *
 * Everyone in the portal reads the same thread and every entry says who wrote
 * it — that is the point. Notes are how "I called them, ask for Maria after
 * 2pm" survives the week; a private scratchpad would lose that the moment two
 * people work the same board.
 *
 * Authorship is enforced in Postgres, not here: RLS lets anyone read, but only
 * the author may edit or delete. The Edit and Delete buttons are hidden on
 * other people's notes as a courtesy, not as the security boundary.
 *
 * Deliberately generic over `subjectKind` so the same component serves the
 * opportunity detail and the vet-lead card without either growing its own
 * half-copy of this logic.
 * ---------------------------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  Trash2,
  Pencil,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { usePortal } from "@/lib/portal-context";
import {
  NOTE_MAX_CHARS,
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
  type NoteSubjectKind,
  type RecordNote,
} from "@/lib/supabase/notes";
import { cn, formatRelative } from "@/lib/utils";

/** Below this many characters remaining the counter starts warning. */
const COUNTER_WARN_AT = 300;

export function NotesThread({
  subjectKind,
  subjectId,
  /** Optional line under the heading, e.g. what this thread is for. */
  hint,
}: {
  subjectKind: NoteSubjectKind;
  subjectId: string;
  hint?: string;
}) {
  const { user, profile, ready, signedIn } = usePortal();

  const [notes, setNotes] = useState<RecordNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  // Guards a setState after the record changes or the modal closes mid-request.
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchNotes(subjectKind, subjectId);
    if (!aliveRef.current) return;
    if (res.ok) {
      setNotes(res.data);
      setLoadError(null);
    } else {
      setNotes([]);
      setLoadError(res.error);
    }
    setLoading(false);
  }, [subjectKind, subjectId]);

  useEffect(() => {
    // Reset per record — otherwise opening a second opportunity would flash the
    // previous one's thread while the new fetch is in flight.
    setNotes([]);
    setDraft("");
    setEditingId(null);
    setSaveError(null);
    void load();
  }, [load]);

  const canWrite = ready && signedIn && Boolean(user?.id);

  // Shown above the composer. On a shared thread it matters that you can see
  // whose name is about to be attached to what you are typing — especially on
  // the tech accounts, which can be signed in as more than one person.
  const authorName =
    profile?.full_name?.trim() ||
    profile?.email ||
    user?.email ||
    "Portal user";

  const remaining = NOTE_MAX_CHARS - draft.length;

  async function submit() {
    if (!user?.id || saving) return;
    const body = draft.trim();
    if (!body) return;

    setSaving(true);
    setSaveError(null);
    const res = await createNote({
      subjectKind,
      subjectId,
      body,
      authorId: user.id,
      authorEmail: profile?.email || user.email || "",
      authorName: profile?.full_name ?? null,
    });
    if (!aliveRef.current) return;

    if (res.ok) {
      setNotes((prev) => [res.data, ...prev]);
      setDraft("");
    } else {
      // Keep the text in the box. Losing what someone just typed because the
      // network blinked is the worst possible response to a failed save.
      setSaveError(res.error);
    }
    setSaving(false);
  }

  async function saveEdit(id: string) {
    const body = editDraft.trim();
    if (!body) return;

    const res = await updateNote(id, body);
    if (!aliveRef.current) return;

    if (res.ok) {
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
      setEditingId(null);
      setEditDraft("");
      setSaveError(null);
    } else {
      setSaveError(res.error);
    }
  }

  async function remove(id: string) {
    const previous = notes;
    // Optimistic: the row disappears immediately and comes back if the delete
    // is refused, which is far less jarring than a spinner on a destructive act.
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const res = await deleteNote(id);
    if (!aliveRef.current) return;
    if (!res.ok) {
      setNotes(previous);
      setSaveError(res.error);
    }
  }

  return (
    <section>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-deep">
        <MessageSquare className="h-4 w-4 text-gold" aria-hidden />
        Notes
        <span className="rounded-full bg-navy/10 px-1.5 text-xs font-bold text-navy">
          {notes.length}
        </span>
      </h3>
      <p className="mt-1 text-xs text-ink/50">
        {hint ??
          "Shared with everyone on the portal. Each note shows who wrote it — only you can edit or delete your own."}
      </p>

      {/* ── Composer ─────────────────────────────────────────────────────── */}
      {canWrite ? (
        <div className="mt-3">
          <label className="sr-only" htmlFor={`note-${subjectId}`}>
            Add a note
          </label>
          <p className="mb-1.5 break-words text-xs text-ink/45">
            Posting as{" "}
            <span className="font-semibold text-navy-deep">{authorName}</span>
          </p>
          <textarea
            id={`note-${subjectId}`}
            value={draft}
            maxLength={NOTE_MAX_CHARS}
            onChange={(e) => setDraft(e.target.value.slice(0, NOTE_MAX_CHARS))}
            rows={4}
            placeholder="What happened on the call? Who did you speak to, what did they say, what happens next?"
            className="w-full resize-y rounded-xl border border-navy/15 bg-white px-3 py-2.5 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/25"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span
              className={cn(
                "text-xs tabular-nums",
                remaining <= 0
                  ? "font-semibold text-red-600"
                  : remaining <= COUNTER_WARN_AT
                    ? "font-semibold text-[#8a6c1f]"
                    : "text-ink/45"
              )}
            >
              {draft.length.toLocaleString()} /{" "}
              {NOTE_MAX_CHARS.toLocaleString()}
              {remaining <= COUNTER_WARN_AT && remaining > 0
                ? ` — ${remaining.toLocaleString()} left`
                : ""}
            </span>

            <button
              type="button"
              onClick={submit}
              disabled={saving || draft.trim().length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy-deep px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-3.5 w-3.5" aria-hidden />
              )}
              {saving ? "Saving…" : "Add note"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-navy/15 p-4 text-xs text-ink/45">
          Sign in to add a note.
        </p>
      )}

      {saveError && <Problem>{saveError}</Problem>}

      {/* ── Thread ───────────────────────────────────────────────────────── */}
      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-ink/45">
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Loading notes…
        </p>
      ) : loadError ? (
        <Problem>{loadError}</Problem>
      ) : notes.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-navy/15 p-4 text-xs text-ink/45">
          No notes yet. The first call is worth writing down.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((n) => {
            const mine = n.authorId === user?.id;
            const editing = editingId === n.id;
            return (
              <li
                key={n.id}
                className="rounded-xl border border-navy/10 bg-white p-3.5"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="break-words text-xs font-semibold text-navy-deep">
                    {n.authorName?.trim() || n.authorEmail}
                  </span>
                  {mine && (
                    <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8a6c1f]">
                      You
                    </span>
                  )}
                  <span className="text-xs text-ink/40">
                    {formatRelative(n.createdISO)}
                  </span>
                  {n.edited && (
                    <span className="text-[10px] uppercase tracking-wide text-ink/35">
                      edited
                    </span>
                  )}
                </div>

                {editing ? (
                  <div className="mt-2">
                    <textarea
                      value={editDraft}
                      maxLength={NOTE_MAX_CHARS}
                      onChange={(e) =>
                        setEditDraft(e.target.value.slice(0, NOTE_MAX_CHARS))
                      }
                      rows={4}
                      className="w-full resize-y rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/25"
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="mr-auto text-xs tabular-nums text-ink/45">
                        {editDraft.length.toLocaleString()} /{" "}
                        {NOTE_MAX_CHARS.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => saveEdit(n.id)}
                        disabled={editDraft.trim().length === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-navy-deep px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy disabled:opacity-40"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-surface"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* whitespace-pre-wrap keeps the writer's own paragraphs;
                        break-words stops a long URL from widening the panel. */}
                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/80">
                      {n.body}
                    </p>

                    {mine && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(n.id);
                            setEditDraft(n.body);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-2.5 py-1 text-xs font-semibold text-navy transition-colors hover:bg-surface"
                        >
                          <Pencil className="h-3 w-3" aria-hidden />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(n.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden />
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Problem({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="break-words">{children}</span>
    </p>
  );
}
