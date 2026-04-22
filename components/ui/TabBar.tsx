import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typeScale } from '../../constants/tokens';

export type TabId = 'home' | 'library' | 'programs' | 'profile';

interface Props {
  current: TabId;
}

const TABS: ReadonlyArray<{ id: TabId; label: string; route: string }> = [
  { id: 'home',     label: 'Home',     route: '/main/home' },
  { id: 'library',  label: 'Library',  route: '/main/library' },
  { id: 'programs', label: 'Programs', route: '/main/programs' },
  { id: 'profile',  label: 'Profile',  route: '/main/profile' },
];

/**
 * Custom bottom tab bar — floating blurred pill anchored above safe area.
 * Active tab: label inked, coral dot underneath. Inactive: muted ink, no dot.
 * Uses router.replace so swapping tabs does not grow the back stack.
 */
export const TabBar: React.FC<Props> = ({ current }) => {
  const insets = useSafeAreaInsets();

  const go = (id: TabId, route: string) => {
    if (id === current) return;
    Haptics.selectionAsync();
    router.replace(route as never);
  };

  return (
    <View
      style={[styles.wrap, { paddingBottom: insets.bottom + spacing.xs }]}
      pointerEvents="box-none"
    >
      <View style={styles.barOuter}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={30} tint="light" style={styles.blur}>
            <View style={styles.fill} pointerEvents="none" />
            <TabRow current={current} onPress={go} />
          </BlurView>
        ) : (
          <View style={styles.androidFill}>
            <TabRow current={current} onPress={go} />
          </View>
        )}
      </View>
    </View>
  );
};

const TabRow: React.FC<{ current: TabId; onPress: (id: TabId, r: string) => void }> = ({
  current,
  onPress,
}) => (
  <View style={styles.row}>
    {TABS.map((t) => {
      const active = t.id === current;
      return (
        <Pressable
          key={t.id}
          onPress={() => onPress(t.id, t.route)}
          hitSlop={8}
          accessibilityRole="tab"
          accessibilityLabel={t.label}
          accessibilityState={{ selected: active }}
          style={styles.tab}
        >
          <TabIcon id={t.id} color={active ? colors.primaryMid : colors.inkSubtle} />
          <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
          {active && <View style={styles.dot} />}
        </Pressable>
      );
    })}
  </View>
);

const TabIcon: React.FC<{ id: TabId; color: string }> = ({ id, color }) => {
  const common = {
    stroke: color,
    strokeWidth: 1.8 as number,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
  const paths: Record<TabId, React.ReactNode> = {
    home: (
      <Path d="M4 11 L12 4 L20 11 L20 20 L14 20 L14 14 L10 14 L10 20 L4 20 Z" {...common} />
    ),
    library: (
      <>
        <Path d="M5 5 L5 20 L11 19 L11 6 Z" {...common} />
        <Path d="M13 6 L13 19 L19 20 L19 5 Z" {...common} />
      </>
    ),
    programs: (
      <>
        <Path d="M6 4 L12 4 M12 4 L12 12 L6 12 L6 4 Z" {...common} />
        <Path d="M14 8 L20 8 L20 20 L14 20 L14 8 Z" {...common} />
      </>
    ),
    profile: (
      <>
        <Path d="M12 4 a4 4 0 1 1 0 8 a4 4 0 1 1 0 -8" {...common} />
        <Path d="M4 20 C4 16 8 14 12 14 C16 14 20 16 20 20" {...common} />
      </>
    ),
  };

  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      {paths[id]}
    </Svg>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  barOuter: {
    marginHorizontal: spacing.lg,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6,
  },
  blur: {
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  androidFill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
  },
  labelActive: {
    color: colors.primaryDeep,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primaryMid,
    position: 'absolute',
    bottom: -6,
  },
});
