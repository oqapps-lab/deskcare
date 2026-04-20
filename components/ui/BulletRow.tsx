import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { Glyph } from './Glyph';

interface Props {
  children: string;
}

/**
 * Row used on benefit lists — coral check-circle + body text.
 */
export const BulletRow: React.FC<Props> = ({ children }) => {
  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <Glyph name="check" size={14} color={colors.primaryMid} strokeWidth={2.8} />
      </View>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  text: {
    ...typeScale.body,
    color: colors.inkMuted,
    flex: 1,
  },
});
