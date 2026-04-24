import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Layout, Spacing } from '@/constants/tokens';
import { Text } from './Text';

interface TopBarProps {
  title?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  style?: ViewStyle;
  /** Transparent — use over hero images */
  transparent?: boolean;
}

export function TopBar({
  title,
  leftSlot,
  rightSlot,
  style,
  transparent = false,
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + Spacing.sm },
        !transparent && styles.solidBg,
        style,
      ]}
    >
      <View style={styles.slot}>{leftSlot}</View>

      <View style={styles.titleSlot}>
        {title != null && (
          <Text variant="h3" color={Colors.onSurface} center numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={[styles.slot, styles.rightSlot]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: Layout.headerHeight + Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  solidBg: {
    backgroundColor: Colors.canvas,
  },
  slot: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
});
