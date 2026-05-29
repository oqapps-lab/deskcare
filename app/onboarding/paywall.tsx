import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LEGAL_URLS } from '../../lib/legal';
import { IS_EXPO_GO } from '../../lib/native-runtime';
import { PREMIUM_BYPASS, setPremiumFromProfile } from '../../lib/premium';

// Adapty is a native TurboModule and crashes at import time inside Expo Go.
// Lazy-load it so the screen still renders for visual QA on Expo Go.
const loadAdapty = (): any => {
  if (IS_EXPO_GO) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('react-native-adapty').adapty;
  } catch {
    return null;
  }
};
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
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
import { t } from '../../lib/i18n';

type Plan = 'yearly' | 'monthly' | 'weekly';

const TIMELINE = [
  { marker: t('pw_today_eyebrow'),  title: t('pw_today_title'),   sub: t('pw_today_body') },
  { marker: t('pw_day5_eyebrow'),   title: t('pw_day5_title'),    sub: t('pw_day5_body') },
  { marker: t('pw_day7_eyebrow'),   title: t('pw_day7_title'),    sub: t('pw_day7_body') },
];

const BENEFITS = [
  t('paywall_feature_zones'),
  t('paywall_feature_all_zones'),
  t('paywall_feature_sciatica'),
  t('paywall_feature_pain_insights'),
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [plan, setPlan] = useState<Plan>('yearly');
  // Begin button busy state. Without this the user sees the CTA looking
  // identical during the (possibly slow) Adapty.getPaywall call → tester
  // feedback: "сильно тупит, пропускает только если множественно нажимать".
  const [busy, setBusy] = useState(false);

  const headOpacity = useSharedValue(0);
  const headY = useSharedValue(12);
  const contentOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  // Close (×) used to be hidden for 3s, but combined with a slow Adapty
  // call that left the user feeling trapped on this screen. Now visible
  // from t=0 (still fades in for animation polish, but only over 600ms).
  const closeOpacity = useSharedValue(0);

  useEffect(() => {
    const d = reduceMotion ? 0 : 140;
    headOpacity.value = withTiming(1, { duration: 420 });
    headY.value = withTiming(0, { duration: 480, easing: Easing.out(Easing.cubic) });
    contentOpacity.value = withDelay(d * 2, withTiming(1, { duration: 520 }));
    ctaOpacity.value = withDelay(d * 4, withTiming(1, { duration: 420 }));
    closeOpacity.value = withTiming(1, { duration: 600 });
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
    // Same paywall serves both the onboarding stack (welcome → quiz → … →
    // paywall) and the in-app upsell (Programs / Library tile → paywall).
    // Going back respects whichever flow opened it. Only fall through to
    // /main/home when there's no history — i.e. the paywall is the root
    // screen of a deep-link.
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  const begin = async () => {
    if (busy) return; // ignore double-taps
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // TF-internal: paywall is purely cosmetic — premium content is unlocked
    // app-wide via PREMIUM_BYPASS. Tap routes directly to home.
    if (PREMIUM_BYPASS) {
      router.replace('/main/home');
      return;
    }
    // Production: attempt the Adapty purchase. The actual product key is
    // wired once Adapty paywalls + ASC IAP products are live (Stage 7).
    // Until then, this branch routes to home and the user remains free.
    const adapty = loadAdapty();
    if (!adapty) {
      router.replace('/main/home');
      return;
    }
    setBusy(true);
    // Hard 5 s ceiling on Adapty calls so the button can never look frozen.
    // If Adapty doesn't reply, race resolves to a 'timeout' sentinel and we
    // route to home (TF-internal users still get full access via the bypass).
    const TIMEOUT_MS = 5000;
    const timeoutSentinel = Symbol('adapty-timeout');
    const withTimeout = <T,>(p: Promise<T>) =>
      Promise.race<T | typeof timeoutSentinel>([
        p,
        new Promise<typeof timeoutSentinel>((res) => setTimeout(() => res(timeoutSentinel), TIMEOUT_MS)),
      ]);
    try {
      const paywall = await withTimeout(adapty.getPaywall('default'));
      if (paywall === timeoutSentinel) throw new Error('adapty getPaywall timeout');
      const products = await withTimeout(adapty.getPaywallProducts(paywall));
      if (products === timeoutSentinel) throw new Error('adapty getPaywallProducts timeout');
      const product = (products as any[]).find((p) => {
        const unit =
          p?.subscription?.subscriptionPeriod?.unit ??
          p?.subscriptionPeriod?.unit;
        if (plan === 'yearly') return unit === 'year';
        if (plan === 'monthly') return unit === 'month';
        return unit === 'week';
      });
      if (!product) throw new Error('No matching product in Adapty paywall');
      const purchase = await withTimeout(adapty.makePurchase(product));
      if (purchase === timeoutSentinel) throw new Error('adapty makePurchase timeout');
      // AdaptyPurchaseResult is a discriminated union — only type:'success'
      // carries a profile + an actual transaction. user_cancelled / pending
      // must NOT be treated as a purchase, otherwise the user lands on home
      // without premium and gets gated again on the next premium tile.
      const pr = purchase as { type?: string; profile?: unknown };
      if (pr.type === 'user_cancelled') {
        // Apple's StoreKit sheet cancel — silent, no error UI. Stay on paywall.
        return;
      }
      if (pr.type === 'success') {
        // Flip the local premium store immediately, no need to wait for the
        // onLatestProfileLoad event to fire.
        if (pr.profile) setPremiumFromProfile(pr.profile);
        router.replace('/main/home');
        return;
      }
      // type === 'pending' (Ask-to-Buy / Family Sharing approval) or any
      // shape Adapty might add later — be conservative: leave the user on
      // paywall with the CTA re-enabled, no fake premium flip.
      return;
    } catch (e) {
      console.warn('[deskcare] Paywall purchase fell back to home:', e);
      router.replace('/main/home');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    Haptics.selectionAsync();
    const showFound = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('pw_restore_success_title'),
        t('pw_restore_success_body'),
        [{ text: t('common_close') }],
      );
    };
    const showNotFound = () => {
      Haptics.selectionAsync();
      Alert.alert(
        t('pw_restore_none_title'),
        t('pw_restore_none_body'),
        [{ text: t('common_close') }],
      );
    };
    const showError = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        t('pw_restore_err_title'),
        t('pw_restore_err_body'),
        [{ text: t('common_close') }],
      );
    };
    if (PREMIUM_BYPASS) {
      // TF-internal premium bypass — pretend success so QA can verify the
      // happy-path Alert renders. Real users never hit this branch.
      showFound();
      return;
    }
    const adapty = loadAdapty();
    if (!adapty) {
      showError();
      return;
    }
    try {
      const profile = await adapty.restorePurchases();
      // Adapty surfaces active sub state through accessLevels[<key>].isActive.
      // The "premium" key is the app's access-level identifier in Adapty.
      const hasActive = !!profile?.accessLevels?.premium?.isActive;
      if (hasActive) {
        // Flip the local premium store immediately rather than waiting for
        // Adapty's onLatestProfileLoad event — without this, the UI lags by
        // up to a few seconds even after the success Alert dismisses.
        setPremiumFromProfile(profile);
        showFound();
      } else {
        showNotFound();
      }
    } catch {
      showError();
    }
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
          accessibilityLabel={t('pw_close_label')}
        >
          <View style={styles.closeBtn}>
            <Glyph name="close-x" size={16} color={colors.inkMuted} />
          </View>
        </Pressable>
      </Animated.View>

      <View style={styles.wrap}>
        <ScrollView
          removeClippedSubviews={true}
        scrollEventThrottle={16}
        contentContainerStyle={{
            paddingTop: insets.top + spacing.xxxl + spacing.md,
            paddingBottom: insets.bottom + 260,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.head, headStyle]}>
            <Eyebrow variant="accent">{t('pw_eyebrow')}</Eyebrow>
            <View style={{ height: spacing.sm }} />
            <Text style={styles.title}>{t('pw_title')}</Text>
            <Text style={styles.sub}>{t('pw_hint')}</Text>
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
            <Eyebrow>{t('pw_eb_everything_included')}</Eyebrow>
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
            <Pressable onPress={() => pickPlan('yearly')} accessibilityRole="button" accessibilityLabel={t('pw_plan_yearly')}>
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
                    <Text style={styles.planTitle}>{t('pw_plan_yearly')}</Text>
                    <Text style={styles.planSub}>{t('pw_plan_yearly_billed')}</Text>
                  </View>
                  <View style={styles.savingBadge}>
                    <Text style={styles.savingBadgeText}>{t('pw_save_badge')}</Text>
                  </View>
                </View>
              </View>
            </Pressable>

            <View style={{ height: spacing.sm }} />

            <Pressable onPress={() => pickPlan('monthly')} accessibilityRole="button" accessibilityLabel={t('pw_plan_monthly')}>
              <View style={[styles.planMonthly, plan === 'monthly' && styles.planMonthlyActive]}>
                <View style={styles.planRow}>
                  <View style={styles.planRadio}>
                    {plan === 'monthly' && <View style={styles.planRadioDot} />}
                  </View>
                  <View style={styles.planMain}>
                    <Text style={[styles.planTitle, styles.planTitleMonthly]}>{t('pw_plan_monthly')}</Text>
                    <Text style={styles.planSub}>{t('pw_plan_monthly_billed')}</Text>
                  </View>
                </View>
              </View>
            </Pressable>

            <View style={{ height: spacing.sm }} />

            <Pressable onPress={() => pickPlan('weekly')} accessibilityRole="button" accessibilityLabel={t('pw_plan_weekly')}>
              <View style={[styles.planMonthly, plan === 'weekly' && styles.planMonthlyActive]}>
                <View style={styles.planRow}>
                  <View style={styles.planRadio}>
                    {plan === 'weekly' && <View style={styles.planRadioDot} />}
                  </View>
                  <View style={styles.planMain}>
                    <Text style={[styles.planTitle, styles.planTitleMonthly]}>{t('pw_plan_weekly')}</Text>
                    <Text style={styles.planSub}>{t('pw_plan_weekly_billed')}</Text>
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
              <Text style={styles.trustText}>{t('pw_trust_rating')}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.autoRenewBlock, contentStyle]}>
            <Text style={styles.autoRenewText}>{t('pw_auto_renew_disclosure')}</Text>
          </Animated.View>

          <Animated.View style={[styles.legalRow, contentStyle]}>
            <Pressable
              hitSlop={10}
              onPress={restore}
              accessibilityRole="button"
              accessibilityLabel={t('common_restore_purchase')}
            >
              <Text style={styles.legalLink}>{t('common_restore_purchase')}</Text>
            </Pressable>
            <View style={styles.legalDotDivider} />
            <Pressable
              hitSlop={10}
              onPress={() => {
                Haptics.selectionAsync();
                Linking.openURL(LEGAL_URLS.terms);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('common_terms_of_service')}
            >
              <Text style={styles.legalLink}>{t('common_terms')}</Text>
            </Pressable>
            <View style={styles.legalDotDivider} />
            <Pressable
              hitSlop={10}
              onPress={() => {
                Haptics.selectionAsync();
                Linking.openURL(LEGAL_URLS.privacy);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('common_privacy_policy')}
            >
              <Text style={styles.legalLink}>{t('common_privacy')}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[styles.ctaFloating, ctaStyle, { paddingBottom: insets.bottom + spacing.md }]}
          pointerEvents="box-none"
        >
          {/* Top fade so scrollable content blends into the CTA bg.
              Kept to 56pt so plan cards stay readable at initial scroll. */}
          <LinearGradient
            colors={[
              'rgba(251,249,245,0)',
              'rgba(251,249,245,1)',
            ]}
            style={styles.ctaFade}
            pointerEvents="none"
          />
          <View style={styles.ctaBgSolid} pointerEvents="none" />
          <PillCTA variant="primary" size="lg" breath onPress={begin} disabled={busy}>
            {busy ? t('common_loading') : t('pw_cta')}
          </PillCTA>
          <View style={{ height: spacing.xs }} />
          <Text style={styles.afterText}>
            {plan === 'yearly'
              ? t('pw_cta_sub')
              : plan === 'monthly'
                ? t('pw_cta_sub_monthly')
                : t('pw_cta_sub_weekly')}
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
  autoRenewBlock: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  autoRenewText: {
    ...typeScale.bodySm,
    fontSize: 11,
    lineHeight: 15,
    color: colors.inkSubtle,
    textAlign: 'center',
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
  ctaFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 56,
  },
  ctaBgSolid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56,
    bottom: 0,
    backgroundColor: 'rgb(251,249,245)',
  },
  afterText: {
    ...typeScale.bodySm,
    color: colors.inkSubtle,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
