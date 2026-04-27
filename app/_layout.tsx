import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { Colors } from '@/constants/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Regular':       CormorantGaramond_400Regular,
    'CormorantGaramond-Italic':        CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-SemiBold':      CormorantGaramond_600SemiBold,
  });

  // Render nothing until fonts load (avoids flash of wrong font)
  if (!fontsLoaded) {
    return <View style={styles.splash} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.canvas },
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  splash: { flex: 1, backgroundColor: Colors.canvas },
});
