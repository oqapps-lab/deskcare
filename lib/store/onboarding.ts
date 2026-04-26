import { create } from 'zustand';
import { supabase } from '../supabase';

export type PainFrequency = 'sometimes' | 'weekly' | 'daily';
export type WorkType = 'home' | 'office' | 'hybrid';
export type Goal = 'stop' | 'prevent' | 'energy';
export type DeskHours = '4–6' | '6–8' | '8+';

export interface OnboardingAnswers {
  /** Pain zones: any of `neck`, `back`, `eyes`, `wrists` (UI labels), plus pseudo `everything`. */
  pain_zones: string[];
  pain_frequency: PainFrequency | null;
  work_type: WorkType | null;
  goal: Goal | null;
  desk_hours: DeskHours | null;
}

interface OnboardingState extends OnboardingAnswers {
  setZones: (zones: string[]) => void;
  setFrequency: (f: PainFrequency) => void;
  setWork: (w: WorkType) => void;
  setGoal: (g: Goal) => void;
  setHours: (h: DeskHours) => void;
  /** Persist to profiles.onboarding_data + flip onboarding_completed=true.
   *  Best-effort: anonymous users get a no-op + ok=true so the demo flow continues. */
  saveToSupabase: (userId: string | null) => Promise<{ ok: boolean; error?: string }>;
  reset: () => void;
}

const initial: OnboardingAnswers = {
  pain_zones: [],
  pain_frequency: null,
  work_type: null,
  goal: null,
  desk_hours: null,
};

export const useOnboarding = create<OnboardingState>((set, get) => ({
  ...initial,
  setZones: (pain_zones) => set({ pain_zones }),
  setFrequency: (pain_frequency) => set({ pain_frequency }),
  setWork: (work_type) => set({ work_type }),
  setGoal: (goal) => set({ goal }),
  setHours: (desk_hours) => set({ desk_hours }),
  saveToSupabase: async (userId) => {
    if (!userId) return { ok: true };
    const { pain_zones, pain_frequency, work_type, goal, desk_hours } = get();
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_data: { pain_zones, pain_frequency, work_type, goal, desk_hours },
      })
      .eq('id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  },
  reset: () => set({ ...initial }),
}));
