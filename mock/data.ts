// Mock data for DeskCare prototype
// Primary persona: Марина, 31, frontend dev, neck pain, Austin TX

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
  name: 'Марина',
  streak: 6,
  totalSessions: 42,
  totalMinutes: 126,
  weekActivity: [true, true, true, true, true, true, false],
  painZones: ['neck', 'eyes'],
  hasPainCheckInToday: false,
};

export const BODY_ZONES: BodyZone[] = [
  { id: 'neck',   label: 'Шея',      emoji: '🦴' },
  { id: 'back',   label: 'Спина',    emoji: '💪' },
  { id: 'eyes',   label: 'Глаза',    emoji: '👁' },
  { id: 'wrists', label: 'Запястья', emoji: '🤚' },
];

export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export const mockRoutines: Record<ZoneId, Routine> = {
  neck: {
    id: 'neck-relief',
    name: 'Разминка шеи',
    zone: 'neck',
    zoneLabel: 'NECK',
    durationMin: 3,
    level: 'Beginner',
    description:
      'Снимает напряжение в шейном отделе позвоночника и трапециевидных мышцах после долгого сидения за экраном.',
    targetMuscles: 'Трапеция, грудино-ключично-сосцевидная, леваторы лопатки',
    exercises: [
      { id: 'e1', name: 'Наклоны шеи', duration: '60 сек' },
      { id: 'e2', name: 'Повороты головы', duration: '45 сек' },
      { id: 'e3', name: 'Chin Tucks', duration: '60 сек', sets: 3, reps: 10 },
    ],
  },
  back: {
    id: 'back-relief',
    name: 'Разминка спины',
    zone: 'back',
    zoneLabel: 'BACK',
    durationMin: 4,
    level: 'Beginner',
    description:
      'Мобилизует грудной отдел и снимает поясничное напряжение. Все упражнения выполняются сидя.',
    targetMuscles: 'Широчайшие, выпрямители позвоночника, ромбовидные',
    exercises: [
      { id: 'e1', name: 'Кошка-корова сидя', duration: '60 сек' },
      { id: 'e2', name: 'Ротация грудного отдела', duration: '45 сек' },
      { id: 'e3', name: 'Наклоны в стороны', duration: '60 сек' },
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
      'Снимает зрительное напряжение по правилу 20-20-20. Работает без звука — можно делать прямо в офисе.',
    targetMuscles: 'Глазодвигательные мышцы',
    exercises: [
      { id: 'e1', name: 'Фокус вдаль (6 м)', duration: '20 сек' },
      { id: 'e2', name: 'Пальминг', duration: '20 сек' },
      { id: 'e3', name: 'Движение глазами по кругу', duration: '20 сек' },
    ],
  },
  wrists: {
    id: 'wrist-relief',
    name: 'Разминка запястий',
    zone: 'wrists',
    zoneLabel: 'WRISTS',
    durationMin: 2,
    level: 'Beginner',
    description: 'Снимает усталость запястий от клавиатуры и мыши. Помогает при начальных признаках карпального туннеля.',
    targetMuscles: 'Сгибатели и разгибатели предпредплечья',
    exercises: [
      { id: 'e1', name: 'Вращение запястий', duration: '30 сек' },
      { id: 'e2', name: 'Растяжка сгибателей', duration: '30 сек' },
      { id: 'e3', name: 'Finger tendon glides', duration: '30 сек' },
    ],
  },
};
