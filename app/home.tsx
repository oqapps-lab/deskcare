import React from 'react';
import {
  View, ScrollView, StyleSheet, Pressable,
  StatusBar, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { Card, Text, H2, PillCTA, BottomNav, Badge, Divider } from '@/components/primitives';
import type { TabId, TabItem } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii } from '@/constants/tokens';
import { mockUser, mockRoutines, BODY_ZONES, WEEK_DAYS } from '@/mock/data';
import type { ZoneId } from '@/mock/data';

const ZONE_PHOTOS: Record<ZoneId, string> = {
  neck:   'https://avatars.mds.yandex.net/i?id=da6b71d8d865a58d49f43c238bdb58a0_l-12585576-images-thumbs&n=13',
  back:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=85&auto=format&fit=crop',
  eyes:   'https://t4.ftcdn.net/jpg/02/60/24/83/360_F_260248388_oImXAM9Qrkv0uuqFuJYFHVycIVyygjJL.jpg',
  wrists: 'https://avatars.mds.yandex.net/i?id=88efaa9ff48c90b4bb82eb6de37fa820298df2c2-2398678-images-thumbs&n=13',
};

const ACCENT = Colors.primary;

const PEBBLE: { borderTopLeftRadius: number; borderTopRightRadius: number; borderBottomLeftRadius: number; borderBottomRightRadius: number }[] = [
  { borderTopLeftRadius: 16, borderTopRightRadius: 22, borderBottomLeftRadius: 20, borderBottomRightRadius: 12 },
  { borderTopLeftRadius: 20, borderTopRightRadius: 13, borderBottomLeftRadius: 11, borderBottomRightRadius: 22 },
  { borderTopLeftRadius: 13, borderTopRightRadius: 19, borderBottomLeftRadius: 23, borderBottomRightRadius: 15 },
  { borderTopLeftRadius: 22, borderTopRightRadius: 11, borderBottomLeftRadius: 17, borderBottomRightRadius: 21 },
  { borderTopLeftRadius: 11, borderTopRightRadius: 21, borderBottomLeftRadius: 19, borderBottomRightRadius: 13 },
  { borderTopLeftRadius: 19, borderTopRightRadius: 15, borderBottomLeftRadius: 13, borderBottomRightRadius: 23 },
  { borderTopLeftRadius: 21, borderTopRightRadius: 17, borderBottomLeftRadius: 22, borderBottomRightRadius: 14 },
];

const makeTabs = (active: TabId): TabItem[] => [
  { id: 'home',     label: 'Home',     icon: <Ionicons name={active === 'home'    ? 'home'          : 'home-outline'}   size={20} color={active === 'home'    ? ACCENT : Colors.onSurfaceVar} /> },
  { id: 'library',  label: 'Library',  icon: <Ionicons name="library-outline"                                           size={20} color={Colors.onSurfaceVar} /> },
  { id: 'programs', label: 'Programs', icon: <Ionicons name="grid-outline"                                              size={20} color={Colors.onSurfaceVar} /> },
  { id: 'profile',  label: 'Profile',  icon: <Ionicons name={active === 'profile' ? 'person'       : 'person-outline'} size={20} color={active === 'profile' ? ACCENT : Colors.onSurfaceVar} /> },
];

export default function HomeScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user    = mockUser;
  const recommended = mockRoutines['neck'];

  const cardWidth = (width - Layout.screenPadding * 2 - Layout.cardGap) / 2;
  const tabBarH   = Layout.tabBarHeight + Math.max(insets.bottom, Spacing.md) + Spacing.lg;

  function goZone(id: ZoneId) {
    router.push({ pathname: '/routine', params: { zone: id } });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + Spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>Welcome back</Text>
            <Text variant="h1">{user.name}</Text>
          </View>
          <Pressable style={styles.gearBtn} accessibilityRole="button" accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={22} color={Colors.onSurfaceVar} />
          </Pressable>
        </View>

        <Divider size="xl" />

        {/* ── Streak ── */}
        <Card elevated style={styles.card}>
          <View style={styles.streakRow}>
            <View>
              <Text style={styles.heroNumber}>{user.streak}</Text>
              <Text variant="bodyMd" color={Colors.onSurfaceVar}>day streak</Text>
            </View>
            <Ionicons name="flame" size={28} color={ACCENT} />
          </View>

          <Divider size="lg" />

          {/* ── Day pebbles ── */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, i) => {
              const active = user.weekActivity[i];
              return (
                <View key={day} style={[styles.dayBox, PEBBLE[i], active && styles.dayBoxActive]}>
                  <Text
                    variant="caption"
                    color={active ? Colors.primary : Colors.onSurfaceVar}
                    style={styles.dayText}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Divider size="md" />

        {/* ── Recommended ── */}
        <Card elevated style={styles.card}>
          <Badge label={recommended.zoneLabel} variant="zone" />
          <Divider size="md" />
          <Text variant="h2">{recommended.name}</Text>
          <Divider size="xs" />
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>
            {recommended.durationMin} min · {recommended.exercises.length} exercises
          </Text>
          <Divider size="lg" />
          <PillCTA
            label="Start Routine"
            onPress={() => goZone('neck')}
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
            direction="diagonal"
          />
        </Card>

        <Divider size="xxl" />

        {/* ── Body Zones ── */}
        <H2>Choose Zone</H2>
        <Divider size="md" />

        <View style={styles.grid}>
          {BODY_ZONES.map((zone) => (
            <Pressable
              key={zone.id}
              onPress={() => goZone(zone.id)}
              accessibilityRole="button"
              accessibilityLabel={zone.label}
              style={({ pressed }) => [
                styles.zoneCard,
                { width: cardWidth, height: cardWidth * 1.12 },
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={ZONE_PHOTOS[zone.id]}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={300}
              />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.50)']}
                locations={[0.4, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.zoneLabel}>
                {user.painZones.includes(zone.id) && (
                  <View style={styles.accentLine} />
                )}
                <Text variant="h3" color={Colors.onPrimary}>{zone.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Divider size="xxl" />

        {/* ── Eye Break ── */}
        <Pressable
          onPress={() => goZone('eyes')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
        >
          <View style={styles.infoIcon}>
            <Ionicons name="eye-outline" size={17} color={ACCENT} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="body" color={Colors.onSurface}>Eye Break</Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>Eyes tired? 30 sec, no sound</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
        </Pressable>

        <Divider size="sm" />

        {/* ── Pain check-in ── */}
        {!user.hasPainCheckInToday && (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.infoRow, pressed && styles.pressed]}
          >
            <View style={styles.infoIcon}>
              <Ionicons name="analytics-outline" size={17} color={ACCENT} />
            </View>
            <Text variant="bodyMd" color={Colors.onSurfaceVar} style={{ flex: 1 }}>
              Rate your pain today
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.outline} />
          </Pressable>
        )}
      </ScrollView>

      {/* ── Floating island nav ── */}
      <View style={[styles.nav, { bottom: 0 }]}>
        <BottomNav
          tabs={makeTabs('home')}
          activeTab="home"
          onTabPress={() => {}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.canvas },
  scroll: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg },

  header:  { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  gearBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  card: {},

  /* Streak */
  streakRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroNumber: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 52,
    lineHeight: 52,
    color: ACCENT,
    letterSpacing: -1,
  },

  /* Day pebbles */
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  dayBox: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  dayBoxActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#7DC0E8',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  dayText: { fontWeight: '600' },

  /* Body zone grid */
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: Layout.cardGap },
  zoneCard:  { borderRadius: Radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  zoneLabel: { padding: Spacing.md, gap: 3 },
  accentLine:{ width: 18, height: 2, backgroundColor: Colors.onPrimary, borderRadius: Radii.full, marginBottom: 2, opacity: 0.7 },

  /* Info rows (Eye Break, Pain check-in) */
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  nav:     { position: 'absolute', left: 0, right: 0 },
  pressed: { opacity: 0.78 },
});
