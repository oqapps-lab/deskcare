import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AtmosphericBackground } from './AtmosphericBackground';
import { spacing } from '../../constants/tokens';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  /** Bottom clearance beyond safe-area inset. Default 140 (tab-bar + floating CTA). */
  bottomClearance?: number;
  /** Horizontal padding. Default spacing.xxl (24) */
  horizontalPadding?: number;
  /** Disable orb decoration (fullscreen sessions) */
  orbs?: boolean;
  /** Vertically center content (used for fullscreen timers / error states) */
  center?: boolean;
  contentStyle?: ViewStyle;
}

/**
 * Standard screen wrapper: AtmosphericBackground + SafeArea + ScrollView (optional).
 * See docs/06-design/DESIGN-GUIDE.md §5 — 3-layer layout rule.
 *
 * NOTE (2026-04-20, Batch 1 retro): Batch 1 screens compose
 * AtmosphericBackground + NavHeader + content manually because NavHeader
 * flows inline (not absolute) and <Screen center> would clash with that.
 * Batch 2 will evolve this primitive to accept `header` + `floating` slots,
 * then migrate existing screens. Kept in tree as the agreed primitive
 * per DESIGN-GUIDE §4.
 */
export const Screen: React.FC<Props> = ({
  children,
  scroll = false,
  bottomClearance = 140,
  horizontalPadding = spacing.xxl,
  orbs = true,
  center = false,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();

  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + bottomClearance,
    paddingHorizontal: horizontalPadding,
  };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padding, center && styles.center, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padding, center && styles.center, contentStyle]}>{children}</View>
  );

  return (
    <AtmosphericBackground orbs={orbs}>
      <StatusBar style="dark" />
      {body}
    </AtmosphericBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
