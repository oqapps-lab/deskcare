import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors, radii, shadows } from '../../constants/tokens';

type IllustrationName = 'wifi-cloud';

interface Props {
  name: IllustrationName;
  size?: number;
}

/**
 * Soft "clay" illustrations — 3D-look tiles with coral rim-light. Replaces
 * Stitch-generated bitmaps. Currently: wifi-cloud for offline state.
 */
export const ClayIllustration: React.FC<Props> = ({ name, size = 180 }) => {
  if (name === 'wifi-cloud') {
    return (
      <View style={[{ width: size, height: size }, styles.root, shadows.lift]}>
        <Svg width={size} height={size} viewBox="0 0 240 240">
          <Defs>
            <SvgLinearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFB599" stopOpacity="1" />
              <Stop offset="1" stopColor="#E87B4E" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgRadialGradient id="rim" cx="30%" cy="25%" r="60%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.7" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </SvgRadialGradient>
            <SvgLinearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F5F3EF" stopOpacity="1" />
              <Stop offset="1" stopColor="#D6C3B1" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="wifi" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#9D431A" stopOpacity="1" />
              <Stop offset="1" stopColor="#7E2C03" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>

          {/* tile */}
          <Rect x="10" y="10" width="220" height="220" rx="38" fill="url(#tile)" />
          <Rect x="10" y="10" width="220" height="220" rx="38" fill="url(#rim)" />

          {/* back small cloud */}
          <Ellipse cx="62" cy="155" rx="34" ry="22" fill="url(#cloud)" opacity="0.8" />
          <Ellipse cx="86" cy="150" rx="26" ry="18" fill="url(#cloud)" opacity="0.8" />
          <Ellipse cx="50" cy="170" rx="22" ry="14" fill="url(#cloud)" opacity="0.8" />

          {/* main front cloud */}
          <Ellipse cx="150" cy="170" rx="48" ry="32" fill="url(#cloud)" />
          <Ellipse cx="180" cy="162" rx="34" ry="26" fill="url(#cloud)" />
          <Ellipse cx="120" cy="180" rx="32" ry="22" fill="url(#cloud)" />

          {/* wifi arcs — coral, on cloud */}
          <Path
            d="M110 130 A 40 40 0 0 1 190 130"
            stroke="url(#wifi)"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M122 148 A 26 26 0 0 1 178 148"
            stroke="url(#wifi)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="150" cy="164" r="8" fill="url(#wifi)" />

          {/* slash for offline */}
          <Path
            d="M95 95 L205 205"
            stroke="#FFFFFF"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <Path
            d="M95 95 L205 205"
            stroke="#9D431A"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  root: {
    borderRadius: radii.xl,
  },
});
