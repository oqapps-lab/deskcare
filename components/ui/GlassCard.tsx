import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii, shadows, spacing } from '../../constants/tokens';

type Radius = keyof typeof radii;
type Tint = 'cream' | 'peach' | 'lavender';

interface Props {
  children: React.ReactNode;
  radius?: Radius;
  padding?: number;
  tint?: Tint;
  elevated?: boolean;
  style?: ViewStyle;
}

/**
 * Frosted-glass card.
 *  iOS: BlurView intensity 40 + 72% white tint.
 *  Android: solid 88% white (BlurView noisy on Android).
 * Inner top-edge highlight 1px for "glass" feel. Warm coral-tinted shadow.
 *
 * CRITICAL: don't `flex:1` a child inside — BlurView collapses height. Use
 * explicit padding or `width:'100%'` inner View.
 */
export const GlassCard: React.FC<Props> = ({
  children,
  radius = 'lg',
  padding = spacing.xxl,
  tint = 'cream',
  elevated = true,
  style,
}) => {
  const r = radii[radius];
  const shadowStyle = elevated ? shadows.soft : {};

  const tintFill: Record<Tint, string> = {
    cream: colors.glassFill,
    peach: 'rgba(255,219,206,0.55)',
    lavender: 'rgba(234,221,255,0.45)',
  };

  if (Platform.OS === 'ios') {
    return (
      <View style={[{ borderRadius: r }, shadowStyle, style]}>
        <BlurView
          intensity={40}
          tint="light"
          style={[styles.blur, { borderRadius: r, padding }]}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: tintFill[tint], borderRadius: r },
            ]}
            pointerEvents="none"
          />
          <View
            style={[
              styles.innerHighlight,
              { borderRadius: r },
            ]}
            pointerEvents="none"
          />
          <View style={styles.content}>{children}</View>
        </BlurView>
      </View>
    );
  }

  // Android — semi-opaque solid
  return (
    <View
      style={[
        styles.androidCard,
        { borderRadius: r, padding, backgroundColor: colors.glassFillAndroid },
        shadowStyle,
        style,
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tintFill[tint], borderRadius: r },
        ]}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  blur: {
    overflow: 'hidden',
  },
  androidCard: {
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  content: {
    width: '100%',
  },
});
