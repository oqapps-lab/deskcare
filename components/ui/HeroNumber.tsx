import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, typeScale } from '../../constants/tokens';

interface Props {
  children: string | number;
  /** Render a ghost watermark number behind (offset + translucent) */
  ghost?: boolean;
  /** Render a peach halo behind the number */
  halo?: boolean;
  size?: 'xl' | 'lg' | 'md';
  style?: ViewStyle;
}

/**
 * Big display number. Coral gradient fill achieved via offset-text technique
 * (no MaskedView dependency). Optional ghost watermark and peach halo backdrop.
 */
export const HeroNumber: React.FC<Props> = ({
  children,
  ghost = false,
  halo = false,
  size = 'xl',
  style,
}) => {
  const typography =
    size === 'xl' ? typeScale.displayXl : size === 'lg' ? typeScale.display : typeScale.headline;

  return (
    <View style={[styles.root, style]}>
      {halo && (
        <View pointerEvents="none" style={styles.haloWrap}>
          <Svg width={280} height={280}>
            <Defs>
              <RadialGradient id="heroHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(255,181,153,0.55)" stopOpacity="1" />
                <Stop offset="60%" stopColor="rgba(255,219,206,0.20)" stopOpacity="1" />
                <Stop offset="100%" stopColor="rgba(255,219,206,0)" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={140} cy={140} r={140} fill="url(#heroHalo)" />
          </Svg>
        </View>
      )}
      {ghost && (
        <Text
          style={[
            typography,
            styles.ghost,
            { transform: [{ scale: 1.18 }] },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {children}
        </Text>
      )}
      <Text style={[typography, styles.hero]} allowFontScaling>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloWrap: {
    position: 'absolute',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    position: 'absolute',
    color: colors.primarySoft,
    opacity: 0.38,
  },
  hero: {
    color: colors.primaryMid,
  },
});
