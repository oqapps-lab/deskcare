/**
 * Mock data for Stage 5 design review.
 * Real API integration kicks in at Stage 6 — see CLAUDE.md.
 */

export const mockReminderTimes = ['9:00', '12:00', '15:00', '18:00'] as const;

export const mockEyeExercises = [
  { id: 'far-focus', title: 'Посмотрите на дальний объект', duration: 20 },
  { id: 'figure-8', title: 'Фигура восьмёрки', duration: 20 },
  { id: 'palming', title: 'Пальминг', duration: 30 },
  { id: 'blink', title: 'Осознанное моргание', duration: 15 },
  { id: 'circle', title: 'Круговые движения', duration: 30 },
] as const;

export const mockPainZones = [
  { id: 'neck', label: 'Шея' },
  { id: 'leftShoulder', label: 'Левое плечо' },
  { id: 'rightShoulder', label: 'Правое плечо' },
  { id: 'chest', label: 'Грудной отдел' },
  { id: 'abdomen', label: 'Брюшной пресс' },
  { id: 'lowerBack', label: 'Поясница' },
] as const;
