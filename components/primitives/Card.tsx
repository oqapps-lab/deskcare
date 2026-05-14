import React from 'react';
import { Platform, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Colors, Layout, Radii, Shadows } from '@/constants/tokens';

const WEB_BLUR = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as any)
  : {};

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  bg?: string;
  glass?: boolean;
}

export function Card({ children, style, elevated = false, bg, glass = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        glass && styles.glassCard,
        glass && WEB_BLUR,
        elevated && !glass && Shadows.card,
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
    borderRadius: 28,
    padding: Layout.cardPadding,
  },

  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#4A9FD9',
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
});
