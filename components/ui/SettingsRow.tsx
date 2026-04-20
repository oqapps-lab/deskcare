import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { GlassCard } from './GlassCard';
import { GlassIconChip } from './GlassIconChip';
import { Glyph, GlyphName } from './Glyph';
import { ToggleSwitch } from './ToggleSwitch';
import { Eyebrow } from './Eyebrow';

type Right =
  | { type: 'toggle'; value: boolean; onChange?: (v: boolean) => void }
  | { type: 'chevron'; onPress?: () => void; badge?: string };

interface Props {
  icon: GlyphName;
  title: string;
  subtitle?: string;
  right: Right;
}

/**
 * Composed settings list row:
 *   GlassCard { GlassIconChip, title+subtitle, [Toggle | chevron+badge] }
 */
export const SettingsRow: React.FC<Props> = ({ icon, title, subtitle, right }) => {
  const body = (
    <View style={styles.row}>
      <GlassIconChip icon={icon} size={44} />
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {right.type === 'toggle' && (
          <ToggleSwitch value={right.value} onChange={right.onChange} />
        )}
        {right.type === 'chevron' && (
          <View style={styles.chevronGroup}>
            {right.badge && (
              <View style={styles.badge}>
                <Eyebrow variant="accent" size="sm">
                  {right.badge}
                </Eyebrow>
              </View>
            )}
            <Glyph name="chevron-right" size={18} color={colors.inkSubtle} />
          </View>
        )}
      </View>
    </View>
  );

  if (right.type === 'chevron') {
    return (
      <Pressable
        onPress={right.onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <GlassCard radius="xl" padding={spacing.lg}>
          {body}
        </GlassCard>
      </Pressable>
    );
  }

  return (
    <GlassCard radius="xl" padding={spacing.lg}>
      {body}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  subtitle: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  right: {
    marginLeft: spacing.sm,
  },
  chevronGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
});
