import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';

export interface AuthResult {
  ok: boolean;
  /** When `cancelled: true`, treat as a soft cancel (no UI error). */
  cancelled?: boolean;
  error?: string;
}

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (GOOGLE_WEB_CLIENT_ID) {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
}

/**
 * Auth hook around Supabase.
 *
 * Email/password: `signIn`, `signUp`.
 * Social: `signInWithApple` (iOS-only), `signInWithGoogle` (iOS+Android).
 *
 * The session itself is held in `useSession()` (Zustand) — listened via
 * supabase.auth.onAuthStateChange. The `signIn*` methods only kick off the
 * exchange; callers route after `r.ok`.
 *
 * Cancellation policy: when the user backs out of the system sheet, the
 * method returns `{ ok: false, cancelled: true }` and DOES NOT set the
 * shared `error` field — callers should not show an error UI for cancels.
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

  const signInWithApple = useCallback(async (): Promise<AuthResult> => {
    if (Platform.OS !== 'ios') {
      const msg = 'Apple Sign-In requires iOS.';
      setError(msg);
      return { ok: false, error: msg };
    }
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      const msg = 'Apple Sign-In is unavailable on this device.';
      setError(msg);
      return { ok: false, error: msg };
    }
    setLoading(true);
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        const msg = 'No identity token returned by Apple.';
        setError(msg);
        return { ok: false, error: msg };
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) {
        setError(error.message);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (e: any) {
      // Apple emits ERR_REQUEST_CANCELED on user-initiated cancel.
      if (e?.code === 'ERR_REQUEST_CANCELED') return { ok: false, cancelled: true };
      const msg = e?.message ?? 'Apple Sign-In failed';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      const msg = 'Google Sign-In is not configured (missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).';
      setError(msg);
      return { ok: false, error: msg };
    }
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
      }
      const userInfo = await GoogleSignin.signIn();
      // SDK 13+ returns `{ data: { idToken, ... } }`; older returns idToken at
      // the top level. Normalize both shapes.
      const idToken =
        (userInfo as any)?.idToken ?? (userInfo as any)?.data?.idToken ?? null;
      if (!idToken) {
        const msg = 'No idToken returned by Google.';
        setError(msg);
        return { ok: false, error: msg };
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) {
        setError(error.message);
        return { ok: false, error: error.message };
      }
      return { ok: true };
    } catch (e: any) {
      if (
        e?.code === statusCodes.SIGN_IN_CANCELLED ||
        e?.code === '-5' ||
        e?.code === 'CANCELED'
      ) {
        return { ok: false, cancelled: true };
      }
      const msg = e?.message ?? 'Google Sign-In failed';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await GoogleSignin.signOut().catch(() => {});
    } catch {
      // best-effort — Google sign-out is local revoke, ok if it fails
    }
    await supabase.auth.signOut();
  }, []);

  return {
    signIn,
    signUp,
    signInWithApple,
    signInWithGoogle,
    signOut,
    loading,
    error,
  };
};
