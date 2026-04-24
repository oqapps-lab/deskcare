import React from 'react';
import {
  View, ScrollView, StyleSheet, StatusBar, Pressable, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Text, PillCTA, Badge, Card, Divider, IconButton } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii } from '@/constants/tokens';
import { mockRoutines } from '@/mock/data';
import type { ZoneId } from '@/mock/data';

const HERO_PHOTOS: Record<ZoneId, string> = {
  neck:   'https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=800&q=85&auto=format&fit=crop',
  back:   'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=85&auto=format&fit=crop',
  eyes:   'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&q=85&auto=format&fit=crop',
  wrists: 'https://images.unsplash.com/photo-1573884985872-e62b4d20d4d5?w=800&q=85&auto=format&fit=crop',
};

export default function RoutineScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ zone?: string }>();

  const zoneId: ZoneId =
    params.zone != null && params.zone in mockRoutines
      ? (params.zone as ZoneId)
      : 'neck';

  const routine = mockRoutines[zoneId];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── Hero photo ── */}
      <View style={styles.hero}>
        <Image
          source={HERO_PHOTOS[zoneId]}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.18)', 'rgba(0,0,0,0.52)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.heroBar, { paddingTop: insets.top + Spacing.sm }]}>
          <IconButton
            icon={<Ionicons name="arrow-back" size={20} color={Colors.onPrimary} />}
            onPress={() => router.back()}
            accessibilityLabel="Назад"
            variant="ghost"
          />
          <IconButton
            icon={<Ionicons name="bookmark-outline" size={20} color={Colors.onPrimary} />}
            onPress={() => { }}
            accessibilityLabel="Сохранить"
            variant="ghost"
          />
        </View>
      </View>

      {/* ── White sheet ── */}
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) + 72 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Meta */}
          <View style={styles.metaRow}>
            <Badge label={routine.zoneLabel} variant="zone" />
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color={Colors.onSurfaceVar} />
              <Text variant="bodyMd" color={Colors.onSurfaceVar}>{routine.durationMin} мин</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={13} color={Colors.onSurfaceVar} />
              <Text variant="bodyMd" color={Colors.onSurfaceVar}>{routine.level}</Text>
            </View>
          </View>

          <Divider size="md" />
          <Text variant="h1">{routine.name}</Text>
          <Divider size="sm" />
          <Text variant="body" color={Colors.onSurfaceVar}>{routine.description}</Text>

          <Divider size="xxxl" />
          <Text variant="h2">Упражнения</Text>
          <Divider size="lg" />

          {routine.exercises.map((ex, i) => (
            <View key={ex.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${ex.name}, ${ex.duration}`}
                style={({ pressed }) => [styles.exRow, styles.exShadow, pressed && styles.pressed]}
              >
                <View style={styles.exNum}>
                  <Text variant="label" color={Colors.primary}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.exText}>
                  <Text variant="h3">{ex.name}</Text>
                  <Text variant="bodyMd" color={Colors.onSurfaceVar}>
                    {ex.sets != null ? `${ex.sets} сета · ${ex.reps ?? ''} повт` : ex.duration}
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={28} color={Colors.primary} />
              </Pressable>
              {i < routine.exercises.length - 1 && <Divider size="md" />}
            </View>
          ))}

          <Divider size="xxxl" />

          <Card bg={Colors.surfaceLow} style={styles.musclesCard}>
            <Text variant="label" upper color={Colors.onSurfaceVar}>Целевые мышцы</Text>
            <Divider size="xs" />
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>{routine.targetMuscles}</Text>
          </Card>
        </ScrollView>

        {/* Sticky CTA with glow */}
        <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <PillCTA
            label="Начать рутину"
            onPress={() => { }}
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
            direction="diagonal"
          />
        </View>
      </View>
    </View>
  );
}

const exShadow = Platform.select({
  ios: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 3 },
  default: {},
}) ?? {};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },

  hero: { height: 320, backgroundColor: Colors.surfaceLow, overflow: 'hidden' },
  heroBar: {
    position: 'absolute',
    top: 0,
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    marginTop: -Radii.lg,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.xxl,
  },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  exShadow: { ...exShadow },
  exNum: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exText: { flex: 1, gap: 2 },

  musclesCard: { padding: Spacing.lg },

  ctaWrap: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
  },

  pressed: { opacity: 0.78 },
});
