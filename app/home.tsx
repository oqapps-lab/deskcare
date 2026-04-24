/**
 * Home Screen (HOME-01) — with-data state
 * Source of truth: WIREFRAMES.md §4, SCREEN-MAP.md 3.1, FEATURES.md F2/F6/F8/F9
 *
 * Stitch vs UX conflicts resolved:
 * - Body Zones: Stitch Eyes/Neck/Shoulders/Lower Back →
 *   UX Neck/Back/Eyes/Wrists (FEATURES.md F2, SCREEN-MAP.md 3.1)
 * - Removed "Today's Score 84" widget — score not in FEATURES.md MVP;
 *   replaced with Streak Widget per WIREFRAMES.md §4
 * - Removed "INSIGHT" banner (not in MVP docs);
 *   added Pain Check-in banner per WIREFRAMES.md §4 + FEATURES.md F9
 * - Navigation tabs: Home/Library/Programs/Profile (not Sanctuary/Flow/Vitals)
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  Card,
  Text,
  H2,
  PillCTA,
  GhostButton,
  BottomNav,
  Badge,
  Divider,
} from '@/components/primitives';
import type { TabId, TabItem } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii, Shadows } from '@/constants/tokens';
import { mockUser, mockRoutines, BODY_ZONES, WEEK_DAYS } from '@/mock/data';
import type { ZoneId } from '@/mock/data';

const TABS: TabItem[] = [
  { id: 'home',     label: 'Home',     icon: <Ionicons name="home"           size={20} color={Colors.onPrimary} /> },
  { id: 'library',  label: 'Library',  icon: <Ionicons name="library"        size={20} color={Colors.onSurfaceVar} /> },
  { id: 'programs', label: 'Programs', icon: <Ionicons name="grid-outline"   size={20} color={Colors.onSurfaceVar} /> },
  { id: 'profile',  label: 'Profile',  icon: <Ionicons name="person-outline" size={20} color={Colors.onSurfaceVar} /> },
];

const INACTIVE_TABS: TabItem[] = [
  { id: 'home',     label: 'Home',     icon: <Ionicons name="home-outline"   size={20} color={Colors.onSurfaceVar} /> },
  { id: 'library',  label: 'Library',  icon: <Ionicons name="library-outline" size={20} color={Colors.onSurfaceVar} /> },
  { id: 'programs', label: 'Programs', icon: <Ionicons name="grid-outline"   size={20} color={Colors.onSurfaceVar} /> },
  { id: 'profile',  label: 'Profile',  icon: <Ionicons name="person-outline" size={20} color={Colors.onSurfaceVar} /> },
];

function buildTabs(active: TabId): TabItem[] {
  return INACTIVE_TABS.map((t) =>
    t.id === active
      ? { ...t, icon: TABS.find((tt) => tt.id === t.id)?.icon ?? t.icon }
      : t,
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = mockUser;
  const recommended = mockRoutines['neck'];

  function handleZonePress(zoneId: ZoneId) {
    router.push({ pathname: '/routine', params: { zone: zoneId } });
  }

  function handleRecommendedPress() {
    router.push({ pathname: '/routine', params: { zone: recommended.zone } });
  }

  const tabBarHeight = Layout.tabBarHeight + Math.max(insets.bottom, Spacing.md);

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
        {/* ── Greeting ── */}
        <View style={styles.header}>
          <Text variant="h1">
            Привет, {user.name} 👋
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Настройки">
            <Ionicons name="settings-outline" size={24} color={Colors.onSurfaceVar} />
          </Pressable>
        </View>

        <Divider size="lg" />

        {/* ── Streak Widget ── */}
        <Card style={styles.streakCard} elevated>
          <View style={styles.streakTop}>
            <View style={styles.streakCount}>
              <Ionicons name="flame" size={22} color={Colors.primaryLight} />
              <Text variant="h1" color={Colors.primary}>
                {user.streak} дней
              </Text>
            </View>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>
              подряд
            </Text>
          </View>
          <Divider size="md" />
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day, i) => (
              <View key={day} style={styles.dayItem}>
                <Text variant="caption" color={Colors.onSurfaceVar}>
                  {day}
                </Text>
                <View
                  style={[
                    styles.daydot,
                    user.weekActivity[i]
                      ? styles.daydotActive
                      : styles.daydotInactive,
                  ]}
                />
              </View>
            ))}
          </View>
        </Card>

        <Divider size="md" />

        {/* ── Recommended routine ── */}
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
            onPress={handleRecommendedPress}
            icon={<Ionicons name="play" size={16} color={Colors.onPrimary} />}
          />
        </Card>

        <Divider size="md" />

        {/* ── Eye Break ── */}
        <Pressable
          onPress={() => handleZonePress('eyes')}
          accessibilityRole="button"
          accessibilityLabel="Eye Break — 1 мин"
          style={({ pressed }) => [styles.eyeBreak, pressed && styles.pressed]}
        >
          <Ionicons name="eye-outline" size={20} color={Colors.primary} />
          <View style={styles.eyeBreakText}>
            <Text variant="h3" color={Colors.primary}>
              Eye Break
            </Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>
              Глаза устали? 30 сек без звука
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </Pressable>

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
                Shadows.card,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
              <Text variant="h3" style={styles.zoneLabel}>
                {zone.label}
              </Text>
              <View style={styles.zoneBar}>
                <View
                  style={[
                    styles.zoneBarFill,
                    user.painZones.includes(zone.id) && styles.zoneBarActive,
                  ]}
                />
              </View>
            </Pressable>
          ))}
        </View>

        <Divider size="md" />

        {/* ── Pain check-in banner ── */}
        {!user.hasPainCheckInToday && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Оценить боль сегодня"
            style={({ pressed }) => [
              styles.painBanner,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="analytics-outline" size={18} color={Colors.onSurfaceVar} />
            <Text variant="bodyMd" color={Colors.onSurfaceVar} style={styles.painText}>
              Как шея сейчас? Оценить боль →
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={[styles.navWrap, { bottom: 0 }]}>
        <BottomNav
          tabs={buildTabs('home')}
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
  root: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scroll: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Streak
  streakCard: {
    gap: 0,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    gap: 4,
  },
  daydot: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
  },
  daydotActive: {
    backgroundColor: Colors.primary,
  },
  daydotInactive: {
    backgroundColor: Colors.surfaceLow,
  },
  // Eye break
  eyeBreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.card,
  },
  eyeBreakText: {
    flex: 1,
  },
  // Zones grid
  zonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.cardGap,
  },
  zoneCard: {
    width: '47.5%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  zoneEmoji: {
    fontSize: 28,
  },
  zoneLabel: {
    marginTop: Spacing.xs,
  },
  zoneBar: {
    height: 3,
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radii.full,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  zoneBarFill: {
    height: 3,
    width: '40%',
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radii.full,
  },
  zoneBarActive: {
    width: '80%',
    backgroundColor: Colors.primary,
  },
  // Pain banner
  painBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
  },
  painText: {
    flex: 1,
  },
  // Nav
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  pressed: {
    opacity: 0.75,
  },
});
