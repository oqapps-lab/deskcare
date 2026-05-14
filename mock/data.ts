// Mock data for DeskCare prototype
// Primary persona: Marina, 31, frontend dev, neck pain, Austin TX

export interface Badge {
  id: string;
  label: string;
  earned: boolean;
  icon: 'flame' | 'ribbon' | 'star' | 'diamond';
}

export interface FocusAreas {
  neck: number;
  back: number;
  eyes: number;
  wrists: number;
}

export interface User {
  name: string;
  streak: number;
  totalSessions: number;
  totalMinutes: number;
  /** Mon–Sun; true = session completed */
  weekActivity: [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
  painZones: string[];
  hasPainCheckInToday: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  duration: string;
  sets?: number;
  reps?: number;
}

export interface Routine {
  id: string;
  name: string;
  zone: ZoneId;
  zoneLabel: string;
  durationMin: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  targetMuscles: string;
  exercises: Exercise[];
}

export type ZoneId = 'neck' | 'back' | 'eyes' | 'wrists';

export interface BodyZone {
  id: ZoneId;
  label: string;
  emoji: string;
}

export const mockUser: User = {
  name: 'Marina',
  streak: 6,
  totalSessions: 42,
  totalMinutes: 126,
  weekActivity: [true, true, true, true, true, true, false],
  painZones: ['neck', 'eyes'],
  hasPainCheckInToday: false,
};

export const BODY_ZONES: BodyZone[] = [
  { id: 'neck',   label: 'Neck',   emoji: '🦴' },
  { id: 'back',   label: 'Back',   emoji: '💪' },
  { id: 'eyes',   label: 'Eyes',   emoji: '👁' },
  { id: 'wrists', label: 'Wrists', emoji: '🤚' },
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const mockActivityGrid: number[][] = [
  [2, 3, 1, 3, 2, 1, 0],
  [1, 2, 3, 2, 3, 2, 1],
  [0, 3, 2, 3, 1, 2, 0],
  [2, 3, 1, 2, 0, 0, 0],
];

export const mockFocusAreas: FocusAreas = {
  neck:   0.80,
  back:   0.53,
  eyes:   0.30,
  wrists: 0.08,
};

export const mockBadges: Badge[] = [
  { id: '3day',  label: '3-day',  earned: true,  icon: 'flame'   },
  { id: '7day',  label: '7-day',  earned: true,  icon: 'ribbon'  },
  { id: '14day', label: '14-day', earned: true,  icon: 'star'    },
  { id: '30day', label: '30-day', earned: false, icon: 'diamond' },
];

export const mockSettings = {
  reminderFrequency: 'Every 45 min',
  targetDuration:    '5 minutes',
  focusUpperBody:    true,
  focusLowerBody:    false,
  hapticFeedback:    true,
  ambientSounds:     false,
};

export const mockRoutines: Record<ZoneId, Routine> = {
  neck: {
    id: 'neck-relief',
    name: 'Neck Relief',
    zone: 'neck',
    zoneLabel: 'NECK',
    durationMin: 3,
    level: 'Beginner',
    description:
      'Releases tension in the cervical spine and trapezius muscles after long hours at a screen.',
    targetMuscles: 'Trapezius, sternocleidomastoid, levator scapulae',
    exercises: [
      { id: 'e1', name: 'Neck Tilts', duration: '60 sec' },
      { id: 'e2', name: 'Head Rotations', duration: '45 sec' },
      { id: 'e3', name: 'Chin Tucks', duration: '60 sec', sets: 3, reps: 10 },
    ],
  },
  back: {
    id: 'back-relief',
    name: 'Back Relief',
    zone: 'back',
    zoneLabel: 'BACK',
    durationMin: 4,
    level: 'Beginner',
    description:
      'Mobilizes the thoracic spine and relieves lumbar tension. All exercises are done seated.',
    targetMuscles: 'Latissimus dorsi, spinal erectors, rhomboids',
    exercises: [
      { id: 'e1', name: 'Seated Cat-Cow', duration: '60 sec' },
      { id: 'e2', name: 'Thoracic Rotation', duration: '45 sec' },
      { id: 'e3', name: 'Side Bends', duration: '60 sec' },
    ],
  },
  eyes: {
    id: 'eye-relief',
    name: 'Eye Break',
    zone: 'eyes',
    zoneLabel: 'EYES',
    durationMin: 1,
    level: 'Beginner',
    description:
      'Reduces eye strain using the 20-20-20 rule. Works silently — perfect for the office.',
    targetMuscles: 'Extraocular muscles',
    exercises: [
      { id: 'e1', name: 'Focus at Distance (20 ft)', duration: '20 sec' },
      { id: 'e2', name: 'Palming', duration: '20 sec' },
      { id: 'e3', name: 'Eye Circles', duration: '20 sec' },
    ],
  },
  wrists: {
    id: 'wrist-relief',
    name: 'Wrist Relief',
    zone: 'wrists',
    zoneLabel: 'WRISTS',
    durationMin: 2,
    level: 'Beginner',
    description: 'Relieves wrist fatigue from keyboard and mouse use. Helps with early signs of carpal tunnel.',
    targetMuscles: 'Forearm flexors and extensors',
    exercises: [
      { id: 'e1', name: 'Wrist Circles', duration: '30 sec' },
      { id: 'e2', name: 'Flexor Stretch', duration: '30 sec' },
      { id: 'e3', name: 'Finger Tendon Glides', duration: '30 sec' },
    ],
  },
};
