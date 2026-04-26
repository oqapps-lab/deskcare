// Hand-written subset of DB types the app touches.
// Mirrors docs/05-database/DATABASE-SCHEMA.md after Russell's atom×reps changes.

export type BodyZoneSlug = 'neck' | 'back' | 'wrists' | 'full_body' | 'eyes' | 'sciatica';

export type ExerciseType =
  | 'stretch'
  | 'mobility'
  | 'strength'
  | 'nerve_glide'
  | 'tendon_glide'
  | 'breathing';

export type RoutineType = 'zone_based' | 'morning' | 'evening' | 'quick_relief';

export interface BodyZone {
  id: string;
  slug: BodyZoneSlug;
  name: string;
  icon_url: string | null;
  sort_order: number;
}

export interface Exercise {
  id: string;
  code: string;
  slug: string;
  title: string;
  title_en: string | null;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  reps_inside_atom: string | null;
  difficulty: 1 | 2 | 3;
  exercise_type: ExerciseType;
  is_premium: boolean;
  cautions: string | null;
  modifications: string | null;
}

export interface Routine {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body_zone_id: string;
  duration_seconds: number;
  is_premium: boolean;
  routine_type: RoutineType;
  sort_order: number;
}

export interface RoutineItem {
  id: string;
  routine_id: string;
  exercise_id: string;
  sort_order: number;
  reps: number;
  overlay_text: string | null;
  rest_seconds: number;
  /** Joined from exercises — populated by the hook. */
  exercise?: Exercise;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  onboarding_data: Record<string, unknown> | null;
}

export interface DeskcareSubscription {
  user_id: string;
  status: 'free' | 'trialing' | 'active' | 'expired' | 'cancelled' | 'paused' | 'billing_issue';
  plan: 'free' | 'pro_monthly' | 'pro_annual' | 'sciatica_addon' | 'lifetime';
  is_active: boolean;
  trial_end: string | null;
  current_period_end: string | null;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_sessions: number;
  total_minutes: number;
}
