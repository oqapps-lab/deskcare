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
          <BlurView intensity={50} tint="light" style={styles.blur}>
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
          <TabIcon
            id={t.id}
            color={active ? colors.primaryDeep : colors.inkSubtle}
            active={active}
          />
          <Text style={[styles.label, active && styles.labelActive]}>{t.label}</Text>
          {active && <View style={styles.dot} />}
        </Pressable>
      );
    })}
  </View>
);

const TabIcon: React.FC<{ id: TabId; color: string; active: boolean }> = ({
  id,
  color,
  active,
}) => {
  // Active state gets a soft fill in addition to the stroke — modern
  // "duotone" pattern. Inactive stays pure outline for cleanliness.
  const fill = active ? 'rgba(232,123,78,0.14)' : 'none';
  const common = {
    stroke: color,
    strokeWidth: 1.7 as number,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const paths: Record<TabId, React.ReactNode> = {
    // House — softer rounded apex, single closed path so the fill renders
    // as a filled silhouette rather than two disjoint pieces.
    home: (
      <Path
        d="M4.5 11.5 L12 4.5 L19.5 11.5 L19.5 19 Q19.5 20 18.5 20 L14.5 20 L14.5 14.5 Q14.5 13.5 13.5 13.5 L10.5 13.5 Q9.5 13.5 9.5 14.5 L9.5 20 L5.5 20 Q4.5 20 4.5 19 Z"
        fill={fill}
        {...common}
      />
    ),
    // Open book — two facing pages with a center spine. Cleaner than the
    // prior pair-of-bookends shapes that looked like vases at small sizes.
    library: (
      <>
        <Path
          d="M4 6 Q4 5 5 5 L11 6 Q11.5 6 11.5 6.5 L11.5 18.5 Q11.5 19 11 19 L5 18 Q4 18 4 17 Z"
          fill={fill}
          {...common}
        />
        <Path
          d="M20 6 Q20 5 19 5 L13 6 Q12.5 6 12.5 6.5 L12.5 18.5 Q12.5 19 13 19 L19 18 Q20 18 20 17 Z"
          fill={fill}
          {...common}
        />
      </>
    ),
    // Stacked panels — single large pane behind, smaller pane in front.
    // Reads as "structured programs" cleanly.
    programs: (
      <>
        <Path
          d="M5 7 Q5 5.5 6.5 5.5 L17.5 5.5 Q19 5.5 19 7 L19 16 Q19 17.5 17.5 17.5 L6.5 17.5 Q5 17.5 5 16 Z"
          fill={fill}
          {...common}
        />
        <Path d="M9 9.5 L15 9.5 M9 13 L15 13" {...common} />
      </>
    ),
    // Person — rounded head + soft shoulders.
    profile: (
      <>
        <Path
          d="M12 4 a3.5 3.5 0 1 1 0 7 a3.5 3.5 0 1 1 0 -7"
          fill={fill}
          {...common}
        />
        <Path
          d="M4.5 19.5 Q4.5 14 12 14 Q19.5 14 19.5 19.5"
          fill={fill}
          {...common}
        />
      </>
    ),
  };

  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
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
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 28,
    elevation: 10,
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
