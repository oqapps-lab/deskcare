import type { BodyZoneSlug } from './types/db';
import type { GlyphName, HaloTone } from '../components/ui';

/**
 * Rule-based Pain Coach decision tree. Pure functions — no LLM needed for
 * the 80% case ("I have neck pain → show me what helps"). v2 can plug
 * Claude in for free-text queries.
 */

export interface CoachZone {
  slug: BodyZoneSlug;
  icon: GlyphName;
  tone: HaloTone;
  label: string;
  /** Sub-prompt question — one short follow-up. */
  followUp: string;
  /** Sub-options that narrow the routine recommendation. */
  options: CoachOption[];
}

export interface CoachOption {
  key: string;
  label: string;
  /** Short reasoning shown after the user picks. */
  rationale: string;
  /** Routine slug to recommend (must match constants/routines or DB). */
  routineSlug: string;
  /** Optional article slug to surface alongside. */
  articleSlug?: string;
  /** Red-flag → show medical disclaimer instead of routine. */
  redFlag?: {
    title: string;
    body: string;
  };
}

export const COACH_ZONES: CoachZone[] = [
  {
    slug: 'neck',
    icon: 'refresh',
    tone: 'coral',
    label: 'Neck',
    followUp: 'How does it feel?',
    options: [
      {
        key: 'stiff_sides',
        label: 'Stiff side-to-side',
        rationale: 'Side-to-side stiffness usually means the upper trapezius and levator scapulae are short. Lengthen them gently.',
        routineSlug: 'neck-relief-3min',
        articleSlug: 'why-your-neck-hurts-at-5pm',
      },
      {
        key: 'forward_head',
        label: 'Aches from looking down',
        rationale: 'Forward-head loading. Activate the deep neck flexors with chin tucks, stretch the suboccipitals.',
        routineSlug: 'neck-relief-3min',
        articleSlug: 'why-your-neck-hurts-at-5pm',
      },
      {
        key: 'tension_top',
        label: 'Tension headache forming',
        rationale: 'Suboccipital tension often radiates as a band across the forehead. 60-second release helps.',
        routineSlug: 'neck-quick-60s',
      },
    ],
  },
  {
    slug: 'back',
    icon: 'infinity',
    tone: 'peach',
    label: 'Back',
    followUp: 'Where exactly?',
    options: [
      {
        key: 'upper_mid',
        label: 'Upper / between shoulder blades',
        rationale: 'Thoracic mobility + scap retraction undoes the rounded-forward day.',
        routineSlug: 'back-quick-2min',
      },
      {
        key: 'lower',
        label: 'Lower (above hips)',
        rationale: 'Lumbar tightness often pairs with short hip flexors. Decompression + glute work.',
        routineSlug: 'back-relief-3min',
        articleSlug: 'sleep-and-back-pain',
      },
      {
        key: 'side_sharp',
        label: 'Sharp pain on one side',
        rationale: 'Localized sharp pain warrants caution. Try gentle mobility — and rule out medical issues if it persists.',
        routineSlug: 'back-quick-2min',
        articleSlug: 'sciatica-vs-back-pain',
      },
    ],
  },
  {
    slug: 'eyes',
    icon: 'eye',
    tone: 'lavender',
    label: 'Eyes',
    followUp: 'What kind of strain?',
    options: [
      {
        key: 'tired_dry',
        label: 'Tired and dry',
        rationale: 'Reduced blink rate from staring. Conscious blinks + 20-20-20 + palming.',
        routineSlug: 'eye-relief-2min',
        articleSlug: 'computer-vision-syndrome',
      },
      {
        key: 'focus_blur',
        label: 'Hard to focus on distance',
        rationale: 'Ciliary muscle fatigued holding near-focus. Near-far flex exercises reset it.',
        routineSlug: 'eye-relief-2min',
        articleSlug: '20-20-20-rule-explained',
      },
      {
        key: 'headache_temple',
        label: 'Headache behind eyes',
        rationale: 'Vergence stress + dehydration. Hydrate first, then quick eye reset.',
        routineSlug: 'eye-quick-60s',
        articleSlug: 'computer-vision-syndrome',
      },
    ],
  },
  {
    slug: 'wrists',
    icon: 'plus',
    tone: 'mint',
    label: 'Wrists',
    followUp: 'How does it show up?',
    options: [
      {
        key: 'general_stiff',
        label: 'Generally stiff from typing',
        rationale: 'Forearm muscles get tight from prolonged grip. Mobility + nerve glides.',
        routineSlug: 'wrists-relief-2min',
      },
      {
        key: 'numb_tingle_night',
        label: 'Numb / tingling at night',
        rationale: 'Classic early-stage carpal tunnel. Median-nerve glides + neutral-wrist sleep.',
        routineSlug: 'wrists-relief-2min',
        articleSlug: 'carpal-tunnel-first-signs',
      },
      {
        key: 'thumb_base',
        label: 'Sore at the base of the thumb',
        rationale: 'Thumb basal joint stress. Mobility + grip-relief work.',
        routineSlug: 'wrists-quick-60s',
      },
    ],
  },
  {
    slug: 'sciatica',
    icon: 'bell',
    tone: 'coral',
    label: 'Sciatica / leg pain',
    followUp: 'Where does the pain go?',
    options: [
      {
        key: 'butt_to_calf',
        label: 'Buttock → back of leg → calf',
        rationale: 'Classic sciatic pattern. Gentle nerve glides; avoid aggressive stretching.',
        routineSlug: 'sciatica-gentle-phase1',
        articleSlug: 'sciatica-vs-back-pain',
      },
      {
        key: 'lower_back_only',
        label: 'Only lower back, no leg radiation',
        rationale: 'Probably muscular, not nerve. Standard back routine.',
        routineSlug: 'back-relief-3min',
        articleSlug: 'sciatica-vs-back-pain',
      },
      {
        key: 'saddle_numbness',
        label: 'Numbness in groin / inner thighs',
        rationale: '',
        routineSlug: '',
        redFlag: {
          title: 'See a doctor immediately',
          body: 'Saddle numbness can signal cauda equina syndrome — a medical emergency. Do NOT use exercises to fix this; go to urgent care now.',
        },
      },
    ],
  },
  {
    slug: 'full_body',
    icon: 'crown',
    tone: 'lavender',
    label: 'Just stiff overall',
    followUp: 'Which best fits?',
    options: [
      {
        key: 'after_long_sit',
        label: 'After a long sitting block',
        rationale: 'Time for a full-body reset — moves every joint.',
        routineSlug: 'full-body-3min',
      },
      {
        key: 'morning_stiff',
        label: 'Morning stiffness',
        rationale: 'Spine and hips need gentle wake-up. Light mobility wins.',
        routineSlug: 'full-body-3min',
      },
      {
        key: 'general_tired',
        label: 'Mental fatigue, not just physical',
        rationale: 'Movement re-oxygenates and shifts focus. Quick 60s wins.',
        routineSlug: 'full-body-quick-60s',
      },
    ],
  },
];
