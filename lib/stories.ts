/**
 * Story content — IG-stories-format educational micro-content for desk
 * health + productivity. LOCAL (no DB) so it ships instantly and works
 * offline. Each story is a set of tap-through pages. Added 2026-05-31 per
 * tester ask to make the app a "must-have" with залипательный content,
 * not just exercise videos.
 *
 * i18n: titles/pages are English here; the t()-key variant can come later.
 * Kept as plain strings to ship the feature now without a 13-locale batch.
 */

export type StoryTone = 'coral' | 'lavender' | 'mint' | 'peach' | 'sky';

export interface StoryPage {
  /** Big headline on the page. */
  heading: string;
  /** Supporting body copy. */
  body: string;
  /** Optional one-line takeaway pinned at the bottom. */
  takeaway?: string;
}

export interface Story {
  id: string;
  /** Short label under the bubble on the rail. */
  label: string;
  /** Cover headline (page 0 is generated from this). */
  title: string;
  tone: StoryTone;
  /** Emoji/glyph shown in the rail bubble + cover. */
  glyph: string;
  pages: StoryPage[];
}

export const STORIES: ReadonlyArray<Story> = [
  {
    id: 'desk-setup',
    label: 'Desk setup',
    title: 'The 5-minute desk reset',
    tone: 'coral',
    glyph: 'D',
    pages: [
      {
        heading: 'Screen at eye level',
        body: 'The top of your monitor should sit at or just below eye level. Looking down for hours is what overloads your neck.',
        takeaway: 'Raise the screen, not your chin.',
      },
      {
        heading: 'Elbows at 90°',
        body: 'Keep forearms parallel to the floor, shoulders relaxed. If you’re reaching up or hunching down, your chair or desk height is off.',
        takeaway: 'Forearms flat, shoulders soft.',
      },
      {
        heading: 'Feet flat, hips back',
        body: 'Sit all the way back so the chair supports your lower back. Feet flat on the floor or a footrest — never tucked under you.',
        takeaway: 'Let the chair do the work.',
      },
    ],
  },
  {
    id: 'eye-health',
    label: 'Eye health',
    title: 'Save your eyes: 20-20-20',
    tone: 'lavender',
    glyph: 'E',
    pages: [
      {
        heading: 'The 20-20-20 rule',
        body: 'Every 20 minutes, look at something 20 feet away for 20 seconds. It relaxes the focusing muscle that screens keep tense all day.',
        takeaway: 'Every 20 min, look far for 20 sec.',
      },
      {
        heading: 'You blink 60% less at screens',
        body: 'Staring dries your eyes out. Consciously blink a few full blinks each break — it re-coats and resets your vision.',
        takeaway: 'Blink fully, on purpose.',
      },
      {
        heading: 'Arm’s length, slightly down',
        body: 'Keep the screen about an arm’s length away and angled slightly downward. Too close forces your eyes to overwork.',
        takeaway: 'One arm away, tilt down a touch.',
      },
    ],
  },
  {
    id: 'posture-reset',
    label: 'Posture',
    title: 'Undo the desk slump',
    tone: 'mint',
    glyph: 'P',
    pages: [
      {
        heading: 'The hourly reset',
        body: 'Roll your shoulders back and down, lengthen the back of your neck, and take one slow breath. Three seconds, every hour.',
        takeaway: 'Shoulders back, neck long, breathe.',
      },
      {
        heading: 'Tech-neck is real',
        body: 'Every inch your head juts forward adds ~4–5 kg of load on your neck. Bring the screen to you, not your head to the screen.',
        takeaway: 'Stack your head over your shoulders.',
      },
      {
        heading: 'Move beats perfect posture',
        body: 'No posture is good for hours. The best position is the next one — small frequent shifts beat sitting "correctly" frozen.',
        takeaway: 'The best posture is your next one.',
      },
    ],
  },
  {
    id: 'productivity',
    label: 'Focus',
    title: 'Beat the afternoon slump',
    tone: 'peach',
    glyph: 'F',
    pages: [
      {
        heading: 'Move to refocus',
        body: 'A 2-minute stretch sends blood and oxygen back to your brain. It’s a faster reset than another coffee — and it lasts longer.',
        takeaway: 'Stretch to think clearer.',
      },
      {
        heading: 'Work in 50/10 blocks',
        body: 'Focus for ~50 minutes, then take a real 10-minute break that includes standing and moving. Your output per hour goes up, not down.',
        takeaway: '50 on, 10 moving.',
      },
      {
        heading: 'Protect the first hour',
        body: 'Do your hardest task before email and chats. Willpower and focus are highest early — don’t spend them on your inbox.',
        takeaway: 'Hard task first, inbox later.',
      },
    ],
  },
  {
    id: 'wrist-care',
    label: 'Wrists',
    title: 'Happy hands at the keyboard',
    tone: 'sky',
    glyph: 'W',
    pages: [
      {
        heading: 'Float, don’t plant',
        body: 'Keep wrists neutral and slightly floating while typing — resting them hard on the edge compresses the nerves that run through.',
        takeaway: 'Neutral wrists, light touch.',
      },
      {
        heading: 'Open the claw',
        body: 'Gripping mouse and keys curls your hands all day. Every hour, spread your fingers wide and shake them out for 10 seconds.',
        takeaway: 'Spread + shake, hourly.',
      },
      {
        heading: 'Tingling? Listen.',
        body: 'Numbness or pins-and-needles in the fingers is an early carpal-tunnel signal. Nerve glides + breaks now save you pain later.',
        takeaway: 'Tingles = take a break now.',
      },
    ],
  },
];

export const getStory = (id: string): Story | undefined =>
  STORIES.find((s) => s.id === id);
