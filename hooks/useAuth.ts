import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

/**
 * Auth hook around Supabase email/password.
 * Returns submit handlers + loading + last error. The session itself is held in
 * `useSession()` (Zustand) — listened via supabase.auth.onAuthStateChange.
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setError(error.message);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        setError(error.message);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { signIn, signUp, signOut, loading, error };
};
