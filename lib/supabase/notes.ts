"use client";

/**
 * lib/supabase/notes.ts
 * ---------------------------------------------------------------------------
 * Data access for shared, attributed notes on portal records.
 *
 * Notes are the one part of the portal that humans author rather than the
 * engine, so they live in Postgres rather than lib/data/. Everything here is a
 * thin, typed wrapper over the `record_notes` table created in
 * supabase/migrations/002_notes_and_pipeline.sql.
 *
 * Two rules the rest of the app relies on:
 *   1. NOTE_MAX_CHARS is the single source of truth for the cap. The textarea,
 *      the counter and the database CHECK constraint all trace back to this
 *      number, so they cannot disagree.
 *   2. Nothing here throws. Every function returns a result object, because a
 *      note that failed to save must be reported to the person who wrote it —
 *      never swallowed, and never allowed to blank the page they were typing on.
 * ---------------------------------------------------------------------------
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/** Hard cap on a single note, enforced in the UI and in Postgres. */
export const NOTE_MAX_CHARS = 3000;

/** Which kind of record a note is attached to. */
export type NoteSubjectKind = "opportunity" | "vet-lead";

export interface RecordNote {
  id: string;
  subjectId: string;
  subjectKind: NoteSubjectKind;
  body: string;
  authorId: string;
  authorEmail: string;
  authorName: string | null;
  edited: boolean;
  createdISO: string;
  updatedISO: string;
}

/** Uniform result so callers can show a real error instead of guessing. */
export type NoteResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const NOT_CONFIGURED =
  "Notes are not connected yet — Supabase environment variables are missing.";

/** Shape returned by the select below, before it is camel-cased. */
interface NoteRow {
  id: string;
  subject_id: string;
  subject_kind: NoteSubjectKind;
  body: string;
  author_id: string;
  author_email: string;
  author_name: string | null;
  edited: boolean;
  created_at: string;
  updated_at: string;
}

const COLUMNS =
  "id, subject_id, subject_kind, body, author_id, author_email, author_name, edited, created_at, updated_at";

function toNote(r: NoteRow): RecordNote {
  return {
    id: r.id,
    subjectId: r.subject_id,
    subjectKind: r.subject_kind,
    body: r.body,
    authorId: r.author_id,
    authorEmail: r.author_email,
    authorName: r.author_name,
    edited: r.edited,
    createdISO: r.created_at,
    updatedISO: r.updated_at,
  };
}

/**
 * Every note on one record, newest first.
 *
 * A missing table is treated as "no notes yet" rather than an error: the code
 * ships before the migration is run, and a red error box on a brand-new
 * opportunity would be misleading. Any other failure is surfaced.
 */
export async function fetchNotes(
  subjectKind: NoteSubjectKind,
  subjectId: string
): Promise<NoteResult<RecordNote[]>> {
  if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("record_notes")
    .select(COLUMNS)
    .eq("subject_kind", subjectKind)
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return { ok: true, data: [] };
    return { ok: false, error: readableError(error) };
  }

  return { ok: true, data: (data ?? []).map((r) => toNote(r as NoteRow)) };
}

/** Write a new note as the signed-in user. */
export async function createNote(input: {
  subjectKind: NoteSubjectKind;
  subjectId: string;
  body: string;
  authorId: string;
  authorEmail: string;
  authorName: string | null;
}): Promise<NoteResult<RecordNote>> {
  if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

  const body = input.body.trim();
  if (!body) return { ok: false, error: "Write something first." };
  if (body.length > NOTE_MAX_CHARS) {
    return {
      ok: false,
      error: `Notes are limited to ${NOTE_MAX_CHARS.toLocaleString()} characters.`,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("record_notes")
    .insert({
      subject_kind: input.subjectKind,
      subject_id: input.subjectId,
      body,
      author_id: input.authorId,
      author_email: input.authorEmail,
      author_name: input.authorName,
    })
    .select(COLUMNS)
    .single();

  if (error || !data) {
    return { ok: false, error: readableError(error) };
  }
  return { ok: true, data: toNote(data as NoteRow) };
}

/** Edit your own note. RLS rejects anyone else's. */
export async function updateNote(
  id: string,
  body: string
): Promise<NoteResult<RecordNote>> {
  if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

  const next = body.trim();
  if (!next) return { ok: false, error: "A note cannot be empty." };
  if (next.length > NOTE_MAX_CHARS) {
    return {
      ok: false,
      error: `Notes are limited to ${NOTE_MAX_CHARS.toLocaleString()} characters.`,
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("record_notes")
    .update({ body: next })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error || !data) return { ok: false, error: readableError(error) };
  return { ok: true, data: toNote(data as NoteRow) };
}

/** Delete your own note. RLS rejects anyone else's. */
export async function deleteNote(id: string): Promise<NoteResult<true>> {
  if (!isSupabaseConfigured()) return { ok: false, error: NOT_CONFIGURED };

  const supabase = createClient();
  const { error } = await supabase.from("record_notes").delete().eq("id", id);
  if (error) return { ok: false, error: readableError(error) };
  return { ok: true, data: true };
}

/* ─────────────────────────────── error shaping ──────────────────────────── */

interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string | null;
}

/**
 * PostgREST reports an absent table as 42P01 / PGRST205. That means the
 * migration has not been run yet, which is a deployment state rather than a
 * failure the user caused.
 */
function isMissingTable(error: PostgrestLikeError | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    Boolean(error.message?.includes("record_notes") && error.message?.includes("does not exist"))
  );
}

function readableError(error: PostgrestLikeError | null): string {
  if (!error) return "Something went wrong saving that note.";

  if (isMissingTable(error)) {
    return "Notes table not found — run migration 002 in the Supabase SQL editor.";
  }
  // 23514 = CHECK constraint. The only CHECK on this table is the length cap.
  if (error.code === "23514") {
    return `Notes are limited to ${NOTE_MAX_CHARS.toLocaleString()} characters.`;
  }
  // 42501 = insufficient privilege, i.e. RLS said no.
  if (error.code === "42501") {
    return "You can only edit notes you wrote yourself.";
  }
  return error.message || "Something went wrong saving that note.";
}
