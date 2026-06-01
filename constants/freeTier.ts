/**
 * Free-tier policy (tester P5 — "don't give the whole library free; limit it
 * hard like fitness apps do"). Researched against Bend / Stretchit / Calm /
 * Headspace etc. — the winning model for a daily-habit app is a *metered*
 * free tier (a small curated free pool, capped to N plays/day) with the 7-day
 * trial as the single unlock, rather than a hard wall (which kills the habit
 * loop + ASO "free app" discovery) or an over-generous freemium.
 *
 * The policy, in one place:
 *  - FREE pool: the Neck quick routine only (neck = the #1 desk complaint, the
 *    biggest hook). Everything else — Back/Wrists zones, ALL multi-day Programs,
 *    custom routines, premium Library exercises — is hard-locked premium.
 *  - METER: a non-premium user may start DAILY_FREE_PLAYS sessions from the free
 *    pool per local day. Beyond that → paywall. (The Eye 20-20-20 micro-break
 *    stays always-free and unmetered — it's a 30-second brand anchor, not a
 *    "session".)
 *  - Premium (Adapty entitlement OR EXPO_PUBLIC_PREMIUM_BYPASS) bypasses all of
 *    this — see useIsPremium / useCanPlayRoutine.
 */
import { ROUTINE_SLUGS } from './routines';

/** Non-premium users get this many free routine sessions per local day. */
export const DAILY_FREE_PLAYS = 1;

/** The curated always-available free routine pool (still metered to N/day). */
export const FREE_ROUTINE_SLUGS: readonly string[] = [ROUTINE_SLUGS.NECK_QUICK_2MIN];

/** True if a DB routine slug is in the free pool (custom routines are never free). */
export const isFreeRoutine = (slug?: string | null): boolean =>
  !!slug && FREE_ROUTINE_SLUGS.includes(slug);
