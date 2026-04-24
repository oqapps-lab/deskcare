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
  // Neck: person at laptop with neck pain/strain
  neck:   'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=85&auto=format&fit=crop',
  // Back: yoga back stretch
  back:   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=85&auto=format&fit=crop',
  // Eyes: eye macro closeup
  eyes:   'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=85&auto=format&fit=crop',
  // Wrists: hands closeup / fingers
  wrists: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=85&auto=format&fit=crop',
};

const makeTabs = (active: TabId): TabItem[] => [
  { id: 'home',     label: 'Home',     icon: <Ionicons name={active === 'home'    ? 'home'          : 'home-outline'}   size={20} color={active === 'home'    ? Colors.onPrimary : Colors.onSurfaceVar} /> },
  { id: 'library',  label: 'Library',  icon: <Ionicons name="library-outline"                                           size={20} color={Colors.onSurfaceVar} /> },
  { id: 'programs', label: 'Programs', icon: <Ionicons name="grid-outline"                                              size={20} color={Colors.onSurfaceVar} /> },
  { id: 'profile',  label: 'Profile',  icon: <Ionicons name={active === 'profile' ? 'person'       : 'person-outline'} size={20} color={active === 'profile' ? Colors.onPrimary : Colors.onSurfaceVar} /> },
];


export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = mockUser;
  const recommended = mockRoutines['neck'];

  const cardWidth = (width - Layout.screenPadding * 2 - Layout.cardGap) / 2;
  const tabBarH   = Layout.tabBarHeight + Math.max(insets.bottom, Spacing.md);

  function goZone(id: ZoneId) {
    router.push({ pathname: '/routine', params: { zone: id } });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + Spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>Добро пожаловать</Text>
            <Text variant="h1">{user.name}</Text>
          </View>
          <Pressable style={styles.gearBtn} accessibilityRole="button" accessibilityLabel="Настройки">
            <Ionicons name="settings-outline" size={22} color={Colors.onSurfaceVar} />
          </Pressable>
        </View>

        <Divider size="xl" />

        {/* Streak */}
        <Card elevated style={[styles.card, styles.glow]}>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={20} color={Colors.primaryLight} />
            <Text variant="h2" color={Colors.primary}>{user.streak} дней подряд</Text>
          </View>
          <Divider size="lg" />
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, i) => {
              const active = user.weekActivity[i];
              return (
                <View key={day} style={styles.dayCol}>
                  {active ? (
                    <View style={styles.dayHalo}>
                      <Text variant="caption" color={Colors.primary} style={styles.dayTextActive}>
                        {day}
                      </Text>
                    </View>
                  ) : (
                    <Text variant="caption" color={Colors.onSurfaceVar} style={styles.dayTextInactive}>
                      {day}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </Card>

        <Divider size="lg" />

        {/* Recommended */}
        <Card elevated style={[styles.card, styles.glow]}>
          <Badge label={recommended.zoneLabel} variant="zone" />
          <Divider size="md" />
          <Text variant="h2">{recommended.name}</Text>
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>
            {recommended.durationMin} мин · {recommended.exercises.length} упражнения
          </Text>
          <Divider size="xl" />
          <PillCTA
            label="Начать рутину"
            onPress={() => goZone('neck')}
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
            direction="diagonal"
          />
        </Card>

        <Divider size="xxxl" />

        {/* Body Zones */}
        <H2>Выберите зону</H2>
        <Divider size="lg" />

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
                styles.glow,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={ZONE_PHOTOS[zone.id]}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={300}
              />
              {/* Gradient: almost clear top, darker at bottom */}
              <LinearGradient
                colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.52)']}
                locations={[0.3, 1]}
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

        <Divider size="xxxl" />

        {/* Eye Break */}
        <Pressable
          onPress={() => goZone('eyes')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.eyeRow, styles.glow, pressed && styles.pressed]}
        >
          <View style={styles.eyeIcon}>
            <Ionicons name="eye-outline" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="h3" color={Colors.primary}>Eye Break</Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>Глаза устали? 30 сек без звука</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={Colors.onSurfaceVar} />
        </Pressable>

        <Divider size="lg" />

        {/* Pain check-in */}
        {!user.hasPainCheckInToday && (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.painRow, pressed && styles.pressed]}
          >
            <Ionicons name="analytics-outline" size={17} color={Colors.onSurfaceVar} />
            <Text variant="bodyMd" color={Colors.onSurfaceVar} style={{ flex: 1 }}>
              Как шея сейчас? Оценить боль →
            </Text>
          </Pressable>
        )}
      </ScrollView>

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

  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  gearBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  card: {},

  streakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  weekRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center' },

  // Active day — thin airy ring, wide diffused glow
  dayHalo: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 143, 163, 0.55)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryLight,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  dayTextActive:   { fontWeight: '700', letterSpacing: 0.2 },
  dayTextInactive: { letterSpacing: 0.2 },

  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: Layout.cardGap },
  zoneCard: { borderRadius: Radii.lg, overflow: 'hidden', justifyContent: 'flex-end' },
  zoneLabel:{ padding: Spacing.md, gap: 3 },
  accentLine: { width: 20, height: 2, backgroundColor: Colors.primaryLight, borderRadius: Radii.full, marginBottom: 3 },

  eyeRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radii.lg, padding: Spacing.lg, gap: Spacing.md },
  eyeIcon: { width: 38, height: 38, borderRadius: Radii.full, backgroundColor: Colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },

  painRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radii.lg },

  // Soft ambient teal glow (shadow* for iOS, elevation for Android)
  glow: {
    shadowColor: '#00677d',
    shadowOpacity: 0.09,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  nav:     { position: 'absolute', left: 0, right: 0 },
  pressed: { opacity: 0.76 },
});
