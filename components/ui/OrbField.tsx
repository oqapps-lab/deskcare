import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { gradients } from '../../constants/tokens';

/**
 * 3 radial orbs floating behind content. Absolute, pointerEvents="none".
 * Placed: coral top-right / peach mid-left / lavender bottom-center.
 * Uses RadialGradient via react-native-svg for true soft edges (LinearGradient
 * would give banded look).
 */
export const OrbField: React.FC = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="orbCoral" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gradients.orbCoral} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.orbCoral} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbPeach" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gradients.orbPeach} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.orbPeach} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="orbLavender" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={gradients.orbLavender} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradients.orbLavender} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* top-right coral */}
        <Circle
          cx={width * 0.88}
          cy={height * 0.12}
          r={Math.min(width, height) * 0.55}
          fill="url(#orbCoral)"
        />
        {/* mid-left peach */}
        <Circle
          cx={width * 0.02}
          cy={height * 0.48}
          r={Math.min(width, height) * 0.45}
          fill="url(#orbPeach)"
        />
        {/* bottom-center lavender */}
        <Circle
          cx={width * 0.5}
          cy={height * 0.92}
          r={Math.min(width, height) * 0.5}
          fill="url(#orbLavender)"
        />
      </Svg>
    </View>
  );
};
