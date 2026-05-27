import React from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  IconHalo,
  NavHeader,
  PillCTA,
  ProgressBar,
} from '../components/ui';
import { colors, spacing, typeScale } from '../constants/tokens';
import { useChallenge, type ChallengeDuration } from '../hooks/useChallenge';
import { useBuddy } from '../hooks/useBuddy';
import { t } from '../lib/i18n';

const DURATIONS: ChallengeDuration[] = [7, 14, 30];

const TickGrid: React.FC<{ duration: number; doneCount: number; dayNumber: number }> = ({ duration, doneCount, dayNumber }) => {
  const reduceMotion = useReducedMotion();
  const cells: { state: 'done' | 'today' | 'future' | 'missed' }[] = [];
  for (let i = 1; i <= duration; i++) {
    if (i < dayNumber) cells.push({ state: i <= doneCount ? 'done' : 'missed' });
    else if (i === dayNumber) cells.push({ state: 'today' });
    else cells.push({ state: 'future' });
  }
  return (
    <View style={styles.grid}>
      {cells.map((c, i) => (
        <Animated.View
          key={i}
          entering={reduceMotion ? undefined : FadeInUp.delay(40 * i).duration(220)}
          style={[
            styles.cell,
            c.state === 'done'   && { backgroundColor: colors.primaryMid },
            c.state === 'today'  && styles.cellToday,
            c.state === 'missed' && { backgroundColor: colors.inkHairline },
            c.state === 'future' && { backgroundColor: colors.primarySoft, opacity: 0.5 },
          ]}
        />
      ))}
    </View>
  );
};

const StartView: React.FC<{ onPick: (d: ChallengeDuration) => void }> = ({ onPick }) => (
  <View>
    <Animated.View entering={FadeInUp.duration(280)}>
      <GlassCard tint="coral" radius="xl" padding={spacing.xl} innerGradient>
        <Eyebrow variant="accent">{t('ch_hero_eyebrow')}</Eyebrow>
        <Text style={styles.heroTitle}>{t('ch_hero_title')}</Text>
        <Text style={styles.heroBody}>{t('ch_hero_body')}</Text>
      </GlassCard>
    </Animated.View>

    <Eyebrow style={{ marginTop: spacing.xl }}>{t('ch_pick_eyebrow')}</Eyebrow>

    {DURATIONS.map((d, i) => (
      <Animated.View key={d} entering={FadeInDown.delay(80 + i * 80).duration(280)}>
        <Pressable
          onPress={() => onPick(d)}
          accessibilityRole="button"
          accessibilityLabel={t('ch_pick_label', { n: d })}
          style={({ pressed }) => [pressed && { opacity: 0.88 }]}
        >
          <GlassCard tint={d === 7 ? 'mint' : d === 14 ? 'lavender' : 'peach'} radius="xl" padding={spacing.lg} style={{ marginTop: spacing.md }}>
            <View style={styles.pickRow}>
              <IconHalo icon="check" size="md" tone={d === 7 ? 'mint' : d === 14 ? 'lavender' : 'peach'} variant="tinted" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.pickTitle}>{t(`ch_pick_${d}_title`)}</Text>
                <Text style={styles.pickBody}>{t(`ch_pick_${d}_body`)}</Text>
              </View>
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>
    ))}
  </View>
);

const ActiveView: React.FC<{
  duration: number;
  dayNumber: number;
  doneCount: number;
  daysLeft: number;
  progress: number;
  todayLogged: boolean;
  buddyName: string | null;
  buddyStreak: number;
  onLogToday: () => void;
  onShare: () => void;
  onCancel: () => void;
}> = ({ duration, dayNumber, doneCount, daysLeft, progress, todayLogged, buddyName, buddyStreak, onLogToday, onShare, onCancel }) => {
  const pulse = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  React.useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1.04, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse, reduceMotion]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View>
      <Animated.View entering={FadeInUp.duration(280)} style={pulseStyle}>
        <GlassCard tint="coral" radius="xl" padding={spacing.xl} innerGradient decorativeCorner>
          <Eyebrow variant="accent">{t('ch_active_eyebrow', { duration })}</Eyebrow>
          <Text style={styles.activeTitle}>
            {t('ch_active_day', { day: dayNumber, total: duration })}
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar value={progress} accessibilityLabel={`${Math.round(progress * 100)}%`} />
          </View>
          <Text style={styles.activeMeta}>{t('ch_active_meta', { done: doneCount, left: daysLeft })}</Text>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(280)}>
        <GlassCard tint="cream" radius="xl" padding={spacing.lg} style={{ marginTop: spacing.lg }}>
          <Eyebrow>{t('ch_grid_eyebrow')}</Eyebrow>
          <TickGrid duration={duration} doneCount={doneCount} dayNumber={dayNumber} />
        </GlassCard>
      </Animated.View>

      {buddyName && (
        <Animated.View entering={FadeInDown.delay(220).duration(280)}>
          <GlassCard tint="mint" radius="xl" padding={spacing.lg} style={{ marginTop: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={styles.buddyAvatar}>
                <Text style={styles.buddyAvatarText}>{buddyName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.buddyName}>{t('ch_buddy_with', { name: buddyName })}</Text>
                <Text style={styles.buddyMeta}>{t('ch_buddy_meta', { their: buddyStreak, yours: doneCount })}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
        {!todayLogged ? (
          <PillCTA variant="primary" size="lg" icon="check" iconBg breath onPress={onLogToday}>
            {t('ch_cta_log')}
          </PillCTA>
        ) : (
          <View style={styles.loggedBadge}>
            <Text style={styles.loggedText}>{t('ch_today_logged')}</Text>
          </View>
        )}
        <Pressable hitSlop={10} onPress={onShare} style={{ marginTop: spacing.md }}>
          <Text style={styles.linkText}>{t('ch_action_share')}</Text>
        </Pressable>
        <Pressable hitSlop={10} onPress={onCancel} style={{ marginTop: spacing.sm }}>
          <Text style={styles.cancelText}>{t('ch_action_end')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const ch = useChallenge();
  const { buddy } = useBuddy();

  const start = (d: ChallengeDuration) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    ch.start(d);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayLogged = !!ch.challenge?.completedDates.includes(todayStr);

  const logToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    ch.logToday();
  };

  const onShare = async () => {
    Haptics.selectionAsync();
    if (!ch.challenge) return;
    await Share.share({
      message: t('ch_share_message', {
        duration: ch.challenge.duration,
        done: ch.doneCount,
        day: ch.dayNumber,
      }),
    });
  };

  const onCancel = () => {
    Alert.alert(t('ch_cancel_title'), t('ch_cancel_body'), [
      { text: t('common_cancel'), style: 'cancel' },
      {
        text: t('ch_cancel_confirm'),
        style: 'destructive',
        onPress: async () => {
          await ch.cancel();
          Haptics.selectionAsync();
        },
      },
    ]);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.20} />
      <DecorativeArc position="bottom-left" tone="mint" size={200} opacity={0.14} />

      <NavHeader title={t('ch_nav_title')} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.huge,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {ch.loading ? null : !ch.challenge ? (
          <StartView onPick={start} />
        ) : (
          <ActiveView
            duration={ch.challenge.duration}
            dayNumber={ch.dayNumber}
            doneCount={ch.doneCount}
            daysLeft={ch.daysLeft}
            progress={ch.progress}
            todayLogged={todayLogged}
            buddyName={buddy?.display_name || null}
            buddyStreak={buddy?.current_streak || 0}
            onLogToday={logToday}
            onShare={onShare}
            onCancel={onCancel}
          />
        )}
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  heroTitle: { ...typeScale.headlineSm, color: colors.ink, marginTop: spacing.sm },
  heroBody: { ...typeScale.body, color: colors.inkMuted, marginTop: spacing.sm, lineHeight: 22 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pickTitle: { ...typeScale.titleLg, color: colors.ink },
  pickBody: { ...typeScale.bodySm, color: colors.inkMuted, marginTop: 2 },
  activeTitle: { ...typeScale.headlineSm, color: colors.ink, marginTop: spacing.sm },
  activeMeta: { ...typeScale.bodySm, color: colors.inkMuted, marginTop: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  cell: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  cellToday: {
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primaryMid,
  },
  buddyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mintMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyAvatarText: {
    ...typeScale.titleLg,
    color: colors.surfaceCard,
  },
  buddyName: { ...typeScale.titleLg, color: colors.ink },
  buddyMeta: { ...typeScale.bodySm, color: colors.inkMuted, marginTop: 2 },
  loggedBadge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    backgroundColor: colors.mintSoft,
  },
  loggedText: {
    ...typeScale.title,
    color: colors.primaryDeep,
  },
  linkText: { ...typeScale.body, color: colors.primaryMid },
  cancelText: { ...typeScale.bodySm, color: colors.inkSubtle },
});
