import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../supabase';

interface SessionState {
  /** Current Supabase auth session, or null when signed out. */
  session: Session | null;
  /** True once we've checked AsyncStorage and either restored a session or confirmed there is none. Mirrors the "has-rehydrated" pattern. */
  hasHydrated: boolean;
  /** Internal: subscription cleanup. */
  _unsub?: () => void;
  /** Call once at app boot — reads persisted session and subscribes to auth changes. Idempotent. */
  init: () => Promise<void>;
  /** Sign out and clear local state. */
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  session: null,
  hasHydrated: false,
  _unsub: undefined,

  init: async () => {
    if (get().hasHydrated) return;

    const { data } = await supabase.auth.getSession();
    set({ session: data.session ?? null, hasHydrated: true });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, next) => {
      set({ session: next ?? null });
    });
    set({ _unsub: () => sub.subscription.unsubscribe() });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));

/** Convenience selector — returns the user id if signed in, else null. */
export const useUserId = (): string | null =>
  useSession((s) => s.session?.user?.id ?? null);

/** Convenience selector — true once hydration is complete (regardless of signed-in state). */
export const useHasHydrated = (): boolean => useSession((s) => s.hasHydrated);
