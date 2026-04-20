import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors, typeScale } from '../../constants/tokens';

type Variant = 'muted' | 'accent' | 'onDark' | 'onPeach';
type Size = 'sm' | 'md';

interface Props {
  children: string;
  variant?: Variant;
  size?: Size;
  style?: TextStyle;
}

/**
 * Tracked UPPERCASE label. "НАПОМИНАНИЯ", "SEVERITY", "PREMIUM", "СЕК".
 */
export const Eyebrow: React.FC<Props> = ({
  children,
  variant = 'muted',
  size = 'md',
  style,
}) => {
  const colorMap: Record<Variant, string> = {
    muted: colors.inkSubtle,
    accent: colors.primaryMid,
    onDark: colors.white,
    onPeach: colors.primaryDeep,
  };

  return (
    <Text
      style={[
        size === 'md' ? typeScale.label : typeScale.labelSm,
        { color: colorMap[variant], textTransform: 'uppercase' as const },
        style,
      ]}
      allowFontScaling
    >
      {children}
    </Text>
  );
};
