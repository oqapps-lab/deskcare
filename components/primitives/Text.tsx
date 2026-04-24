import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/tokens';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMd' | 'label' | 'caption';

interface TextProps {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
  /** Uppercase — used for Eyebrow-style labels */
  upper?: boolean;
  /** Center alignment */
  center?: boolean;
}

export function Text({
  children,
  variant = 'body',
  color,
  style,
  numberOfLines,
  upper = false,
  center = false,
}: TextProps) {
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[
        Typography[variant],
        color ? { color } : undefined,
        upper && styles.upper,
        center && styles.center,
        style,
      ]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  upper: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  center: {
    textAlign: 'center',
  },
});

// Convenience aliases so call-sites don't need to pass variant every time
export const Display = (props: Omit<TextProps, 'variant'>) => (
  <Text {...props} variant="display" color={props.color ?? Colors.primary} />
);

export const H1 = (props: Omit<TextProps, 'variant'>) => (
  <Text {...props} variant="h1" />
);

export const H2 = (props: Omit<TextProps, 'variant'>) => (
  <Text {...props} variant="h2" />
);

export const BodyText = (props: Omit<TextProps, 'variant'>) => (
  <Text {...props} variant="body" />
);

export const Caption = (props: Omit<TextProps, 'variant'>) => (
  <Text {...props} variant="caption" />
);
