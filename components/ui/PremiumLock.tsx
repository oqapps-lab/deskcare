import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typeScale } from '../../constants/tokens';

type Size = 'xs' | 'sm' | 'md';

interface Props {
  size?: Size;
  /** When set, render the padlock + label in a small pill chip. Otherwise icon-only. */
  label?: string;
  /** Override stroke colour. Defaults to primaryDeep for accessible contrast. */
  tone?: 'coral' | 'subtle';
}

const SIZE_MAP: Record<Size, { box: number; stroke: number; chipPad: number; gap: number }> = {
  xs: { box: 10, stroke: 1.2, chipPad: 4,  gap: 2 },
  sm: { box: 14, stroke: 1.5, chipPad: 6,  gap: 4 },
  md: { box: 18, stroke: 1.6, chipPad: 8,  gap: 6 },
};

const PadlockPath: React.FC<{ size: number; stroke: number; color: string }> = ({
  size,
  stroke,
  color,
}) => (
  <Svg width={size} height={size} viewBox="0 0 18 18">
    <Path
      d="M5 9 L13 9 L13 14 L5 14 Z M7 9 L7 6 Q7 3 9 3 Q11 3 11 6 L11 9"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

/**
 * Unified premium gate marker.
 * Single padlock icon used everywhere a piece of content is locked behind paid:
 *  - Library list row (icon-only, sm)
 *  - Programs card row (icon-only, sm)
 *  - Library detail thumbnail overlay (label="Premium", md)
 *  - Home zone tile badge (icon-only, xs)
 *
 * Replaces the prior mix of key SVGs / "PRO" text / inline lock paths across
 * 4 different files so users see one consistent metaphor.
 */
export const PremiumLock: React.FC<Props> = ({ size = 'sm', label, tone = 'coral' }) => {
  const dim = SIZE_MAP[size];
  const color = tone === 'subtle' ? colors.inkSubtle : colors.primaryDeep;

  if (!label) {
    return <PadlockPath size={dim.box} stroke={dim.stroke} color={color} />;
  }

  return (
    <View
      style={[
        styles.chip,
        {
          paddingVertical: dim.chipPad,
          paddingHorizontal: dim.chipPad * 1.5,
          gap: dim.gap,
          borderRadius: dim.box,
        },
      ]}
    >
      <PadlockPath size={dim.box} stroke={dim.stroke} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    alignSelf: 'center',
  },
  label: {
    ...typeScale.labelSm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
