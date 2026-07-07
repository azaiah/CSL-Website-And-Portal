"use client";

/**
 * lib/portal-context.tsx
 * ---------------------------------------------------------------------------
 * Phase 1 front-gate state. There is NO real authentication here — this simply
 * tracks a non-secure "signed in" flag and the selected role (which only
 * changes labels). Persisted to localStorage so a refresh keeps you in.
 *
 * TODO: replace with real auth (e.g. Auth.js / Clerk / a backend session).
 * ---------------------------------------------------------------------------
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Role = "Owner" | "Admin" | "Viewer";
export const ROLES: Role[] = ["Owner", "Admin", "Viewer"];

interface PortalState {
  ready: boolean;
  signedIn: boolean;
  role: Role;
  signIn: (role: Role) => void;
  signOut: () => void;
  setRole: (role: Role) => void;
}

const STORAGE_KEY = "csl-portal-session";

const PortalContext = createContext<PortalState | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRoleState] = useState<Role>("Owner");

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { signedIn: boolean; role: Role };
        setSignedIn(!!parsed.signedIn);
        if (ROLES.includes(parsed.role)) setRoleState(parsed.role);
      }
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  function persist(next: { signedIn: boolean; role: Role }) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function signIn(nextRole: Role) {
    setSignedIn(true);
    setRoleState(nextRole);
    persist({ signedIn: true, role: nextRole });
  }

  function signOut() {
    setSignedIn(false);
    persist({ signedIn: false, role });
  }

  function setRole(nextRole: Role) {
    setRoleState(nextRole);
    persist({ signedIn, role: nextRole });
  }

  return (
    <PortalContext.Provider
      value={{ ready, signedIn, role, signIn, signOut, setRole }}
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
