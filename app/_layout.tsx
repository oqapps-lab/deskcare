import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useAppFonts } from '../hooks/useAppFonts';
import { colors } from '../constants/tokens';

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
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
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
