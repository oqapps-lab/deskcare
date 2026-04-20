import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { Glyph, GlyphName } from './Glyph';

interface Props {
  title?: string;
  onBack?: () => void;
  rightIcon?: GlyphName;
  onRightPress?: () => void;
  /** Show back chevron even without onBack (acts as router.back stub) */
  showBack?: boolean;
}

/**
 * Top header. Transparent background, absolute-positioned by Screen wrapper via
 * safe-area inset. Back chevron left, title centered, optional right-icon.
 *
 * Renders inline (flow) — pair with Screen padding that accounts for its height (~56).
 */
export const NavHeader: React.FC<Props> = ({
  title,
  onBack,
  rightIcon,
  onRightPress,
  showBack = true,
}) => {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    Haptics.selectionAsync();
    onBack?.();
  };
  const handleRight = () => {
    Haptics.selectionAsync();
    onRightPress?.();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.side}>
        {(showBack || onBack) && (
          <Pressable
            onPress={handleBack}
            hitSlop={16}
            accessibilityRole="button"
            accessibilityLabel="Назад"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Glyph name="back-chevron" size={24} color={colors.ink} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>
        {rightIcon && (
          <Pressable
            onPress={handleRight}
            hitSlop={16}
            accessibilityRole="button"
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Glyph name={rightIcon} size={24} color={colors.ink} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    ...typeScale.title,
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
});
