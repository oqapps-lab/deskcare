import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useAppFonts } from '../hooks/useAppFonts';
import { colors } from '../constants/tokens';
import { useSession } from '../lib/store/session';
import { configureForegroundBehavior } from '../lib/notifications';

// Configure how foreground notifications are presented. Must run at module
// scope so it happens before any notification fires.
configureForegroundBehavior();

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
            animation: 'slide_from_right',
            animationDuration: 280,
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding/permission" options={{ animation: 'fade' }} />
          <Stack.Screen name="eye/session" options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="pain/check-in" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="sync" options={{ animation: 'fade' }} />
          <Stack.Screen name="errors/no-connection" options={{ animation: 'fade' }} />
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
