import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { IS_EXPO_GO } from '../lib/native-runtime';

export interface AuthResult {
  ok: boolean;
  /** When `cancelled: true`, treat as a soft cancel (no UI error). */
  cancelled?: boolean;
  error?: string;
}

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Lazy-load the native modules — they crash at import time inside Expo Go.
// The wrappers below `require()` only when actually called.
const loadAppleAuth = (): any => {
  if (IS_EXPO_GO) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('expo-apple-authentication');
  } catch {
    return null;
  }
};

const loadGoogleSignIn = (): { GoogleSignin: any; statusCodes: any } | null => {
  if (IS_EXPO_GO) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-google-signin/google-signin');
  } catch {
    return null;
  }
};

// Configure Google Sign-In once at module init when running outside Expo Go.
if (!IS_EXPO_GO && GOOGLE_WEB_CLIENT_ID) {
  const gs = loadGoogleSignIn();
  if (gs) {
    gs.GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
    });
  }
}

/**
 * Auth hook around Supabase.
 *
 * Email/password: `signIn`, `signUp`.
 * Social: `signInWithApple` (iOS-only), `signInWithGoogle` (iOS+Android).
 *
 * Native social-auth modules are unavailable inside the public Expo Go shell,
 * so `signInWithApple` / `signInWithGoogle` short-circuit to a friendly
 * error there. They work normally in dev/preview/production EAS builds.
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
    const AppleAuthentication = loadAppleAuth();
    if (!AppleAuthentication) {
      const msg = IS_EXPO_GO
        ? 'Apple Sign-In requires a dev build (not Expo Go).'
        : 'Apple Sign-In module unavailable.';
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
    const gs = loadGoogleSignIn();
    if (!gs) {
      const msg = IS_EXPO_GO
        ? 'Google Sign-In requires a dev build (not Expo Go).'
        : 'Google Sign-In module unavailable.';
      setError(msg);
      return { ok: false, error: msg };
    }
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'android') {
        await gs.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: false });
      }
      const userInfo = await gs.GoogleSignin.signIn();
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
        e?.code === gs.statusCodes?.SIGN_IN_CANCELLED ||
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
    if (!IS_EXPO_GO) {
      const gs = loadGoogleSignIn();
      try {
        await gs?.GoogleSignin.signOut().catch(() => {});
      } catch {
        // best-effort — Google sign-out is local revoke, ok if it fails
      }
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
