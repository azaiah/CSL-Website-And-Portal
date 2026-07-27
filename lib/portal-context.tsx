"use client";

/**
 * lib/portal-context.tsx
 * ---------------------------------------------------------------------------
 * Portal session state backed by Supabase Auth (Google OAuth).
 * Replaces the Phase 1 localStorage front gate.
 * ---------------------------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  ROLES,
  isAllowedPortalEmail,
  getDefaultRoleForEmail,
  canSwitchRoles,
  type Role,
} from "@/lib/auth/config";

export type { Role } from "@/lib/auth/config";
export { ROLES };

export interface PortalProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
}

interface PortalState {
  ready: boolean;
  signedIn: boolean;
  user: User | null;
  profile: PortalProfile | null;
  role: Role;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: Role) => Promise<void>;
}

const PortalContext = createContext<PortalState | null>(null);

/** Brief pause so auth cookies are readable right after the OAuth redirect. */
const SESSION_RETRY_MS = 250;

async function resolveSessionUser(
  supabase: ReturnType<typeof createClient>
): Promise<User | null> {
  const readSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user ?? null;
  };

  let user = await readSession();
  if (user) return user;

  // Cookies may not be available on the first client tick after redirect.
  await new Promise((resolve) => setTimeout(resolve, SESSION_RETRY_MS));
  user = await readSession();
  if (user) return user;

  const {
    data: { user: verifiedUser },
  } = await supabase.auth.getUser();
  return verifiedUser ?? null;
}

async function fetchProfile(userId: string): Promise<PortalProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: ROLES.includes(data.role as Role) ? (data.role as Role) : "Owner",
  };
}

async function ensureProfile(user: User): Promise<PortalProfile | null> {
  const existing = await fetchProfile(user.id);
  if (existing) return existing;

  const role = getDefaultRoleForEmail(user.email);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      role,
    })
    .select("id, email, full_name, role")
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: ROLES.includes(data.role as Role) ? (data.role as Role) : "Owner",
  };
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PortalProfile | null>(null);

  const syncUser = useCallback(async (sessionUser: User | null) => {
    const supabase = createClient();

    if (!sessionUser || !isAllowedPortalEmail(sessionUser.email)) {
      if (sessionUser) await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return;
    }

    setUser(sessionUser);
    const p = await ensureProfile(sessionUser);
    setProfile(p);
  }, []);

  const loadSession = useCallback(async () => {
    const supabase = createClient();
    const sessionUser = await resolveSessionUser(supabase);
    await syncUser(sessionUser);
  }, [syncUser]);

  useEffect(() => {
    const supabase = createClient();

    loadSession().finally(() => setReady(true));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Ignore transient null sessions — only clear state on explicit sign-out.
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        return;
      }

      if (session?.user) {
        void syncUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSession, syncUser]);

  // Mobile browsers (iOS Safari, Android Chrome) often restore the previous page
  // from the back/forward cache instead of reloading it. When that happens the
  // effect above never re-runs, so a stale "signed out" login screen stays on
  // screen even though the sign-in already succeeded. Re-check the session
  // whenever the page is restored or becomes visible again.
  useEffect(() => {
    function recheckSession() {
      void loadSession();
    }

    function handlePageShow(event: PageTransitionEvent) {
      // `persisted` is true only for back/forward cache restores.
      if (event.persisted) recheckSession();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") recheckSession();
    }

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadSession]);

  async function signInWithGoogle() {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/portal/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: { prompt: "select_account" },
      },
    });

    if (error) throw error;
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function setRole(nextRole: Role) {
    if (!user || !canSwitchRoles(user.email)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, role: nextRole } : prev));
    }
  }

  const role = profile?.role ?? "Viewer";

  return (
    <PortalContext.Provider
      value={{
        ready,
        signedIn: !!user,
        user,
        profile,
        role,
        signInWithGoogle,
        signOut,
        setRole,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal(): PortalState {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within a PortalProvider");
  return ctx;
}
