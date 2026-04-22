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
  GlassCard,
  NavHeader,
  PillCTA,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

const SYMPTOMS = [
  { id: 'shooting',   label: 'Sharp shooting down my leg',   redFlag: false },
  { id: 'ache',       label: 'Dull ache in the lower back',  redFlag: false },
  { id: 'standing',   label: 'Worse when I stand up',        redFlag: false },
  { id: 'morning',    label: 'Stiff first thing in morning', redFlag: false },
  { id: 'numb',       label: 'Numb in the foot',             redFlag: true },
  { id: 'none',       label: 'None of these today',          redFlag: false },
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

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const adapt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/programs/sciatica?active=1');
  };

  const redFlagActive = selected.has('numb');
  const canAdapt = selected.size > 0;

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={220} opacity={0.18} />

      <NavHeader title="Symptom check-in" onBack={back} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>How is it today?</Text>
        <Text style={styles.sub}>Pick all that apply — we'll tune today's phase.</Text>

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
              <Eyebrow variant="accent">PLEASE PAUSE</Eyebrow>
              <Text style={styles.redFlagTitle}>Numbness deserves a doctor's eye.</Text>
              <Text style={styles.redFlagBody}>
                We'll pause the program for today. If the numbness continues for
                more than 48 hours, book a GP — it's the safest call.
              </Text>
            </GlassCard>
          </View>
        ) : (
          <Text style={styles.footnote}>
            We'll use your answers to choose gentler or more progressive work
            for today. Pick honestly.
          </Text>
        )}
      </ScrollView>

      <View style={[styles.ctaFloating, { paddingBottom: insets.bottom + spacing.md }]} pointerEvents="box-none">
        <PillCTA
          variant="primary"
          size="lg"
          breath={canAdapt}
          onPress={adapt}
          accessibilityLabel={redFlagActive ? 'Pause program' : canAdapt ? 'Adapt today' : 'Pick at least one'}
        >
          {redFlagActive ? 'Pause the program' : 'Adapt today'}
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
    paddingTop: spacing.xxxl,
    alignItems: 'center',
    backgroundColor: 'rgba(251,249,245,0.95)',
  },
});
