import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { View, Platform } from 'react-native';
import { useAppFonts } from '../hooks/useAppFonts';
import { colors } from '../constants/tokens';
import { useSession, useUserId } from '../lib/store/session';
import { configureForegroundBehavior } from '../lib/notifications';
import { IS_EXPO_GO } from '../lib/native-runtime';
import { setPremiumFromProfile } from '../lib/premium';
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

// Configure how foreground notifications are presented. Must run at module
// scope so it happens before any notification fires.
configureForegroundBehavior();

// Adapty + AppsFlyer are NATIVE modules (TurboModules). Importing them at
// top-level inside Expo Go raises "Invariant Violation: native module does
// not exist" because the public Expo Go shell does not bundle them. So we
// gate on `IS_EXPO_GO` and dynamically `require()` only inside dev/preview/
// production builds where the modules are actually present.

const ADAPTY_KEY = process.env.EXPO_PUBLIC_ADAPTY_KEY;
if (!IS_EXPO_GO && ADAPTY_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { adapty } = require('react-native-adapty');
    // Activate is idempotent across cold/warm starts in the same process —
    // second call returns #3005 "activateOnceError". Either way Adapty is up.
    (adapty as any)
      .activate(ADAPTY_KEY, { logLevel: 'error' })
      .catch(() => { /* already activated — fine */ });

    // Subscribe to profile changes (fires on purchase / restore / expiry).
    // Safe to call even if activate hasn't finished — Adapty queues the
    // listener internally and emits the first onLatestProfileLoad once
    // activation completes.
    (adapty as any).addEventListener?.('onLatestProfileLoad', (profile: unknown) => {
      setPremiumFromProfile(profile);
    });
    // Initial pull — entitlement may already be active for a returning user.
    (adapty as any)
      .getProfile?.()
      .then((profile: unknown) => setPremiumFromProfile(profile))
      .catch((e: unknown) => console.warn('[deskcare] Adapty.getProfile failed:', e));
  } catch (e) {
    console.warn('[deskcare] react-native-adapty unavailable:', e);
  }
}

const AF_DEV_KEY = process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY;
const AF_APP_ID = process.env.EXPO_PUBLIC_APPSFLYER_APP_ID;
if (!IS_EXPO_GO && AF_DEV_KEY && AF_APP_ID) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const appsFlyer = require('react-native-appsflyer').default;
    (appsFlyer as any).initSdk(
      {
        devKey: AF_DEV_KEY,
        isDebug: false,
        appId: AF_APP_ID,
        onInstallConversionDataListener: false,
        onDeepLinkListener: false,
        timeToWaitForATTUserAuthorization: 10,
      },
      () => {
        // AppsFlyer ready — install/event reporting will flow.
      },
      (err: unknown) => {
        console.warn('[deskcare] AppsFlyer.initSdk failed:', err);
      },
    );
  } catch (e) {
    console.warn('[deskcare] react-native-appsflyer unavailable:', e);
  }
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const initSession = useSession((s) => s.init);
  const hasHydrated = useSession((s) => s.hasHydrated);
  const userId = useUserId();

  useEffect(() => {
    initSession();
  }, [initSession]);

  // App Tracking Transparency. Required by Apple (privacy manifest declares
  // NSPrivacyTracking=true). Without firing this prompt, AppsFlyer attribution
  // is IDFA-less and Apple may reject (ITMS-91064). Show once after a brief
  // delay so it doesn't collide with the system notification-permission sheet.
  useEffect(() => {
    if (Platform.OS !== 'ios' || IS_EXPO_GO) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const current = await getTrackingPermissionsAsync();
        if (cancelled) return;
        if (current.status === 'undetermined' && current.canAskAgain) {
          await requestTrackingPermissionsAsync();
        }
      } catch (e) {
        console.warn('[deskcare] ATT prompt failed:', e);
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Link Adapty profile to Supabase user. Without this, Adapty's webhook to
  // Supabase can't resolve which deskcare_subscriptions row to upsert →
  // purchase succeeds in Apple+Adapty but Supabase row never reflects it.
  useEffect(() => {
    if (IS_EXPO_GO) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { adapty } = require('react-native-adapty');
      if (userId) {
        (adapty as any).identify?.(userId)?.catch?.((e: unknown) => {
          console.warn('[deskcare] adapty.identify failed:', e);
        });
      } else {
        (adapty as any).logout?.()?.catch?.((e: unknown) => {
          console.warn('[deskcare] adapty.logout failed:', e);
        });
      }
    } catch {
      // module unavailable — Expo Go path
    }
  }, [userId]);

  if (!fontsLoaded || !hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
            // Default: gentle fade for forward navigation. Slide-from-right
            // on every push reads as old-school iOS page-flip.
            animation: 'fade',
            animationDuration: 220,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          {/* Onboarding quiz steps — slide forward like a wizard, but quick. */}
          <Stack.Screen name="onboarding/quiz/zone" options={{ animation: 'slide_from_right', animationDuration: 200 }} />
          <Stack.Screen name="onboarding/quiz/frequency" options={{ animation: 'slide_from_right', animationDuration: 200 }} />
          <Stack.Screen name="onboarding/quiz/work" options={{ animation: 'slide_from_right', animationDuration: 200 }} />
          <Stack.Screen name="onboarding/quiz/goal" options={{ animation: 'slide_from_right', animationDuration: 200 }} />
          <Stack.Screen name="onboarding/permission" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/plan" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/labor-illusion" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/paywall" options={{ animation: 'fade_from_bottom', animationDuration: 320 }} />
          {/* Main tabs — instant swap. Sliding tab content is jarring. */}
          <Stack.Screen name="main/home" options={{ animation: 'none' }} />
          <Stack.Screen name="main/library" options={{ animation: 'none' }} />
          <Stack.Screen name="main/programs" options={{ animation: 'none' }} />
          <Stack.Screen name="main/profile" options={{ animation: 'none' }} />
          <Stack.Screen name="eye/session" options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="pain/check-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="sync" options={{ animation: 'fade' }} />
          <Stack.Screen name="errors/no-connection" options={{ animation: 'fade' }} />
          <Stack.Screen name="profile/delete-account" options={{ animation: 'slide_from_bottom' }} />
          {/* Modal screens — iOS sheet presentation gives swipe-to-dismiss,
              backdrop tap, and the rounded top corners users expect. */}
          <Stack.Screen name="modals/push-primer" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/milestone" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/share" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/streak-freeze" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/mini-paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/rate-app" options={{ presentation: 'modal' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
