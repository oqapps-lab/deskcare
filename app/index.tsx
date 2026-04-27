import React from 'react';
import { View, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { PillCTA, Text, Divider } from '@/components/primitives';
import { Colors, Spacing } from '@/constants/tokens';

// Yoga stretching — elegant, warm light
const HERO =
  'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=900&q=85&auto=format&fit=crop';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero */}
      <Image
        source={HERO}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={600}
      />

      {/* Cinematic gradient overlay */}
      <LinearGradient
        colors={[
          'rgba(8,14,16,0.0)',
          'rgba(8,14,16,0.30)',
          'rgba(8,14,16,0.78)',
          'rgba(8,14,16,0.96)',
        ]}
        locations={[0.2, 0.48, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Brand mark */}
      <View style={[styles.brand, { paddingTop: insets.top + Spacing.lg }]}>
        <Text
          variant="caption"
          upper
          color="rgba(255,255,255,0.5)"
          style={styles.brandText}
        >
          DeskCare
        </Text>
      </View>

      {/* Bottom content */}
      <View style={[
        styles.bottom,
        { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg },
      ]}>

        {/* Serif display headline */}
        <Text
          style={styles.headline}
          color={Colors.onPrimary}
        >
          2 минуты в день —{'\n'}шея перестанет болеть
        </Text>

        <Divider size="md" />

        {/* Subtitle — brighter, slightly larger */}
        <Text
          variant="body"
          color="rgba(255,255,255,0.72)"
          style={styles.sub}
        >
          Микро-растяжки прямо за рабочим столом.{'\n'}
          Без коврика. Без переодевания.
        </Text>

        <Divider size="xl" />

        <PillCTA
          label="Начать"
          onPress={() => router.push('/home')}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />}
          direction="diagonal"
        />

        <Divider size="md" />

        <Pressable
          onPress={() => {}}
          accessibilityRole="link"
          style={styles.signIn}
        >
          <Text variant="bodyMd" color="rgba(255,255,255,0.42)">
            Уже есть аккаунт?{'  '}
            <Text variant="bodyMd" color="rgba(255,255,255,0.80)">Войти</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#080e10' },
  brand: { position: 'absolute', top: 0, left: Spacing.xl, zIndex: 10 },
  brandText: { letterSpacing: 4 },

  bottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.xl,
  },

  // Cormorant Garamond — elegant serif headline
  headline: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: 0.2,
    color: Colors.onPrimary,
  },

  sub: {
    fontSize: 16,
    lineHeight: 25,
  },

  signIn: { alignSelf: 'center', paddingVertical: Spacing.sm },
});
