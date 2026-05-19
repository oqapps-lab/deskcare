/**
 * Canonical routine slugs. MUST match `routines.slug` in Supabase.
 * Centralised so a slug rename touches one place, not 4.
 */
export const ROUTINE_SLUGS = {
  NECK_QUICK_2MIN: 'neck-quick-2min',
  WRISTS_QUICK_2MIN: 'wrists-quick-2min',
  BACK_QUICK_3MIN: 'back-quick-3min',
} as const;

/** Deep-link fallback when player/preview opened without routine param. */
export const DEFAULT_ROUTINE_SLUG = ROUTINE_SLUGS.NECK_QUICK_2MIN;
