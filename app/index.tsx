import React from 'react';
import { View, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { PillCTA, Text, Divider } from '@/components/primitives';
import { Colors, Spacing } from '@/constants/tokens';

const HERO =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85&auto=format&fit=crop';

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

      {/* Long cinematic fade — barely visible top, very dark bottom */}
      <LinearGradient
        colors={[
          'rgba(8,14,16,0.05)',
          'rgba(8,14,16,0.35)',
          'rgba(8,14,16,0.82)',
          'rgba(8,14,16,0.97)',
        ]}
        locations={[0, 0.45, 0.72, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Brand */}
      <View style={[styles.brand, { paddingTop: insets.top + Spacing.lg }]}>
        <Text variant="caption" upper color="rgba(255,255,255,0.45)" style={styles.brandText}>
          DeskCare
        </Text>
      </View>

      {/* Bottom block */}
      <View style={[
        styles.bottom,
        { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg },
      ]}>
        <Text variant="h1" color={Colors.onPrimary} style={styles.headline}>
          2 минуты в день —{'\n'}шея перестанет болеть
        </Text>

        <Divider size="md" />

        <Text variant="body" color="rgba(255,255,255,0.52)" style={styles.sub}>
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
          <Text variant="bodyMd" color="rgba(255,255,255,0.38)">
            Уже есть аккаунт?{'  '}
            <Text variant="bodyMd" color="rgba(255,255,255,0.72)">Войти</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#080e10' },
  brand:   { position: 'absolute', top: 0, left: Spacing.xl, zIndex: 10 },
  brandText: { letterSpacing: 4 },
  bottom:  {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: Spacing.xl,
  },
  headline: { lineHeight: 40, letterSpacing: -0.4 },
  sub:      { lineHeight: 24 },
  signIn:   { alignSelf: 'center', paddingVertical: Spacing.sm },
});
