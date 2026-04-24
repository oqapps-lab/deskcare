/**
 * Home Screen (HOME-01)
 * Zones: photo cards grid, no emoji. Clean spacing.
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import {
  Card,
  Text,
  H2,
  PillCTA,
  BottomNav,
  Badge,
  Divider,
} from '@/components/primitives';
import type { TabId, TabItem } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii, Shadows } from '@/constants/tokens';
import { mockUser, mockRoutines, BODY_ZONES, WEEK_DAYS } from '@/mock/data';
import type { ZoneId } from '@/mock/data';

// ── Zone photos ──────────────────────────────────────────────────────────────
const ZONE_PHOTOS: Record<ZoneId, string> = {
  neck:   'https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=400&q=80&auto=format&fit=crop',
  back:   'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80&auto=format&fit=crop',
  eyes:   'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80&auto=format&fit=crop',
  wrists: 'https://images.unsplash.com/photo-1573884985872-e62b4d20d4d5?w=400&q=80&auto=format&fit=crop',
};

// ── Tabs ─────────────────────────────────────────────────────────────────────
const makeTabs = (active: TabId): TabItem[] => [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <Ionicons
        name={active === 'home' ? 'home' : 'home-outline'}
        size={20}
        color={active === 'home' ? Colors.onPrimary : Colors.onSurfaceVar}
      />
    ),
  },
  {
    id: 'library',
    label: 'Library',
    icon: (
      <Ionicons
        name="library-outline"
        size={20}
        color={Colors.onSurfaceVar}
      />
    ),
  },
  {
    id: 'programs',
    label: 'Programs',
    icon: (
      <Ionicons
        name="grid-outline"
        size={20}
        color={Colors.onSurfaceVar}
      />
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <Ionicons
        name={active === 'profile' ? 'person' : 'person-outline'}
        size={20}
        color={active === 'profile' ? Colors.onPrimary : Colors.onSurfaceVar}
      />
    ),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const user = mockUser;
  const recommended = mockRoutines['neck'];

  const cardWidth = (width - Layout.screenPadding * 2 - Layout.cardGap) / 2;
  const tabBarHeight = Layout.tabBarHeight + Math.max(insets.bottom, Spacing.md);

  function handleZonePress(zoneId: ZoneId) {
    router.push({ pathname: '/routine', params: { zone: zoneId } });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarHeight + Spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>
              Добро пожаловать
            </Text>
            <Text variant="h1">{user.name}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Настройки"
            style={styles.gearBtn}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.onSurfaceVar} />
          </Pressable>
        </View>

        <Divider size="lg" />

        {/* ── Streak ── */}
        <Card elevated>
          <View style={styles.streakRow}>
            <View style={styles.streakLeft}>
              <Ionicons name="flame" size={20} color={Colors.primaryLight} />
              <Text variant="h2" color={Colors.primary}>
                {user.streak} дней подряд
              </Text>
            </View>
          </View>
          <Divider size="md" />
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, i) => (
              <View key={day} style={styles.dayItem}>
                <Text variant="caption" color={Colors.onSurfaceVar}>{day}</Text>
                <View
                  style={[
                    styles.daydot,
                    user.weekActivity[i] ? styles.daydotOn : styles.daydotOff,
                  ]}
                />
              </View>
            ))}
          </View>
        </Card>

        <Divider size="md" />

        {/* ── Recommended ── */}
        <Card elevated>
          <Badge label={recommended.zoneLabel} variant="zone" />
          <Divider size="sm" />
          <Text variant="h2">{recommended.name}</Text>
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>
            {recommended.durationMin} мин · {recommended.exercises.length} упражнения
          </Text>
          <Divider size="md" />
          <PillCTA
            label="Начать рутину"
            onPress={() =>
              router.push({ pathname: '/routine', params: { zone: 'neck' } })
            }
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
          />
        </Card>

        <Divider size="lg" />

        {/* ── Body Zones ── */}
        <H2>Выберите зону</H2>
        <Divider size="md" />

        <View style={styles.zonesGrid}>
          {BODY_ZONES.map((zone) => (
            <Pressable
              key={zone.id}
              onPress={() => handleZonePress(zone.id)}
              accessibilityRole="button"
              accessibilityLabel={zone.label}
              style={({ pressed }) => [
                styles.zoneCard,
                { width: cardWidth, height: cardWidth },
                Shadows.card,
                pressed && styles.pressed,
              ]}
            >
              {/* Photo */}
              <Image
                source={ZONE_PHOTOS[zone.id]}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={300}
              />
              {/* Dark overlay */}
              <View style={styles.zoneOverlay} />
              {/* Label */}
              <View style={styles.zoneLabelWrap}>
                {user.painZones.includes(zone.id) && (
                  <View style={styles.activeBar} />
                )}
                <Text variant="h3" color={Colors.onPrimary}>
                  {zone.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Divider size="md" />

        {/* ── Eye Break ── */}
        <Pressable
          onPress={() => handleZonePress('eyes')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.eyeBreak, pressed && styles.pressed]}
        >
          <Ionicons name="eye-outline" size={18} color={Colors.primary} />
          <View style={styles.eyeText}>
            <Text variant="h3" color={Colors.primary}>Eye Break</Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>
              Глаза устали? 30 сек без звука
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </Pressable>

        <Divider size="md" />

        {/* ── Pain check-in ── */}
        {!user.hasPainCheckInToday && (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.painBanner, pressed && styles.pressed]}
          >
            <Ionicons name="analytics-outline" size={18} color={Colors.onSurfaceVar} />
            <Text variant="bodyMd" color={Colors.onSurfaceVar} style={{ flex: 1 }}>
              Как шея сейчас? Оценить боль →
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* ── BottomNav ── */}
      <View style={[styles.navWrap, { bottom: 0 }]}>
        <BottomNav
          tabs={makeTabs('home')}
          activeTab="home"
          onTabPress={(id: TabId) => {
            if (id === 'profile') router.push('/profile' as never);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.canvas },
  scroll: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gearBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Streak
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 4 },
  daydot: { width: 26, height: 26, borderRadius: Radii.full },
  daydotOn: { backgroundColor: Colors.primary },
  daydotOff: { backgroundColor: Colors.surfaceLow },

  // Zones
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.cardGap,
  },
  zoneCard: {
    borderRadius: Radii.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  zoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  zoneLabelWrap: {
    padding: Spacing.md,
    gap: 4,
  },
  activeBar: {
    width: 24,
    height: 3,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.full,
    marginBottom: 2,
  },

  // Eye Break
  eyeBreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  eyeText: { flex: 1 },

  // Pain
  painBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
  },

  navWrap: { position: 'absolute', left: 0, right: 0 },
  pressed: { opacity: 0.78 },
});
