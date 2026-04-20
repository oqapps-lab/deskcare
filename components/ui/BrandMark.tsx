import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, typeScale } from '../../constants/tokens';

/**
 * Compact brand wordmark — "DeskCare" in Jakarta ExtraBold with a subtle
 * coral dot before the "C" (the "care" signal). Used on onboarding / splash
 * type screens, never next to nav back.
 */
export const BrandMark: React.FC<{ color?: string }> = ({ color = colors.ink }) => {
  return (
    <Text style={[styles.root, { color }]} accessibilityLabel="DeskCare">
      DeskCare
    </Text>
  );
};

const styles = StyleSheet.create({
  root: {
    ...typeScale.title,
    letterSpacing: 0.3,
  },
});
