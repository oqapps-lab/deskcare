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
import Svg, { Circle, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  GlassCard,
  Glyph,
  PillCTA,
} from '../../components/ui';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

type Plan = 'yearly' | 'monthly';

const TIMELINE = [
  { marker: 'Today',  title: 'Full access',   sub: 'Every zone, every routine — start right now.' },
  { marker: 'Day 5',  title: 'We remind you', sub: 'A gentle reminder before the trial ends. Never a surprise.' },
  { marker: 'Day 7',  title: 'Billing begins', sub: 'Cancel any time in settings before day 7 and pay nothing.' },
];

const BENEFITS = [
  'Personal routines by your pain zones',
  'All zones, every program unlocked',
  'Sciatica program + symptom check-in',
  'Pain tracking & weekly insights',
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [plan, setPlan] = useState<Plan>('yearly');

  const headOpacity = useSharedValue(0);
  const headY = useSharedValue(12);
  const contentOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  // Close (×) intentionally hidden for the first ~3s so users actually read
  // the offer before bailing. Standard practice on Calm/Spotify/Tinder paywalls.
  const closeOpacity = useSharedValue(0);

  useEffect(() => {
    const d = reduceMotion ? 0 : 140;
    headOpacity.value = withTiming(1, { duration: 420 });
    headY.value = withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) });
    contentOpacity.value = withDelay(d * 2, withTiming(1, { duration: 520 }));
    ctaOpacity.value = withDelay(d * 4, withTiming(1, { duration: 420 }));
    closeOpacity.value = withDelay(reduceMotion ? 0 : 3000, withTiming(1, { duration: 360 }));
  }, [reduceMotion, headOpacity, headY, contentOpacity, ctaOpacity, closeOpacity]);

  const headStyle = useAnimatedStyle(() => ({
    opacity: headOpacity.value,
    transform: [{ translateY: headY.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));
  const closeStyle = useAnimatedStyle(() => ({ opacity: closeOpacity.value }));

  const close = () => {
    Haptics.selectionAsync();
    router.replace('/main/home');
  };
  const begin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/main/home');
  };
  const pickPlan = (p: Plan) => {
    Haptics.selectionAsync();
    setPlan(p);
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.18} />
      <DecorativeArc position="bottom-right" tone="coral" size={280} opacity={0.16} />

      <Animated.View
        style={[styles.closeWrap, { top: insets.top + spacing.sm }, closeStyle]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={close}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close paywall"
        >
          <View style={styles.closeBtn}>
            <Glyph name="close-x" size={16} color={colors.inkMuted} />
          </View>
        </Pressable>
      </Animated.View>

      <View style={styles.wrap}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + spacing.xxxl + spacing.md,
            paddingBottom: insets.bottom + 260,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.head, headStyle]}>
            <Eyebrow variant="accent">YOUR 14-DAY PROGRAM</Eyebrow>
            <View style={{ height: spacing.sm }} />
            <Text style={styles.title}>Your program{'\n'}is waiting.</Text>
            <Text style={styles.sub}>Keep going past day 7.</Text>
          </Animated.View>

          <Animated.View style={[styles.timelineWrap, contentStyle]}>
            <GlassCard tint="cream" radius="xl" padding={spacing.xl}>
              <View style={styles.timeline}>
                {TIMELINE.map((t, i) => (
                  <View key={t.marker} style={styles.timelineRow}>
                    <View style={styles.timelineDotCol}>
                      <View style={[styles.timelineDot, i === 0 && styles.timelineDotActive]} />
                      {i < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineText}>
                      <View style={styles.timelineTitleRow}>
                        <Text style={styles.timelineMarker}>{t.marker}</Text>
                        <Text style={styles.timelineTitle}>{t.title}</Text>
                      </View>
                      <Text style={styles.timelineSub}>{t.sub}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View style={[styles.benefitsWrap, contentStyle]}>
            <Eyebrow>EVERYTHING INCLUDED</Eyebrow>
            <View style={{ height: spacing.md }} />
            {BENEFITS.map((b) => (
              <View key={b} style={styles.benefitRow}>
                <View style={styles.benefitCheck}>
                  <Svg width={12} height={12} viewBox="0 0 12 12">
                    <Path
                      d="M2.5 6.5 L5 9 L9.5 3.5"
                      stroke={colors.primaryDeep}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                </View>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.plansWrap, contentStyle]}>
            <Pressable onPress={() => pickPlan('yearly')} accessibilityRole="button" accessibilityLabel="Yearly — $2.49 per month">
              <View style={[styles.planYearly, plan === 'yearly' && styles.planYearlyActive]}>
                {plan === 'yearly' && (
                  <LinearGradient
                    colors={['rgba(255,197,170,0.55)', 'rgba(255,181,153,0.25)'] as readonly [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View style={styles.planRow}>
                  <View style={styles.planRadio}>
                    {plan === 'yearly' && <View style={styles.planRadioDot} />}
                  </View>
                  <View style={styles.planMain}>
                    <Text style={styles.planTitle}>Yearly — $2.49 / month</Text>
                    <Text style={styles.planSub}>$29.99 billed once a year</Text>
                  </View>
                  <View style={styles.savingBadge}>
                    <Text style={styles.savingBadgeText}>SAVE 58%</Text>
                  </View>
                </View>
              </View>
            </Pressable>

            <View style={{ height: spacing.sm }} />

            <Pressable onPress={() => pickPlan('monthly')} accessibilityRole="button" accessibilityLabel="Monthly — $4.99 per month">
              <View style={[styles.planMonthly, plan === 'monthly' && styles.planMonthlyActive]}>
                <View style={styles.planRow}>
                  <View style={styles.planRadio}>
                    {plan === 'monthly' && <View style={styles.planRadioDot} />}
                  </View>
                  <View style={styles.planMain}>
                    <Text style={[styles.planTitle, styles.planTitleMonthly]}>Monthly — $4.99 / month</Text>
                    <Text style={styles.planSub}>Cancel any time.</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.trustRow, contentStyle]}>
            <View style={styles.starRow}>
              <Svg width={14} height={14} viewBox="0 0 14 14">
                <Path d="M7 1 L8.7 5 L13 5.6 L9.8 8.5 L10.7 13 L7 10.8 L3.3 13 L4.2 8.5 L1 5.6 L5.3 5 Z" fill={colors.primaryMid} />
              </Svg>
              <Text style={styles.trustText}>4.8 · 2,400+ reviews</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.legalRow, contentStyle]}>
            <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Restore purchase">
              <Text style={styles.legalLink}>Restore purchase</Text>
            </Pressable>
            <View style={styles.legalDotDivider} />
            <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Terms of service">
              <Text style={styles.legalLink}>Terms</Text>
            </Pressable>
            <View style={styles.legalDotDivider} />
            <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Privacy policy">
              <Text style={styles.legalLink}>Privacy</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[styles.ctaFloating, ctaStyle, { paddingBottom: insets.bottom + spacing.md }]}
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
          <PillCTA variant="primary" size="lg" breath onPress={begin}>
            Begin 7 days free
          </PillCTA>
          <View style={{ height: spacing.xs }} />
          <Text style={styles.afterText}>
            {plan === 'yearly' ? 'Then $29.99 / year · cancel anytime' : 'Then $4.99 / month · cancel anytime'}
          </Text>
        </Animated.View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  closeWrap: {
    position: 'absolute',
    right: spacing.xxl,
    zIndex: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glassFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
  timelineWrap: {
    marginBottom: spacing.xl,
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primarySoft,
    marginTop: 6,
  },
  timelineDotActive: {
    backgroundColor: colors.primaryMid,
    ...shadows.chip,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.inkHairline,
    marginVertical: 2,
  },
  timelineText: {
    flex: 1,
    minWidth: 0,
    paddingBottom: spacing.md,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  timelineMarker: {
    ...typeScale.label,
    color: colors.primaryDeep,
    textTransform: 'uppercase',
  },
  timelineTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  timelineSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  benefitsWrap: {
    marginBottom: spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  benefitCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...typeScale.body,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
  },
  plansWrap: {
    marginBottom: spacing.xl,
  },
  planYearly: {
    borderRadius: 28,
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    overflow: 'hidden',
  },
  planYearlyActive: {
    borderWidth: 2,
    borderColor: colors.primaryMid,
    ...shadows.chip,
  },
  planMonthly: {
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(232,123,78,0.22)',
  },
  planMonthlyActive: {
    borderColor: colors.primaryMid,
    borderWidth: 2,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryMid,
  },
  planMain: {
    flex: 1,
    minWidth: 0,
  },
  planTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  planTitleMonthly: {
    ...typeScale.title,
  },
  planSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  savingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryMid,
  },
  savingBadgeText: {
    ...typeScale.labelSm,
    color: colors.white,
    textTransform: 'uppercase',
  },
  trustRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trustText: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  legalLink: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
  },
  legalDotDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.inkHairline,
  },
  ctaFloating: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  afterText: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
