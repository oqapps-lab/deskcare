import { Platform } from 'react-native';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import { IS_EXPO_GO } from './native-runtime';

/**
 * Request App Tracking Transparency ONCE, only if still undetermined.
 * Called from MID-ONBOARDING (after the notifications step, before the
 * paywall) rather than cold at app launch — a launch-time prompt felt
 * abrupt and out of context (tester R3). iOS-only + native-only guarded.
 *
 * Best-effort: AppsFlyer attribution degrades to IDFA-less if denied, which
 * is fine. We still satisfy ITMS-91064 by presenting the prompt in-flow.
 */
export async function requestTrackingOnce(): Promise<void> {
  if (Platform.OS !== 'ios' || IS_EXPO_GO) return;
  try {
    const current = await getTrackingPermissionsAsync();
    if (current.status === 'undetermined' && current.canAskAgain) {
      await requestTrackingPermissionsAsync();
    }
  } catch (e) {
    console.warn('[deskcare] ATT prompt failed:', e);
  }
}
