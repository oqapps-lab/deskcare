import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard, IconHalo } from './ui';
import type { CalendarSlotState } from '../hooks/useCalendarSlot';
import { t } from '../lib/i18n';

/**
 * "Your next free slot at HH:MM (N min)" — tap → preview a 2-min routine
 * scoped to user's primary pain zone. Three states:
 *   - unknown    : permission un-asked → show CTA "Find time for a stretch"
 *   - denied     : silent (don't nag)
 *   - granted+null: silent (no free slots in next 4h)
 *   - granted+slot: show the slot card
 */
export const CalendarSlotCard: React.FC<{
  state: CalendarSlotState;
  routineSlug?: string;
}> = ({ state, routineSlug }) => {
  if (state.loading) return null;
  if (state.status === 'unavailable' || state.status === 'denied') return null;

  const isUnknown = state.status === 'unknown';
  const slot = state.next;

  // granted + no slot found in next 4h → don't render
  if (state.status === 'granted' && !slot) return null;

  const onPress = () => {
    Haptics.selectionAsync();
    if (isUnknown) {
      state.request();
      return;
    }
    // granted → start the routine preview
    if (routineSlug) {
      router.push({ pathname: '/exercise/preview', params: { routine: routineSlug } } as never);
    } else {
      router.push('/exercise/preview' as never);
    }
  };

  const title = isUnknown
    ? t('cal_unknown_title')
    : slot && slot.minutesFromNow < 5
    ? t('cal_now_title', { min: slot.durationMinutes })
    : slot
    ? t('cal_next_title', { time: slot.startLabel, min: slot.durationMinutes })
    : '';
  const sub = isUnknown
    ? t('cal_unknown_sub')
    : t('cal_sub_helper');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed, styles.wrap]}>
      <GlassCard tint="peach" radius="xl" padding={spacing.lg}>
        <View style={styles.row}>
          <IconHalo icon="clock" size="md" tone="coral" variant="tinted" />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.sub}>{sub}</Text>
          </View>
          <View style={styles.arrow}>
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path d="M6 3 L11 8 L6 13" stroke={colors.primaryMid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  sub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
