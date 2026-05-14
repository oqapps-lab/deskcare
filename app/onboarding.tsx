import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Text, PillCTA, Divider } from '@/components/primitives';
import { Colors, Spacing, Radii } from '@/constants/tokens';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Progress dots */}
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Illustration */}
      <View style={styles.illustrationWrap}>
        <View style={styles.illustrationCircle}>
          <LinearGradient
            colors={['#1a1a2e', '#16213e', '#0f3460']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0.3, y: 0 }}
            end={{ x: 0.7, y: 1 }}
          />
          {/* Glow */}
          <View style={styles.glow} />
          <Ionicons name="person" size={64} color="rgba(255,255,255,0.85)" style={styles.personIcon} />
          <View style={styles.deskLine} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.headline}>
          Precision recovery{'\n'}for the high-{'\n'}performance body.
        </Text>
        <Divider size="lg" />
        <Text variant="body" color={Colors.onSurfaceVar} style={styles.sub}>
          DeskCare analyzes your postural data to deliver targeted relief protocols.
        </Text>
      </View>

      {/* CTA */}
      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg }]}>
        <PillCTA
          label="Next"
          onPress={() => router.push('/quiz')}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />}
          direction="diagonal"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
  },

  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceHighest,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },

  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    bottom: 30,
    width: 120,
    height: 60,
    borderRadius: 60,
    backgroundColor: `${Colors.primaryLight}40`,
  },
  personIcon: {
    marginBottom: 8,
    zIndex: 1,
  },
  deskLine: {
    position: 'absolute',
    bottom: 42,
    width: 100,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radii.full,
  },

  content: {
    paddingHorizontal: Spacing.xl + Spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  headline: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 32,
    lineHeight: 42,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  sub: {
    textAlign: 'center',
    lineHeight: 24,
  },

  cta: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
});
