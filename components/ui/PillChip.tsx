import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, spacing, typeScale } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';

interface Props {
  children: string;
  active?: boolean;
  onPress?: () => void;
  icon?: GlyphName;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

/**
 * Select chip. Active state — coral gradient fill + white label + soft glow.
 * Inactive — warm cream tonal fill + muted ink label.
 */
export const PillChip: React.FC<Props> = ({
  children,
  active = false,
  onPress,
  icon,
  size = 'md',
  style,
}) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  const height = size === 'md' ? 44 : 36;
  const padX = size === 'md' ? spacing.xl : spacing.md;

  if (active) {
    // Matte coral glass — same language as PillCTA primary / MatteCoralPill.
    // Replaces the prior 3-stop top-to-bottom coral gradient that read as a
    // printed paint job ("ужасный градиент сверху вниз").
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
        style={[styles.base, { height, borderRadius: radii.pill }, shadows.chip, style]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={32}
            tint="light"
            style={[StyleSheet.absoluteFill, { borderRadius: radii.pill, overflow: 'hidden' }]}
          >
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(232,123,78,0.78)', borderRadius: radii.pill },
              ]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[
                'rgba(255,255,255,0.10)',
                'rgba(0,0,0,0)',
                'rgba(0,0,0,0.10)',
              ] as const}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </BlurView>
        ) : (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(232,123,78,0.92)', borderRadius: radii.pill },
            ]}
          />
        )}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0)'] as const}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.activeSheen, { borderRadius: radii.pill }]}
        />
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: radii.pill,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: 'rgba(255,255,255,0.45)',
            },
          ]}
        />
        <View style={[styles.content, { paddingHorizontal: padX }]}>
          {icon && (
            <View style={{ marginRight: children ? spacing.sm : 0 }}>
              <Glyph name={icon} size={14} color={colors.white} />
            </View>
          )}
          <Text style={[styles.label, { color: colors.white }]} numberOfLines={1}>
            {children}
          </Text>
        </View>
      </Pressable>
    );
  }

  // INACTIVE — matte glass pill (BlurView on iOS, semi-transparent solid on Android)
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: radii.pill,
          borderWidth: 1,
          borderColor: 'rgba(232,123,78,0.18)',
          opacity: pressed ? 0.72 : 1,
        },
        style,
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={24}
          tint="light"
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill, overflow: 'hidden' }]}
        >
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255,255,255,0.38)', borderRadius: radii.pill },
            ]}
          />
        </BlurView>
      ) : (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: radii.pill },
          ]}
        />
      )}
      <View style={[styles.content, { paddingHorizontal: padX }]}>
        {icon && (
          <View style={{ marginRight: children ? spacing.sm : 0 }}>
            <Glyph name={icon} size={14} color={colors.primaryMid} />
          </View>
        )}
        <Text style={[styles.label, { color: colors.primaryDeep }]} numberOfLines={1}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typeScale.title,
    fontFamily: typeScale.label.fontFamily,
    fontSize: 14,
  },
});
