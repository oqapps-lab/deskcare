import React from 'react';
import { View, StyleSheet, Pressable, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { PillCTA, Text, Divider } from '@/components/primitives';
import { Colors, Spacing, Radii } from '@/constants/tokens';

const HERO =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85&auto=format&fit=crop';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero photo */}
      <Image
        source={HERO}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={500}
      />

      {/* Multi-stop gradient overlay: clear top → dark bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(10,18,20,0.55)', 'rgba(10,18,20,0.93)']}
        locations={[0.3, 0.6, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Brand mark */}
      <View style={[styles.brand, { paddingTop: insets.top + Spacing.lg }]}>
        <Text variant="label" upper color="rgba(255,255,255,0.7)" style={styles.brandText}>
          DeskCare
        </Text>
      </View>

      {/* Bottom content */}
      <View
        style={[
          styles.bottom,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.xl,
            paddingHorizontal: Spacing.xl,
          },
        ]}
      >
        <Divider size="xl" />

        <Text variant="h1" color={Colors.onPrimary} style={styles.headline}>
          2 минуты в день —{'\n'}шея перестанет болеть
        </Text>

        <Divider size="md" />

        <Text variant="body" color="rgba(255,255,255,0.68)" style={styles.sub}>
          Микро-растяжки прямо за рабочим столом.{'\n'}Без коврика. Без переодевания.
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
          onPress={() => { /* TODO: Sign In */ }}
          accessibilityRole="link"
          style={styles.signIn}
        >
          <Text variant="bodyMd" color="rgba(255,255,255,0.5)">
            Уже есть аккаунт?{'  '}
            <Text variant="bodyMd" color="rgba(255,255,255,0.9)">
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
    backgroundColor: '#0a1214',
  },
  brand: {
    position: 'absolute',
    top: 0,
    left: Spacing.xl,
    zIndex: 10,
  },
  brandText: {
    letterSpacing: 3,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  headline: {
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  sub: {
    lineHeight: 24,
  },
  signIn: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
  },
});
