import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  FloatingScrim,
  GlassCard,
  NavHeader,
  PillCTA,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';
import { t } from '../../lib/i18n';

const SYMPTOMS = [
  { id: 'shooting',   label: t('pscc_opt_sharp'),        redFlag: false },
  { id: 'ache',       label: t('pscc_opt_dull'),         redFlag: false },
  { id: 'standing',   label: t('pscc_opt_worse_stand'),  redFlag: false },
  { id: 'morning',    label: t('pscc_opt_stiff'),        redFlag: false },
  { id: 'numb',       label: t('pscc_opt_numb'),         redFlag: true },
  { id: 'none',       label: t('pscc_opt_none'),         redFlag: false },
];

export default function SymptomCheckerScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else {
      if (id === 'none') next.clear();
      else next.delete('none');
      next.add(id);
    }
    setSelected(next);
  };

  const userId = useUserId();

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/programs');
  };
  const adapt = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Best-effort persist symptom check-in into user_program_progress.
    // Anon users skip the write; both still continue to active sciatica view.
    if (userId && selected.size > 0) {
      const { data: program } = await supabase
        .from('programs')
        .select('id')
        .eq('slug', 'sciatica')
        .maybeSingle();
      if (program?.id) {
        const { data: phase } = await supabase
          .from('program_phases')
          .select('id')
          .eq('program_id', program.id)
          .eq('phase_type', 'gentle')
          .maybeSingle();
        const symptoms = Array.from(selected);
        const hasRedFlag = symptoms.includes('numb');
        await supabase
          .from('user_program_progress')
          .upsert(
            {
              user_id: userId,
              program_id: program.id,
              current_phase_id: phase?.id ?? null,
              status: hasRedFlag ? 'paused' : 'active',
              last_symptom_check: {
                date: new Date().toISOString(),
                symptoms,
                red_flag: hasRedFlag,
              },
              last_session_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,program_id' },
          );
      }
    }
    router.replace('/programs/sciatica?active=1');
  };

  const redFlagActive = selected.has('numb');
  const canAdapt = selected.size > 0;

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={220} opacity={0.18} />

      <NavHeader title={t('nav_symptom_checkin')} onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('pscc_title')}</Text>
        <Text style={styles.sub}>{t('pscc_sub')}</Text>

        <GlassCard tint="cream" radius="xl" padding={spacing.lg}>
          <View style={styles.list}>
            {SYMPTOMS.map((s, i) => {
              const active = selected.has(s.id);
              return (
                <React.Fragment key={s.id}>
                  <Pressable
                    onPress={() => toggle(s.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={s.label}
                    accessibilityState={{ checked: active }}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                  >
                    <View style={[styles.check, active && styles.checkActive]}>
                      {active && (
                        <Svg width={14} height={14} viewBox="0 0 14 14">
                          <Path d="M3 7 L6 10 L11 4" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </Svg>
                      )}
                    </View>
                    <Text style={[styles.label, active && styles.labelActive]}>{s.label}</Text>
                    {s.redFlag && active && (
                      <View style={styles.redFlagDot} />
                    )}
                  </Pressable>
                  {i < SYMPTOMS.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              );
            })}
          </View>
        </GlassCard>

        {redFlagActive ? (
          <View style={styles.redFlagWrap}>
            <GlassCard tint="coral" radius="xl" padding={spacing.lg} innerGradient>
              <Eyebrow variant="accent">{t('symp_eb_please_pause')}</Eyebrow>
              <Text style={styles.redFlagTitle}>{t('pscc_numb_warn_title')}</Text>
              <Text style={styles.redFlagBody}>{t('pscc_numb_warn_body')}</Text>
            </GlassCard>
          </View>
        ) : (
          <Text style={styles.footnote}>{t('pscc_pick_help')}</Text>
        )}
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <FloatingScrim />
        <PillCTA
          variant="primary"
          size="lg"
          breath={canAdapt}
          disabled={!canAdapt}
          onPress={adapt}
          accessibilityLabel={redFlagActive ? t('symptom_a11y_pause') : canAdapt ? t('symptom_a11y_adapt') : t('symptom_a11y_pick')}
        >
          {redFlagActive ? t('symptom_cta_pause') : t('symptom_cta_adapt')}
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.72,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: 'rgba(232,123,78,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: colors.primaryMid,
    borderColor: colors.primaryMid,
    ...shadows.chip,
  },
  label: {
    ...typeScale.body,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
  },
  labelActive: {
    color: colors.ink,
    fontFamily: typeScale.title.fontFamily,
  },
  redFlagDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  redFlagWrap: {
    marginTop: spacing.xl,
  },
  redFlagTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  redFlagBody: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  footnote: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    alignItems: 'center',
  },
});
