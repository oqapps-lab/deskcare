import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Colors, Layout, Radii, Shadows } from '@/constants/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  bg?: string;
}

export function Card({ children, style, elevated = false, bg }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        elevated && Shadows.card,
        bg ? { backgroundColor: bg } : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Layout.cardPadding,
  },
});
