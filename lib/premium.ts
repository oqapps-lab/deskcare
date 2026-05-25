/**
 * Premium-gate decisions for the app.
 *
 * Sources, in priority order:
 *
 * 1. TF-internal (EXPO_PUBLIC_PREMIUM_BYPASS=1): everything unlocked.
 *    Lets QA exercise the full content surface without wiring real IAP.
 *    Set this only on internal TestFlight builds.
 *
 * 2. Adapty profile entitlement: `accessLevels.premium.isActive`. Wired
 *    via `setPremiumFromProfile()` called from app/_layout.tsx Adapty
 *    activate flow + onLatestProfileLoad event subscription.
 *
 * 3. Default: false (locked).
 */
import { create } from 'zustand';

export const PREMIUM_BYPASS = process.env.EXPO_PUBLIC_PREMIUM_BYPASS === '1';

interface PremiumState {
  fromAdapty: boolean;
  setFromAdapty: (v: boolean) => void;
}

const usePremiumStore = create<PremiumState>((set) => ({
  fromAdapty: false,
  setFromAdapty: (v) => set({ fromAdapty: v }),
}));

/**
 * Reads premium state. BYPASS env wins. Otherwise Adapty profile.
 * Stable reference between renders — safe in dependency arrays.
 */
export const useIsPremium = (): boolean => {
  const fromAdapty = usePremiumStore((s) => s.fromAdapty);
  return PREMIUM_BYPASS || fromAdapty;
};

/**
 * Imperative setter for code outside React (Adapty event listener at
 * app boot). Accepts an Adapty `AdaptyProfile` and extracts entitlement.
 */
export const setPremiumFromProfile = (profile: unknown): void => {
  const isActive = !!(
    profile as { accessLevels?: { premium?: { isActive?: boolean } } }
  )?.accessLevels?.premium?.isActive;
  usePremiumStore.getState().setFromAdapty(isActive);
};
