import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, gradients, radii, shadows, spacing, typeScale } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';

type Variant = 'primary' | 'outlined' | 'ghost' | 'iconOnly' | 'glass';
type Size = 'md' | 'lg' | 'xl' | 'iconBig';

interface Props {
  children?: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: GlyphName;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  /** @deprecated legacy prop — ignored. Use `breath` for modern ambient life. */
  shimmer?: boolean;
  /** When both `icon` and `label` are present, wraps the icon in a subtle
   *  white-alpha 28x28 circle for extra visual weight. */
  iconBg?: boolean;
  /** Ambient breathing (scale 1 → 1.012 @ 3.2s loop) for primary/iconOnly.
   *  Off by default — enable sparingly for hero CTAs. */
  breath?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Primary action pill. 3-stop coral gradient + top-inner highlight + outer glow.
 * Variants:
 *  - primary: gradient fill + white text (default)
 *  - outlined: 1.5px coral ring + transparent + coral text ("Попробовать снова")
 *  - ghost: no fill, coral text + icon ("Позже" / "SKIP")
 *  - iconOnly: circular, gradient fill, icon only (play/pause)
 */
export const PillCTA: React.FC<Props> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'leading',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  shimmer: _legacyShimmer = false,
  iconBg = false,
  breath = false,
}) => {
  const scale = useSharedValue(1);
  const breathScale = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const breathActive =
    breath && (variant === 'primary' || variant === 'iconOnly') && !disabled;

  useEffect(() => {
    if (!breathActive || reduceMotion) return;
    breathScale.value = withRepeat(
      withTiming(1.012, { duration: 3200, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [breathActive, reduceMotion, breathScale]);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 160 });
  };
  const handlePress = () => {
    if (disabled || loading) return;
    if (variant === 'primary' || variant === 'iconOnly') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.selectionAsync();
    }
    onPress?.();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * breathScale.value }],
  }));

  const sizeMap: Record<Size, { height: number; padX: number; textSize: number; iconSize: number }> = {
    md: { height: 48, padX: 20, textSize: 15, iconSize: 18 },
    lg: { height: 58, padX: 28, textSize: 16, iconSize: 20 },
    xl: { height: 72, padX: 32, textSize: 18, iconSize: 22 },
    iconBig: { height: 72, padX: 0, textSize: 0, iconSize: 28 },
  };
  const s = sizeMap[size];

  const iconColor =
    variant === 'primary' || variant === 'iconOnly'
      ? colors.white
      : colors.primaryMid;

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={iconColor} />;
    }
    if (variant === 'iconOnly') {
      return icon && <Glyph name={icon} size={s.iconSize} color={iconColor} />;
    }
    const label = children && (
      <Text
        style={[
          styles.label,
          {
            color: variant === 'primary' ? colors.white : colors.primaryMid,
            fontSize: s.textSize,
          },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    );
    const rawIconEl =
      icon && <Glyph name={icon} size={s.iconSize} color={iconColor} />;
    // iconBg: wrap the icon in a 28x28 white-alpha circle when we have BOTH
    // an icon and a label (label check keeps circle out of `iconOnly` variant).
    const iconEl =
      rawIconEl && iconBg && children
        ? (
          <View style={styles.iconBg}>
            <Glyph name={icon!} size={s.iconSize} color={iconColor} />
          </View>
        )
        : rawIconEl;
    return (
      <View style={styles.rowContent}>
        {iconPosition === 'leading' && iconEl}
        {iconPosition === 'leading' && iconEl && label && <View style={{ width: spacing.sm }} />}
        {label}
        {iconPosition === 'trailing' && label && iconEl && <View style={{ width: spacing.sm }} />}
        {iconPosition === 'trailing' && iconEl}
      </View>
    );
  };

  const width = variant === 'iconOnly' ? s.height : undefined;

  // PRIMARY — gradient (or muted-tint when disabled, so it doesn't look like a
  // dim-but-tappable coral pill).
  if (variant === 'primary' || variant === 'iconOnly') {
    if (disabled) {
      return (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled
          accessibilityRole="button"
          accessibilityState={{ disabled: true }}
          accessibilityLabel={accessibilityLabel || children}
          style={[
            animStyle,
            styles.pillBase,
            {
              height: s.height,
              width,
              paddingHorizontal: variant === 'iconOnly' ? 0 : s.padX,
              borderRadius: radii.pill,
              backgroundColor: colors.surfaceLow,
              borderWidth: 1,
              borderColor: 'rgba(232,123,78,0.18)',
            },
            style,
          ]}
        >
          {/* Disabled state: flat warm-cream pill, hairline coral border, dim
              ink label. No gradient, no glow — clearly inactive. */}
          {variant === 'iconOnly'
            ? icon && <Glyph name={icon} size={s.iconSize} color={colors.inkSubtle} />
            : (
              <View style={styles.rowContent}>
                {icon && (
                  <>
                    <Glyph name={icon} size={s.iconSize} color={colors.inkSubtle} />
                    {children && <View style={{ width: spacing.sm }} />}
                  </>
                )}
                {children && (
                  <Text
                    style={[
                      styles.label,
                      { color: colors.inkSubtle, fontSize: s.textSize },
                    ]}
                    numberOfLines={1}
                  >
                    {children}
                  </Text>
                )}
              </View>
            )}
        </AnimatedPressable>
      );
    }

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || children}
        style={[
          animStyle,
          styles.pillBase,
          shadows.cta,
          {
            height: s.height,
            width,
            paddingHorizontal: variant === 'iconOnly' ? 0 : s.padX,
            borderRadius: radii.pill,
          },
          style,
        ]}
      >
        {/* Base — 4-stop diagonal mesh. Top-left blush, bottom-right ember. */}
        <LinearGradient
          colors={gradients.ctaMesh as unknown as readonly [string, string, ...string[]]}
          locations={[0, 0.38, 0.72, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
        />
        {/* Matte gloss overlay — soft top highlight fading to nothing. */}
        <LinearGradient
          pointerEvents="none"
          colors={gradients.ctaGloss as unknown as readonly [string, string, ...string[]]}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.9 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
        />
        {/* thin top-inner hairline for glass feel */}
        <View style={styles.topHighlight} pointerEvents="none" />
        {renderContent()}
      </AnimatedPressable>
    );
  }

  // GLASS — matte frosted glass with coral tint
  if (variant === 'glass') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || children}
        style={[
          animStyle,
          styles.pillBase,
          shadows.soft,
          {
            height: s.height,
            paddingHorizontal: s.padX,
            borderRadius: radii.pill,
            opacity: disabled ? 0.5 : 1,
            borderWidth: 1,
            borderColor: 'rgba(232,123,78,0.35)',
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
                { backgroundColor: 'rgba(255,181,153,0.28)', borderRadius: radii.pill },
              ]}
            />
          </BlurView>
        ) : (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(255,219,206,0.72)', borderRadius: radii.pill },
            ]}
          />
        )}
        <View style={styles.topHighlight} pointerEvents="none" />
        {renderContent()}
      </AnimatedPressable>
    );
  }

  // OUTLINED
  if (variant === 'outlined') {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || children}
        style={[
          animStyle,
          styles.pillBase,
          {
            height: s.height,
            paddingHorizontal: s.padX,
            borderWidth: 1.5,
            borderColor: colors.primaryMid,
            backgroundColor: 'transparent',
            borderRadius: radii.pill,
            opacity: disabled ? 0.5 : 1,
          },
          style,
        ]}
      >
        {renderContent()}
      </AnimatedPressable>
    );
  }

  // GHOST
  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      style={[
        animStyle,
        styles.pillBase,
        {
          height: s.height,
          paddingHorizontal: s.padX,
          backgroundColor: 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  pillBase: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typeScale.title,
    fontFamily: fonts.bold,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
