import { router } from 'expo-router';

/**
 * Safe back-navigation that handles the deep-link case (push notification,
 * universal link, share URL) where the navigation stack is empty.
 *
 * Without this guard, router.back() is a silent no-op on a deep-link entry —
 * the user taps the chevron and nothing happens. Reported as BN4 in the
 * 2026-05-28 code-review against challenges.tsx; this helper is the
 * project-wide answer so every screen takes the same fall-back.
 *
 * Default fallback is `/main/home`. Pass a different path for screens whose
 * natural fallback is a sub-tab (e.g. profile sub-pages → `/main/profile`).
 */
export const safeBack = (fallback: string = '/main/home') => {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
};
