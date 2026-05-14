import React from 'react';
import {
  View, StyleSheet, Pressable, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { PillCTA, Text, Divider } from '@/components/primitives';
import { Colors, Spacing } from '@/constants/tokens';

const HERO =
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=85&auto=format&fit=crop';

const LEAK_COLOR  = 'rgba(34, 113, 179, 0.13)';
const LEAK_CLEAR  = 'rgba(34, 113, 179, 0)';
const LEAK_COLORS = [LEAK_COLOR, LEAK_CLEAR] as const;

const CTA_GRADIENT = ['rgba(74, 159, 217, 0.30)', '#1A5E9A'] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Полноэкранное изображение ── */}
      <Image
        source={HERO}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={600}
      />

      {/* Белый fade снизу — плавный переход к белой зоне контента */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.78)', '#ffffff']}
        locations={[0.30, 0.62, 0.88]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Corner light leaks ── */}
      <View style={[styles.leak, styles.leakTL]} pointerEvents="none">
        <LinearGradient colors={LEAK_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      </View>
      <View style={[styles.leak, styles.leakTR]} pointerEvents="none">
        <LinearGradient colors={LEAK_COLORS} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
      </View>
      <View style={[styles.leak, styles.leakBL]} pointerEvents="none">
        <LinearGradient colors={LEAK_COLORS} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
      </View>
      <View style={[styles.leak, styles.leakBR]} pointerEvents="none">
        <LinearGradient colors={LEAK_COLORS} start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }} style={StyleSheet.absoluteFillObject} />
      </View>

      {/* ── DESKCARE — верхний левый угол, белый, капс ── */}
      <View style={[styles.brand, { paddingTop: insets.top + Spacing.lg }]}>
        <Text style={styles.brandText}>DESKCARE</Text>
      </View>

      {/* ── Контент внизу ── */}
      <View
        style={[
          styles.bottom,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg },
        ]}
      >
        <Text style={styles.headline} color={Colors.onSurface}>
          2 minutes a day —{'\n'}no more neck pain
        </Text>

        <Divider size="md" />

        <Text variant="body" color={Colors.onSurfaceVar} style={styles.sub}>
          Micro-stretches right at your desk.{'\n'}
          No mat. No changing clothes.
        </Text>

        <Divider size="xl" />

        <PillCTA
          label="Get Started"
          onPress={() => router.push('/home')}
          icon={<Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.95)" />}
          direction="diagonal"
          gradientColors={CTA_GRADIENT}
          labelGlow
          style={styles.ctaShape}
        />

        <Divider size="md" />

        <Pressable
          onPress={() => {}}
          accessibilityRole="link"
          style={styles.signIn}
        >
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>
            Already have an account?{'  '}
            <Text variant="bodyMd" color={Colors.primary}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const LEAK_SIZE = 230;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  leak: { position: 'absolute', width: LEAK_SIZE, height: LEAK_SIZE, zIndex: 0 },
  leakTL: { top: 0, left: 0 },
  leakTR: { top: 0, right: 0 },
  leakBL: { bottom: 0, left: 0 },
  leakBR: { bottom: 0, right: 0 },

  brand: {
    position: 'absolute',
    top: 0,
    left: Spacing.xl,
    zIndex: 10,
  },
  brandText: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 20,
    letterSpacing: 3,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },

  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
  },

  headline: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 38,
    lineHeight: 48,
    letterSpacing: 0.2,
  },

  sub: {
    fontSize: 16,
    lineHeight: 25,
  },

  ctaShape: { borderRadius: 22 },

  signIn: { alignSelf: 'center', paddingVertical: Spacing.sm },
});
