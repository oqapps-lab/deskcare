import React from 'react';
import {
  View, ScrollView, StyleSheet, StatusBar, Pressable,
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
  neck:   'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=85&auto=format&fit=crop',
  back:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85&auto=format&fit=crop',
  eyes:   'https://t4.ftcdn.net/jpg/02/60/24/83/360_F_260248388_oImXAM9Qrkv0uuqFuJYFHVycIVyygjJL.jpg',
  wrists: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=85&auto=format&fit=crop',
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

      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={HERO_PHOTOS[zoneId]}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={500}
        />
        {/* Long soft gradient — barely affects top, fades into white at bottom */}
        <LinearGradient
          colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.38)', 'rgba(248,250,250,0.0)']}
          locations={[0, 0.65, 1]}
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
            onPress={() => {}}
            accessibilityLabel="Сохранить"
            variant="ghost"
          />
        </View>
      </View>

      {/* Sheet */}
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
                style={({ pressed }) => [styles.exRow, styles.rowGlow, pressed && styles.pressed]}
              >
                <View style={styles.exNum}>
                  <Text variant="label" color={Colors.primary}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                </View>
                <View style={styles.exText}>
                  <Text variant="h3">{ex.name}</Text>
                  <Text variant="bodyMd" color={Colors.onSurfaceVar}>
                    {ex.sets != null
                      ? `${ex.sets} сета · ${ex.reps ?? ''} повт`
                      : ex.duration}
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={26} color={Colors.primary} />
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

        <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
          <PillCTA
            label="Начать рутину"
            onPress={() => {}}
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
            direction="diagonal"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.canvas },
  hero:  { height: 320, backgroundColor: Colors.surfaceLow, overflow: 'hidden' },
  heroBar: {
    position: 'absolute', top: 0,
    left: Layout.screenPadding, right: Layout.screenPadding,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  sheet: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
    marginTop: -Radii.lg,
    overflow: 'hidden',
  },
  scroll:   { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.xxl },
  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exRow:    {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radii.md,
    padding: Spacing.lg, gap: Spacing.md,
  },
  exNum: {
    width: 34, height: 34, borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  exText:  { flex: 1, gap: 2 },
  rowGlow: {
    shadowColor: '#00677d',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  musclesCard:{ padding: Spacing.lg },
  ctaWrap:    {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
  },
  pressed: { opacity: 0.76 },
});
