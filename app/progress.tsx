import React from 'react';
import {
  View, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Text, H2, BottomNav, Divider, ProgressBar } from '@/components/primitives';
import type { TabId, TabItem } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii } from '@/constants/tokens';
import { mockActivityGrid, mockFocusAreas, mockBadges } from '@/mock/data';

const BADGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  flame:   'flame',
  ribbon:  'ribbon',
  star:    'star',
  diamond: 'diamond',
};

const TABS: TabItem[] = [
  { id: 'home',     label: 'Home',     icon: <Ionicons name="home-outline"    size={20} color={Colors.onSurfaceVar} /> },
  { id: 'library',  label: 'Library',  icon: <Ionicons name="library-outline" size={20} color={Colors.onSurfaceVar} /> },
  { id: 'programs', label: 'Programs', icon: <Ionicons name="grid-outline"    size={20} color={Colors.onSurfaceVar} /> },
  { id: 'profile',  label: 'Profile',  icon: <Ionicons name="person"          size={20} color={Colors.primary}      /> },
];

const ACTIVITY_COLORS = [
  Colors.surfaceLow,
  `${Colors.primaryLight}55`,
  `${Colors.primaryLight}99`,
  Colors.primary,
];

const FOCUS_LABELS: Record<string, string> = {
  neck: 'Neck', back: 'Back', eyes: 'Eyes', wrists: 'Wrists',
};

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const tabBarH = Layout.tabBarHeight + Math.max(insets.bottom, Spacing.md) + Spacing.lg;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + Spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={Colors.primary} />
          </View>
          <Text variant="h3" style={styles.headerTitle}>DeskCare</Text>
          <Ionicons name="settings-outline" size={22} color={Colors.onSurfaceVar} />
        </View>

        <Divider size="xl" />

        {/* This Month */}
        <Card elevated>
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>This Month</Text>
          <Divider size="xs" />
          <View style={styles.monthRow}>
            <Text style={styles.monthNumber}>84</Text>
            <Text style={styles.monthPercent}>%</Text>
          </View>
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>Great consistency this cycle.</Text>
        </Card>

        <Divider size="lg" />

        {/* Activity grid */}
        <Card elevated>
          <H2>Activity</H2>
          <Divider size="lg" />
          <View style={styles.activityGrid}>
            {mockActivityGrid.map((week, wi) => (
              <View key={wi} style={styles.activityRow}>
                {week.map((level, di) => (
                  <View
                    key={di}
                    style={[styles.activityDot, { backgroundColor: ACTIVITY_COLORS[level] }]}
                  />
                ))}
              </View>
            ))}
          </View>
        </Card>

        <Divider size="lg" />

        {/* Focus Areas */}
        <Card elevated>
          <H2>Focus Areas</H2>
          <Divider size="lg" />
          <View style={styles.focusRows}>
            {Object.entries(mockFocusAreas).map(([zone, value]) => (
              <View key={zone} style={styles.focusRow}>
                <Text variant="bodyMd" color={Colors.onSurface} style={styles.focusLabel}>
                  {FOCUS_LABELS[zone]}
                </Text>
                <ProgressBar value={value} trackHeight={8} style={styles.focusBar} />
              </View>
            ))}
          </View>
        </Card>

        <Divider size="lg" />

        {/* Badges */}
        <Card elevated>
          <H2>Badges</H2>
          <Divider size="lg" />
          <View style={styles.badgeGrid}>
            {mockBadges.map(badge => (
              <View key={badge.id} style={[styles.badgeItem, !badge.earned && styles.badgeItemLocked]}>
                <View style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
                  <Ionicons
                    name={BADGE_ICONS[badge.icon]}
                    size={28}
                    color={badge.earned ? Colors.primary : Colors.outline}
                  />
                </View>
                <Text
                  variant="label"
                  color={badge.earned ? Colors.onSurface : Colors.outline}
                  style={styles.badgeLabel}
                >
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* Floating nav */}
      <View style={[styles.nav, { bottom: 0 }]}>
        <BottomNav tabs={TABS} activeTab={'profile' as TabId} onTabPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.canvas },
  scroll: { paddingHorizontal: Layout.screenPadding, paddingTop: Spacing.lg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
  },
  avatar: {
    width: 36, height: 36, borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1 },

  monthRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginVertical: Spacing.xs },
  monthNumber: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 64,
    lineHeight: 68,
    color: Colors.primary,
    letterSpacing: -2,
  },
  monthPercent: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 28,
    lineHeight: 40,
    color: Colors.primaryLight,
    paddingBottom: 8,
  },

  activityGrid: { gap: Spacing.sm },
  activityRow:  { flexDirection: 'row', gap: Spacing.sm },
  activityDot:  { width: 28, height: 28, borderRadius: Radii.full },

  focusRows: { gap: Spacing.lg },
  focusRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  focusLabel:{ width: 48 },
  focusBar:  { flex: 1 },

  badgeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md,
  },
  badgeItem: {
    width: '47%',
    backgroundColor: Colors.surfaceLow,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    alignItems: 'center', gap: Spacing.sm,
  },
  badgeItemLocked: { opacity: 0.5 },
  badgeIcon: {
    width: 56, height: 56, borderRadius: Radii.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeIconLocked: { backgroundColor: Colors.surfaceHighest },
  badgeLabel: { textAlign: 'center' },

  nav: { position: 'absolute', left: 0, right: 0 },
});
