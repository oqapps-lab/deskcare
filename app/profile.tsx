import React from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Text, BottomNav, Divider } from '@/components/primitives';
import type { TabId, TabItem } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii } from '@/constants/tokens';
import { mockUser, mockBadges } from '@/mock/data';

const BADGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  flame: 'flame', ribbon: 'ribbon', star: 'star', diamond: 'diamond',
};

const TABS: TabItem[] = [
  { id: 'home',     label: 'Home',     icon: <Ionicons name="home-outline"    size={20} color={Colors.onSurfaceVar} /> },
  { id: 'library',  label: 'Library',  icon: <Ionicons name="library-outline" size={20} color={Colors.onSurfaceVar} /> },
  { id: 'programs', label: 'Programs', icon: <Ionicons name="grid-outline"    size={20} color={Colors.onSurfaceVar} /> },
  { id: 'profile',  label: 'Profile',  icon: <Ionicons name="person"          size={20} color={Colors.primary}      /> },
];

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

function MenuRow({ icon, label, onPress, danger = false }: MenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}
    >
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.onSurfaceVar} />
      </View>
      <Text variant="body" color={danger ? Colors.error : Colors.onSurface} style={styles.menuLabel}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={danger ? Colors.error : Colors.outline} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarH = Layout.tabBarHeight + Math.max(insets.bottom, Spacing.md) + Spacing.lg;
  const earnedBadges = mockBadges.filter(b => b.earned).slice(0, 2);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarH + Spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={Colors.primary} />
            </View>
            <Pressable style={styles.editBadge} accessibilityLabel="Edit photo">
              <Ionicons name="pencil" size={12} color={Colors.onPrimary} />
            </Pressable>
          </View>
          <Divider size="md" />
          <Text variant="h1">{mockUser.name}</Text>
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>Member since 2023</Text>
        </View>

        <Divider size="xxl" />

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card elevated style={styles.statCard}>
            <Ionicons name="flame" size={24} color={Colors.primary} />
            <Divider size="sm" />
            <Text style={styles.statNumber}>14</Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>Day Streak</Text>
          </Card>
          <Card elevated style={styles.statCard}>
            <Ionicons name="timer-outline" size={24} color={Colors.primary} />
            <Divider size="sm" />
            <Text style={styles.statNumber}>42h</Text>
            <Text variant="bodyMd" color={Colors.onSurfaceVar}>Active Time</Text>
          </Card>
        </View>

        <Divider size="lg" />

        {/* Badges */}
        <Card elevated>
          <View style={styles.badgesHeader}>
            <Text variant="h3">Badges</Text>
            <Pressable accessibilityRole="button">
              <Text variant="bodyMd" color={Colors.primary}>View All</Text>
            </Pressable>
          </View>
          <Divider size="md" />
          <View style={styles.badgesRow}>
            {earnedBadges.map(badge => (
              <View key={badge.id} style={styles.badgeItem}>
                <View style={styles.badgeIcon}>
                  <Ionicons name={BADGE_ICONS[badge.icon]} size={26} color={Colors.primary} />
                </View>
                <Text variant="caption" color={Colors.onSurfaceVar}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Divider size="lg" />

        {/* Menu */}
        <Card elevated style={styles.menuCard}>
          <MenuRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="notifications-outline"
            label="Notification Preferences"
            onPress={() => {}}
          />
          <View style={styles.menuDivider} />
          <MenuRow
            icon="log-out-outline"
            label="Sign Out"
            onPress={() => router.replace('/index')}
            danger
          />
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

  avatarSection: { alignItems: 'center', paddingTop: Spacing.lg },
  avatarWrap:    { position: 'relative' },
  avatar: {
    width: 96, height: 96, borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.surface,
  },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
  },

  statsRow: { flexDirection: 'row', gap: Spacing.md },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xl },
  statNumber: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 40,
    lineHeight: 44,
    color: Colors.primary,
    letterSpacing: -1,
  },

  badgesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgesRow:    { flexDirection: 'row', gap: Spacing.md },
  badgeItem:    { alignItems: 'center', gap: Spacing.xs },
  badgeIcon: {
    width: 64, height: 64, borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  menuCard: { padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg,
    gap: Spacing.md,
    minHeight: Layout.minTouchTarget,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel:   { flex: 1 },
  menuDivider: { height: 1, backgroundColor: Colors.surfaceLow, marginLeft: 64 },

  nav:     { position: 'absolute', left: 0, right: 0 },
  pressed: { opacity: 0.78 },
});
