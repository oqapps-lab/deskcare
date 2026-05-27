import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typeScale } from '../constants/tokens';
import { GlassCard, PillCTA } from './ui';
import type { PostureScore } from '../hooks/usePostureScore';
import { t } from '../lib/i18n';

const COLOR_BY_LABEL: Record<PostureScore['label'], string> = {
  great: colors.mintMid,
  good: colors.mintMid,
  drifting: colors.primaryMid,
  poor: colors.error,
  unknown: colors.inkSubtle,
};

const TITLE_BY_LABEL = (label: PostureScore['label']): string => {
  switch (label) {
    case 'great': return t('posture_title_great');
    case 'good': return t('posture_title_good');
    case 'drifting': return t('posture_title_drifting');
    case 'poor': return t('posture_title_poor');
    default: return t('posture_title_unknown');
  }
};

const SUB_BY_LABEL = (m: number | null, label: PostureScore['label']): string => {
  if (label === 'unknown') return t('posture_sub_unknown');
  if (m === null) return '';
  if (m < 45) return t('posture_sub_recent', { min: m });
  if (m < 60) return t('posture_sub_recheck_soon', { min: m });
  const h = Math.floor(m / 60);
  return t('posture_sub_hours', { h, m: m - h * 60 });
};

/**
 * Posture awareness card on Home + tap-to-open self-check modal.
 * 3-point alignment cues (ears over shoulders, shoulders down/back,
 * screen at eye level). "I corrected" CTA records the moment and
 * refreshes the score.
 */
export const PostureCard: React.FC<{ posture: PostureScore }> = ({ posture }) => {
  // ⚠ ALL hooks must run on every render — never gate behind early-return.
  const [open, setOpen] = useState(false);
  const value = posture.score ?? 0;
  const target = useSharedValue(0);
  React.useEffect(() => {
    target.value = withTiming(value, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [value, target]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  if (posture.loading) return null;

  const tint = posture.label === 'great' || posture.label === 'good' ? 'mint' : posture.label === 'unknown' ? 'cream' : 'peach';
  const color = COLOR_BY_LABEL[posture.label];
  const title = TITLE_BY_LABEL(posture.label);
  const sub = SUB_BY_LABEL(posture.minutesSinceCheck, posture.label);

  const openCheck = () => {
    Haptics.selectionAsync();
    setOpen(true);
  };
  const confirm = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await posture.markChecked();
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={openCheck} style={({ pressed }) => [pressed && styles.pressed]}>
        <GlassCard tint={tint} radius="xl" padding={spacing.lg}>
          <View style={styles.row}>
            <Animated.View style={[styles.ringWrap, ringStyle]}>
              <Svg width={56} height={56} viewBox="0 0 56 56">
                <Circle cx="28" cy="28" r="24" stroke={colors.inkHairline} strokeWidth="4" fill="none" />
                <Circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${(150.7) * (value / 10)} 150.7`}
                  transform="rotate(-90 28 28)"
                />
              </Svg>
              <View style={styles.ringLabel}>
                <Text style={[styles.ringValue, { color }]}>
                  {posture.score === null ? '—' : posture.score.toFixed(1)}
                </Text>
              </View>
            </Animated.View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.eyebrow}>{t('posture_eyebrow')}</Text>
              <Text style={styles.title}>{title}</Text>
              {!!sub && <Text style={styles.sub}>{sub}</Text>}
            </View>
          </View>
        </GlassCard>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={() => { /* swallow */ }} style={styles.modalCard}>
            <Text style={styles.modalEyebrow}>{t('posture_modal_eyebrow')}</Text>
            <Text style={styles.modalTitle}>{t('posture_modal_title')}</Text>
            <View style={styles.cueRow}>
              <View style={styles.cueNumber}>
                <Text style={styles.cueNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cueTitle}>{t('posture_cue_ears_title')}</Text>
                <Text style={styles.cueSub}>{t('posture_cue_ears_sub')}</Text>
              </View>
            </View>
            <View style={styles.cueRow}>
              <View style={styles.cueNumber}>
                <Text style={styles.cueNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cueTitle}>{t('posture_cue_shoulders_title')}</Text>
                <Text style={styles.cueSub}>{t('posture_cue_shoulders_sub')}</Text>
              </View>
            </View>
            <View style={styles.cueRow}>
              <View style={styles.cueNumber}>
                <Text style={styles.cueNumberText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cueTitle}>{t('posture_cue_screen_title')}</Text>
                <Text style={styles.cueSub}>{t('posture_cue_screen_sub')}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <PillCTA variant="primary" size="md" onPress={confirm}>
                {t('posture_cta_corrected')}
              </PillCTA>
              <Pressable onPress={() => setOpen(false)} hitSlop={12} style={styles.dismissBtn}>
                <Text style={styles.dismissText}>{t('posture_dismiss')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
  ringWrap: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  ringLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    ...typeScale.titleLg,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  eyebrow: {
    ...typeScale.label,
    color: colors.primaryDeep,
    marginBottom: 2,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,15,12,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surfaceCard,
    borderRadius: 28,
    padding: spacing.xxl,
  },
  modalEyebrow: {
    ...typeScale.label,
    color: colors.primaryMid,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typeScale.headlineSm,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cueNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueNumberText: {
    ...typeScale.titleLg,
    color: colors.primaryDeep,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  cueTitle: {
    ...typeScale.title,
    color: colors.ink,
  },
  cueSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  modalActions: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  dismissBtn: {
    paddingVertical: spacing.sm,
  },
  dismissText: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
  },
});
