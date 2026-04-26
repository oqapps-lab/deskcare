import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/tokens';

interface Props {
  count: number;
  active: number;
}

/**
 * Horizontal row of N tap-dots. Active in coral, inactive in surfaceHighest.
 */
export const ProgressDots: React.FC<Props> = ({ count, active }) => {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${active + 1} of ${count}`}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              isActive
                ? { width: 22, backgroundColor: colors.primaryMid, borderRadius: radii.pill }
                : { width: 8, backgroundColor: colors.secondaryDim, borderRadius: 4 },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
  },
});
