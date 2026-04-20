import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, gradients, radii, shadows, spacing, typeScale } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';

type Variant = 'primary' | 'outlined' | 'ghost' | 'iconOnly';
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
}) => {
  const scale = useSharedValue(1);

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

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
    const iconEl = icon && <Glyph name={icon} size={s.iconSize} color={iconColor} />;
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

  // PRIMARY — gradient
  if (variant === 'primary' || variant === 'iconOnly') {
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
          shadows.cta,
          {
            height: s.height,
            width,
            paddingHorizontal: variant === 'iconOnly' ? 0 : s.padX,
            opacity: disabled ? 0.5 : 1,
            borderRadius: radii.pill,
          },
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.ctaCoral as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.pill }]}
        />
        {/* top-inner highlight */}
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
    fontFamily: typeScale.title.fontFamily.replace('600SemiBold', '700Bold'),
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
