import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../../constants/tokens';

export type ArcPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';
export type ArcTone = 'coral' | 'peach' | 'lavender';

interface Props {
  position: ArcPosition;
  tone?: ArcTone;
  size?: number;
  opacity?: number;
}

const TONE_COLOR: Record<ArcTone, string> = {
  coral: colors.primaryMid,
  peach: colors.primaryLight,
  lavender: colors.tertiaryMid,
};

// Relative circle placement inside the SVG viewbox (3 merged circles for organic blob).
// coords are in the 0..1 range of the SVG box.
const BLOB_CIRCLES: ReadonlyArray<{ cx: number; cy: number; r: number; opacity: number }> = [
  { cx: 0.5, cy: 0.5, r: 0.38, opacity: 1 },
  { cx: 0.32, cy: 0.36, r: 0.26, opacity: 0.7 },
  { cx: 0.66, cy: 0.62, r: 0.24, opacity: 0.6 },
];

const positionStyle = (pos: ArcPosition, size: number): ViewStyle => {
  const offset = -Math.round(size * 0.3);
  switch (pos) {
    case 'top-right':
      return { top: offset, right: offset };
    case 'top-left':
      return { top: offset, left: offset };
    case 'bottom-right':
      return { bottom: offset, right: offset };
    case 'bottom-left':
      return { bottom: offset, left: offset };
  }
};

/**
 * DecorativeArc — abstract organic blob for empty / hero screen corners.
 *  - 2-3 merged circles rendered with a radial gradient fill (tone at center,
 *    transparent at edges).
 *  - Absolute-positioned in a screen corner, pointerEvents="none".
 *  - Pure atmospheric garnish — does not receive touches.
 */
export const DecorativeArc: React.FC<Props> = ({
  position,
  tone = 'coral',
  size = 240,
  opacity = 0.4,
}) => {
  const color = TONE_COLOR[tone];
  const gradId = `decor-arc-${tone}-${position}`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.root,
        positionStyle(position, size),
        { width: size, height: size, opacity },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <Stop offset="60%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {BLOB_CIRCLES.map((c, i) => (
          <Circle
            key={i}
            cx={c.cx * 100}
            cy={c.cy * 100}
            r={c.r * 100}
            fill={`url(#${gradId})`}
            opacity={c.opacity}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
  },
});
