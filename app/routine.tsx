/**
 * Routine Preview (EX-01) — P0, highest-frequency flow screen
 * Source of truth: WIREFRAMES.md §6, SCREEN-MAP.md 4.1, FEATURES.md F2/F3
 *
 * Stitch vs UX conflicts resolved:
 * - "Guided Breathwork 5 mins" removed — FEATURES.md Won't Have: mindfulness;
 *   replaced with "Chin Tucks 60 сек" (physical neck exercise)
 * - Zone badge: "NECK" not "RECOVERY" (per DESIGN-GUIDE anti-patterns)
 * - CTA: "Начать рутину" (per WIREFRAMES.md), not "Start Session"
 * - Back button: uses IconButton per WIREFRAMES §6 "← Назад"
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  Text,
  PillCTA,
  Badge,
  Card,
  Divider,
  IconButton,
} from '@/components/primitives';
import { Colors, Layout, Spacing, Radii, Shadows } from '@/constants/tokens';
import { mockRoutines } from '@/mock/data';
import type { ZoneId } from '@/mock/data';

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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

      {/* ── Hero image area ── */}
      <View style={styles.hero}>
        <Ionicons
          name="body"
          size={100}
          color={Colors.primaryLight}
          style={styles.heroIcon}
        />
        {/* TopBar overlaid on hero */}
        <View style={styles.heroBar}>
          <IconButton
            icon={<Ionicons name="arrow-back" size={20} color={Colors.onSurface} />}
            onPress={() => router.back()}
            accessibilityLabel="Назад"
            variant="surface"
            size={40}
          />
          <IconButton
            icon={<Ionicons name="bookmark-outline" size={20} color={Colors.onSurface} />}
            onPress={() => { /* TODO: bookmark */ }}
            accessibilityLabel="Сохранить рутину"
            variant="surface"
            size={40}
          />
        </View>
      </View>

      {/* ── Content card overlapping hero ── */}
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + Spacing.xxxl + 56 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Zone badge + meta */}
          <View style={styles.metaRow}>
            <Badge label={routine.zoneLabel} variant="zone" />
            <View style={styles.metaMid}>
              <Ionicons name="time-outline" size={14} color={Colors.onSurfaceVar} />
              <Text variant="bodyMd" color={Colors.onSurfaceVar}>
                {routine.durationMin} мин
              </Text>
            </View>
            <View style={styles.metaMid}>
              <Ionicons name="bar-chart-outline" size={14} color={Colors.onSurfaceVar} />
              <Text variant="bodyMd" color={Colors.onSurfaceVar}>
                {routine.level}
              </Text>
            </View>
          </View>

          <Divider size="sm" />

          {/* Routine name */}
          <Text variant="h1">{routine.name}</Text>

          <Divider size="sm" />

          {/* Description */}
          <Text variant="body" color={Colors.onSurfaceVar}>
            {routine.description}
          </Text>

          <Divider size="lg" />

          {/* Exercise list */}
          <Text variant="h2">Упражнения</Text>
          <Divider size="md" />

          {routine.exercises.map((ex, index) => (
            <View key={ex.id}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${ex.name}, ${ex.duration}`}
                style={({ pressed }) => [
                  styles.exerciseRow,
                  Shadows.card,
                  pressed && styles.pressed,
                ]}
              >
                {/* Number badge */}
                <View style={styles.exNumber}>
                  <Text variant="label" color={Colors.primary}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </View>

                {/* Name + meta */}
                <View style={styles.exText}>
                  <Text variant="h3">{ex.name}</Text>
                  <Text variant="bodyMd" color={Colors.onSurfaceVar}>
                    {ex.sets != null
                      ? `${ex.sets} сета · ${ex.reps ?? ''} повт`
                      : ex.duration}
                  </Text>
                </View>

                <Ionicons
                  name="play-circle-outline"
                  size={28}
                  color={Colors.primary}
                />
              </Pressable>
              {index < routine.exercises.length - 1 && <Divider size="md" />}
            </View>
          ))}

          <Divider size="lg" />

          {/* Target muscles */}
          <Card bg={Colors.surfaceLow} style={styles.musclesCard}>
            <Text variant="label" upper color={Colors.onSurfaceVar}>
              Целевые мышцы
            </Text>
            <Divider size="xs" />
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>
              {routine.targetMuscles}
            </Text>
          </Card>
        </ScrollView>

        {/* ── Sticky CTA ── */}
        <View
          style={[
            styles.ctaWrap,
            { paddingBottom: Math.max(insets.bottom, Spacing.lg) },
          ]}
        >
          <PillCTA
            label="Начать рутину"
            onPress={() => { /* TODO: navigate to Exercise Player */ }}
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  // Hero
  hero: {
    height: 260,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroIcon: {
    opacity: 0.4,
  },
  heroBar: {
    position: 'absolute',
    top: Spacing.md,
    left: Layout.screenPadding,
    right: Layout.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Sheet overlapping hero
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
  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  metaMid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Exercise row
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  exNumber: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exText: {
    flex: 1,
    gap: 2,
  },
  // Muscles card
  musclesCard: {
    padding: Spacing.lg,
  },
  // CTA
  ctaWrap: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 0,
  },
  pressed: {
    opacity: 0.75,
  },
});
