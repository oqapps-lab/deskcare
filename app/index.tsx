/**
 * Welcome Screen (ONB-02)
 * Full-bleed hero photo + bottom overlay + CTA
 */
import React from 'react';
import { View, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { PillCTA, Text } from '@/components/primitives';
import { Colors, Spacing, Radii } from '@/constants/tokens';

const HERO =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85&auto=format&fit=crop';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Full-bleed hero ── */}
      <Image
        source={HERO}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={400}
      />

      {/* ── Dark gradient overlay at bottom ── */}
      <View style={styles.overlay} />

      {/* ── Brand mark top-left ── */}
      <View style={[styles.brand, { paddingTop: insets.top + Spacing.lg }]}>
        <Text variant="label" upper color="rgba(255,255,255,0.8)">
          DeskCare
        </Text>
      </View>

      {/* ── Bottom content block ── */}
      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.xl,
            paddingHorizontal: Spacing.xl,
          },
        ]}
      >
        <Text variant="h1" color={Colors.onPrimary} style={styles.headline}>
          2 минуты в день —{'\n'}шея перестанет болеть
        </Text>

        <Text variant="body" color="rgba(255,255,255,0.75)" style={styles.sub}>
          Микро-растяжки прямо за рабочим столом.{'\n'}Без коврика. Без переодевания.
        </Text>

        <PillCTA
          label="Начать"
          onPress={() => router.push('/home')}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />}
          style={styles.cta}
        />

        <Pressable
          onPress={() => { /* TODO: Sign In */ }}
          accessibilityRole="link"
          style={styles.signIn}
        >
          <Text variant="bodyMd" color="rgba(255,255,255,0.6)">
            Уже есть аккаунт?{' '}
            <Text variant="bodyMd" color="rgba(255,255,255,0.95)">
              Войти
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1f20',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Gradient simulation: transparent top → dark bottom
    backgroundColor: 'transparent',
    // Use two nested views instead of LinearGradient
  },
  brand: {
    position: 'absolute',
    top: 0,
    left: Spacing.xl,
    zIndex: 10,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Dark gradient from top of this block
    backgroundColor: 'rgba(20, 24, 26, 0.72)',
    paddingTop: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headline: {
    lineHeight: 38,
  },
  sub: {
    lineHeight: 24,
  },
  cta: {
    marginTop: Spacing.sm,
  },
  signIn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
  },
});
