import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, radii, shadows } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';

interface Props {
  icon: GlyphName;
  size?: number;
  iconSize?: number;
  glow?: boolean;
}

/**
 * Circular peach-tinted chip that contains a coral icon. Used as the leading
 * element in settings rows, and (larger, with glow) as the hero element in
 * permission prompts / session "current exercise" indicator.
 */
export const GlassIconChip: React.FC<Props> = ({
  icon,
  size = 48,
  iconSize,
  glow = false,
}) => {
  const resolvedIconSize = iconSize ?? Math.round(size * 0.48);
  const r = size / 2;

  return (
    <View style={[{ width: size, height: size }, glow && shadows.orbGlow]}>
      {glow && (
        <Svg
          width={size * 2}
          height={size * 2}
          style={[StyleSheet.absoluteFill, { left: -size / 2, top: -size / 2 }]}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient id="chipGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255,181,153,0.55)" stopOpacity="1" />
              <Stop offset="70%" stopColor="rgba(255,219,206,0.15)" stopOpacity="1" />
              <Stop offset="100%" stopColor="rgba(255,219,206,0)" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={size} cy={size} r={size} fill="url(#chipGlow)" />
        </Svg>
      )}
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            borderRadius: r,
            backgroundColor: colors.primarySoft,
          },
        ]}
      >
        {/* subtle inner-highlight top-left for glass feel */}
        <View
          style={[
            styles.innerRing,
            { borderRadius: r, width: size, height: size },
          ]}
          pointerEvents="none"
        />
        <Glyph name={icon} size={resolvedIconSize} color={colors.primaryMid} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
