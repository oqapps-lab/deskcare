import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { adapty } from 'react-native-adapty';
import appsFlyer from 'react-native-appsflyer';
import { useAppFonts } from '../hooks/useAppFonts';
import { colors } from '../constants/tokens';
import { useSession } from '../lib/store/session';
import { configureForegroundBehavior } from '../lib/notifications';

// Configure how foreground notifications are presented. Must run at module
// scope so it happens before any notification fires.
configureForegroundBehavior();

// Adapty: activate at module scope when key is provided. Silently skip
// otherwise — TF-internal builds run without IAP wired (see lib/premium.ts).
const ADAPTY_KEY = process.env.EXPO_PUBLIC_ADAPTY_KEY;
if (ADAPTY_KEY) {
  // Cast to any: Adapty SDK options drift between minor versions. Keeping
  // the activation call resilient to that without pinning the type here.
  (adapty as any)
    .activate(ADAPTY_KEY, { logLevel: 'error' })
    .catch((e: unknown) => {
      // Activation failure should never crash the app — premium gate falls
      // back to free until the SDK recovers (or until next cold start).
      console.warn('[deskcare] Adapty.activate failed:', e);
    });
}

// AppsFlyer: initialize when both env vars are present. The Apple App ID
// (numeric) only exists after the ASC listing is created — until then this
// block silently skips. ATT prompt is intentionally NOT requested here:
// Apple HIG prefers asking after value is established, so DeskCare requests
// it post-onboarding via `requestTrackingPermissionsAsync` later.
const AF_DEV_KEY = process.env.EXPO_PUBLIC_APPSFLYER_DEV_KEY;
const AF_APP_ID = process.env.EXPO_PUBLIC_APPSFLYER_APP_ID;
if (AF_DEV_KEY && AF_APP_ID) {
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
}

export default function RootLayout() {
  const fontsLoaded = useAppFonts();
  const initSession = useSession((s) => s.init);
  const hasHydrated = useSession((s) => s.hasHydrated);

  useEffect(() => {
    initSession();
  }, [initSession]);

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
