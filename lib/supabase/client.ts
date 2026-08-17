"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * True when both public Supabase env vars are present.
 *
 * Every feature that persists something — notes, pipeline stages — checks this
 * first. Without it a missing env var surfaces as an unhandled exception deep
 * inside a component; with it the portal degrades honestly instead, telling the
 * user their change was not saved rather than pretending it was.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Browser Supabase client for portal auth and data reads/writes.
 * Uses the public anon key — RLS policies enforce access server-side.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
