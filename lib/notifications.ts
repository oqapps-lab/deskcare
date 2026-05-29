import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

const normalize = (status: Notifications.PermissionStatus): PermissionStatus =>
  status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';

export async function getNotificationPermissions(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return normalize(status);
}

/**
 * Asks the OS for notification permission. iOS shows the system prompt the
 * first time and silently returns the previous answer thereafter — call this
 * at most once per primer screen tap.
 */
export async function requestNotificationPermissions(): Promise<PermissionStatus> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return 'granted';
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return normalize(status);
}

/**
 * Schedule a single daily local reminder at the given local hour/minute.
 * Returns the notification identifier (use cancelScheduledReminder).
 *
 * Local-only — works in Expo Go on SDK 55. No push token / FCM dance.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  body: string,
  title: string = 'DeskCare',
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    // SDK 55 requires the explicit { type: DAILY, hour, minute } shape.
    // The legacy { hour, minute, repeats: true } compiles via the loose
    // NotificationTriggerInput union but schedules a ONE-SHOT — users got
    // exactly one reminder, then silence. Use SchedulableTriggerInputTypes.
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelScheduledReminder(id: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already cancelled / unknown id — best-effort
  }
}

export async function cancelAllScheduledReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync();
}

/**
 * iOS by default suppresses banners while the app is foreground. Call this
 * once at app startup so users see in-app reminders.
 */
export function configureForegroundBehavior() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  // Android channel — required for Android 8+ to show heads-up notifications.
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    }).catch(() => {});
  }
}
