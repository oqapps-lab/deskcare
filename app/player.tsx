import React, { useState } from 'react';
import {
  View, StyleSheet, StatusBar, Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text, Divider } from '@/components/primitives';
import { Colors, Spacing, Radii, Layout } from '@/constants/tokens';
import { mockRoutines } from '@/mock/data';
import type { ZoneId } from '@/mock/data';

const EXERCISE_PHOTOS: Record<ZoneId, string> = {
  neck:   'https://avatars.mds.yandex.net/i?id=da6b71d8d865a58d49f43c238bdb58a0_l-12585576-images-thumbs&n=13',
  back:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85&auto=format&fit=crop',
  eyes:   'https://t4.ftcdn.net/jpg/02/60/24/83/360_F_260248388_oImXAM9Qrkv0uuqFuJYFHVycIVyygjJL.jpg',
  wrists: 'https://avatars.mds.yandex.net/i?id=88efaa9ff48c90b4bb82eb6de37fa820298df2c2-2398678-images-thumbs&n=13',
};

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ zone?: string }>();
  const zoneId: ZoneId = (params.zone as ZoneId) in mockRoutines ? (params.zone as ZoneId) : 'neck';
  const routine = mockRoutines[zoneId];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const exercise = routine.exercises[currentIdx];
  const total = routine.exercises.length;

  function prev() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIdx(i => Math.max(0, i - 1));
  }
  function next() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIdx < total - 1) { setCurrentIdx(i => i + 1); }
    else { router.back(); }
  }
  function togglePlay() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPlaying(p => !p);
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.controlBtn} accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={Colors.onSurfaceVar} />
        </Pressable>
        <Text variant="label" upper color={Colors.onSurfaceVar} style={styles.setLabel}>
          Set {currentIdx + 1} of {total}
        </Text>
        <Pressable style={styles.controlBtn} accessibilityLabel="More">
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.onSurfaceVar} />
        </Pressable>
      </View>

      {/* ── Coaching cue ── */}
      <View style={styles.cueSection}>
        <Text style={styles.cueText}>Keep your chin tucked</Text>
        <Divider size="xs" />
        <Text variant="bodyMd" color={Colors.onSurfaceVar}>{exercise.name}</Text>
      </View>

      {/* ── Photo + timer overlay ── */}
      <View style={styles.photoSection}>
        <Image
          source={EXERCISE_PHOTOS[zoneId]}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.30)', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Circular timer */}
        <View style={styles.timerWrap}>
          <View style={styles.timerRing}>
            <Text style={styles.timerText}>0:45</Text>
          </View>
        </View>
      </View>

      {/* ── Progress dots ── */}
      <View style={styles.progressDots}>
        {routine.exercises.map((_, i) => (
          <View
            key={i}
            style={[styles.progressDot, i === currentIdx && styles.progressDotActive]}
          />
        ))}
      </View>

      {/* ── Transport controls ── */}
      <View style={[styles.transport, { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg }]}>
        <Pressable
          onPress={prev}
          style={[styles.transportBtn, currentIdx === 0 && styles.transportBtnDisabled]}
          accessibilityLabel="Previous"
        >
          <Ionicons name="play-skip-back" size={22} color={currentIdx === 0 ? Colors.outline : Colors.onSurfaceVar} />
        </Pressable>

        <Pressable onPress={togglePlay} style={styles.playBtn} accessibilityLabel={playing ? 'Pause' : 'Play'}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name={playing ? 'pause' : 'play'} size={26} color={Colors.onPrimary} />
        </Pressable>

        <Pressable onPress={next} style={styles.transportBtn} accessibilityLabel="Next">
          <Ionicons name="play-skip-forward" size={22} color={Colors.onSurfaceVar} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.md,
  },
  controlBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  setLabel: { letterSpacing: 1 },

  cueSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
  },
  cueText: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 30,
    lineHeight: 38,
    color: Colors.onSurface,
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  photoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  timerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 5,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  timerText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 48,
    lineHeight: 52,
    color: '#ffffff',
    letterSpacing: -1,
  },

  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  progressDot: {
    width: 8, height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceHighest,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },

  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
  transportBtn: {
    width: 52, height: 52,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  transportBtnDisabled: { opacity: 0.4 },
  playBtn: {
    width: 68, height: 68,
    borderRadius: Radii.full,
    overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
});
