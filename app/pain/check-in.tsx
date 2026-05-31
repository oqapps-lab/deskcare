import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BgPattern } from '../../components/ui/BgPattern';
import { DecorativeArc } from '../../components/ui/DecorativeArc';
import { NavHeader } from '../../components/ui/NavHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { PillChip } from '../../components/ui/PillChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { IconHalo } from '../../components/ui/IconHalo';
import { SeveritySlider } from '../../components/ui/SeveritySlider';
import type { GlyphName } from '../../components/ui/Glyph';
import type { HaloTone } from '../../components/ui/IconHalo';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';
import { supabase } from '../../lib/supabase';
import { useUserId } from '../../lib/store/session';
import { t } from '../../lib/i18n';
import { todayLocal } from '../../lib/dates';

// The check-in tracks the SAME 4 desk-pain zones the user picks in
// onboarding (neck/back/eyes/wrists), so onboarding ↔ check-in ↔ home are
// consistent (tester R13). Each maps 1:1 to a DB body_zones.slug. The old
// torso BodyPainMap (shoulders/chest/lowerBack) is gone — eyes/wrists don't
// fit an anatomical torso and it diverged from the rest of the app.
type CheckinZone = 'neck' | 'back' | 'eyes' | 'wrists';

const painZoneToDbSlug: Record<CheckinZone, string> = {
  neck: 'neck',
  back: 'back',
  eyes: 'eyes',
  wrists: 'wrists',
};

type SeverityLevel = 'mild' | 'moderate' | 'severe';

interface ZoneDef {
  id: CheckinZone;
  label: string;
  icon: GlyphName;
  tone: HaloTone;
}

const ZONES: ReadonlyArray<ZoneDef> = [
  { id: 'neck', label: t('zone_neck'), icon: 'infinity', tone: 'coral' },
  { id: 'back', label: t('zone_back'), icon: 'refresh', tone: 'peach' },
  { id: 'eyes', label: t('zone_eyes'), icon: 'eye', tone: 'lavender' },
  { id: 'wrists', label: t('zone_wrists'), icon: 'plus', tone: 'mint' },
];

// Slider value (0..1) → discrete severity level. Thresholds chosen so that
// 1-3/10 = mild, 4-7/10 = moderate, 8-10/10 = severe.
const levelFromPct = (pct: number): SeverityLevel => {
  const tenths = Math.round(pct * 10);
  if (tenths <= 3) return 'mild';
  if (tenths <= 7) return 'moderate';
  return 'severe';
};

// Chip selection → slider value. Put slider in the middle of each level's range.
const pctFromLevel = (level: SeverityLevel): number => {
  if (level === 'mild') return 0.2;
  if (level === 'moderate') return 0.5;
  return 0.9;
};

/**
 * Pain Check-in — user selects zones on body, sets severity, picks label.
 * Demo flow continues to /sync on save.
 */
export default function PainCheckInScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const [selectedZones, setSelectedZones] = useState<Set<CheckinZone>>(
    new Set<CheckinZone>(['neck']),
  );
  const [severityPct, setSeverityPctRaw] = useState(0.4);
  const [level, setLevelRaw] = useState<SeverityLevel>('moderate');

  const setSeverityPct = (pct: number) => {
    setSeverityPctRaw(pct);
    const next = levelFromPct(pct);
    if (next !== level) setLevelRaw(next);
  };

  const setLevel = (nextLevel: SeverityLevel) => {
    if (nextLevel === level) return;
    setLevelRaw(nextLevel);
    setSeverityPctRaw(pctFromLevel(nextLevel));
  };

  const contentOpacity = useSharedValue(0);
  const contentY = useSharedValue(16);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 420 });
    contentY.value = withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) });
    ctaOpacity.value = withDelay(reduceMotion ? 0 : 400, withTiming(1, { duration: 400 }));
  }, [reduceMotion, contentOpacity, contentY, ctaOpacity]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  const toggleZone = (z: CheckinZone) => {
    Haptics.selectionAsync();
    const next = new Set(selectedZones);
    if (next.has(z)) next.delete(z);
    else next.add(z);
    setSelectedZones(next);
  };

  const userId = useUserId();

  const save = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Best-effort write — only signed-in users have RLS access to pain_entries.
    // Anonymous + design-review demos still flow forward to /sync.
    if (userId && selectedZones.size > 0) {
      const slugs = Array.from(
        new Set(
          Array.from(selectedZones)
            .map((z) => painZoneToDbSlug[z as string])
            .filter(Boolean),
        ),
      );
      if (slugs.length > 0) {
        const painLevel = Math.max(1, Math.min(10, Math.round(severityPct * 10)));
        const { data: zones } = await supabase
          .from('body_zones')
          .select('id, slug')
          .in('slug', slugs);

        // Local-time today. UTC slice would attribute pain entries to
        // yesterday in early local morning of UTC+N regions.
        const today = todayLocal();
        const rows = (zones ?? []).map((z: { id: string; slug: string }) => ({
          user_id: userId,
          body_zone_id: z.id,
          pain_level: painLevel,
          recorded_date: today,
        }));
        if (rows.length > 0) {
          await supabase
            .from('pain_entries')
            .upsert(rows, { onConflict: 'user_id,body_zone_id,recorded_date' });
        }
      }
    }
    router.push('/sync');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.05} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={240} opacity={0.20} />
      <DecorativeArc position="bottom-left" tone="lavender" size={200} opacity={0.15} />

      <NavHeader title={t('nav_how_feel')} onBack={back} />

      <Animated.View style={[styles.wrap, contentStyle]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + 320,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('pc_title')}</Text>
          <Text style={styles.subtitle}>{t('pc_sub')}</Text>

          {/* Zone selector chips with IconHalo */}
          <View style={styles.zonesScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.zonesRow}
            >
              {ZONES.map((z) => {
                const active = selectedZones.has(z.id);
                return (
                  <ZoneTile
                    key={z.id}
                    label={z.label}
                    icon={z.icon}
                    tone={z.tone}
                    active={active}
                    onPress={() => toggleZone(z.id)}
                  />
                );
              })}
            </ScrollView>
          </View>


          {/* Severity slider */}
          <GlassCard
            tint="peach"
            radius="xl"
            padding={spacing.xl}
            innerGradient
            decorativeCorner
          >
            <View style={styles.severityHeader}>
              <Eyebrow>{t('pain_eb_intensity')}</Eyebrow>
              <Text style={styles.severityValue}>
                {Math.round(severityPct * 10)}/10
              </Text>
            </View>
            <View style={{ height: spacing.md }} />
            <SeveritySlider value={severityPct} onChange={setSeverityPct} />
            <View style={{ height: spacing.sm }} />
            <View style={styles.severityLabels}>
              <Text style={styles.severityLabelEnd}>{t('pc_no_pain')}</Text>
              <Text style={styles.severityLabelEnd}>{t('pph_pain_sharp')}</Text>
            </View>
          </GlassCard>

          <View style={{ height: spacing.lg }} />

          <View style={styles.eyebrowRow}>
            <Eyebrow>{t('pain_eb_describe')}</Eyebrow>
          </View>

          <View style={styles.chipColumn}>
            <PillChip
              active={level === 'mild'}
              onPress={() => setLevel('mild')}
              icon={level === 'mild' ? 'check' : undefined}
            >
              {t('pc_chip_mild')}
            </PillChip>
            <PillChip
              active={level === 'moderate'}
              icon={level === 'moderate' ? 'check' : undefined}
              onPress={() => setLevel('moderate')}
            >
              {t('pc_chip_moderate')}
            </PillChip>
            <PillChip
              active={level === 'severe'}
              onPress={() => setLevel('severe')}
              icon={level === 'severe' ? 'check' : undefined}
            >
              {t('pc_chip_severe')}
            </PillChip>
          </View>
        </ScrollView>

        <Animated.View
          style={[
            styles.ctaFloating,
            ctaStyle,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
          pointerEvents="box-none"
        >
          <LinearGradient
            colors={[
              'rgba(251,249,245,0)',
              'rgba(251,249,245,0.85)',
              'rgba(251,249,245,1)',
            ]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <PillCTA
            variant="primary"
            size="lg"
            icon="check"
            iconBg
            breath={selectedZones.size > 0}
            disabled={selectedZones.size === 0}
            onPress={save}
          >
            {t('pc_save_cta')}
          </PillCTA>
        </Animated.View>
      </Animated.View>
    </AtmosphericBackground>
  );
}

interface ZoneTileProps {
  label: string;
  icon: GlyphName;
  tone: HaloTone;
  active: boolean;
  onPress: () => void;
}

const ZoneTile: React.FC<ZoneTileProps> = ({ label, icon, tone, active, onPress }) => (
  <View style={tileStyles.wrap}>
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={6}
      style={({ pressed }) => [
        tileStyles.btn,
        active && tileStyles.btnActive,
        pressed && tileStyles.btnPressed,
      ]}
    >
      <IconHalo
        icon={icon}
        size="md"
        tone={tone}
        variant={active ? 'gradient' : 'tinted'}
        glow={active}
      />
      <Text style={[tileStyles.label, active && tileStyles.labelActive]}>
        {label}
      </Text>
    </Pressable>
  </View>
);

const tileStyles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.xs,
  },
  btn: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    gap: spacing.xs,
    minWidth: 88,
  },
  btnActive: {
    backgroundColor: colors.surfaceCard,
    ...shadows.soft,
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  label: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  labelActive: {
    color: colors.ink,
  },
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  zonesScrollWrap: {
    marginHorizontal: -spacing.xxl,
    marginBottom: spacing.xl,
  },
  zonesRow: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    alignItems: 'center',
  },
  mapWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  mapInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  severityValue: {
    ...typeScale.headlineSm,
    color: colors.primary,
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityLabelEnd: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
  },
  eyebrowRow: {
    marginBottom: spacing.md,
  },
  chipColumn: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    alignItems: 'center',
  },
});
