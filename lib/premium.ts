/**
 * Premium-gate decisions for the app. Two modes:
 *
 * 1. TF-internal (EXPO_PUBLIC_PREMIUM_BYPASS=1): every premium item is
 *    unlocked. Lets QA exercise the full content surface without wiring
 *    real IAP. Set this only on internal TestFlight builds.
 *
 * 2. Production: Adapty SDK is the source of truth. The current build does
 *    not yet read live entitlements (Adapty webhook → deskcare_subscriptions
 *    is wired in Stage 7). Until then, production behaves as fully locked
 *    for any user with no `deskcare_subscriptions.is_active=true`.
 *
 * To migrate this to real entitlements, replace the body of `useIsPremium`
 * with a Zustand selector hydrated from a SECURITY-DEFINER RPC or from
 * Adapty.getProfile().
 */

export const PREMIUM_BYPASS = process.env.EXPO_PUBLIC_PREMIUM_BYPASS === '1';

/**
 * Returns whether the current user can access premium content.
 *
 * TF-internal: always true (bypass).
 * Production stub: always false (no entitlement source yet).
 *
 * Stable identity — safe to call from any render. Not actually a hook
 * (no React state subscription), but exposed via the `use*` prefix so
 * future versions can swap to a Zustand selector without touching call
 * sites.
 */
export const useIsPremium = (): boolean => PREMIUM_BYPASS;
