import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../../constants/tokens';
import { OrbField } from './OrbField';

interface Props {
  children: React.ReactNode;
  /** Hide orb field (used for fullscreen session / exercise screens where orbs distract) */
  orbs?: boolean;
}

/**
 * Full-bleed atmospheric backdrop:
 *  - 5-stop vertical cream→peach LinearGradient
 *  - + OrbField with 3 radial orbs
 * Content layered above via children.
 *
 * CRITICAL: never nest inside ScrollView. Background must be position: absolute-style
 * (flex: 1 here, but children decide whether to scroll).
 */
export const AtmosphericBackground: React.FC<Props> = ({ children, orbs = true }) => {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.atmosphere as unknown as readonly [string, string, ...string[]]}
        locations={[0, 0.28, 0.58, 0.82, 1]}
        style={StyleSheet.absoluteFill}
      />
      {orbs && <OrbField />}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
