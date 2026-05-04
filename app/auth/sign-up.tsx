import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  NavHeader,
  PillCTA,
  ToggleSwitch,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useAuth } from '../../hooks/useAuth';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [marketing, setMarketing] = useState(true);
  const {
    signUp: doSignUp,
    signInWithApple,
    signInWithGoogle,
    loading,
    error,
  } = useAuth();

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const create = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const r = await doSignUp(email, password);
    if (r.ok) router.replace('/onboarding/welcome');
  };
  const signIn = () => {
    Haptics.selectionAsync();
    router.replace('/auth/sign-in');
  };
  const apple = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const r = await signInWithApple();
    if (r.ok) router.replace('/onboarding/welcome');
    else if (!r.cancelled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };
  const google = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const r = await signInWithGoogle();
    if (r.ok) router.replace('/onboarding/welcome');
    else if (!r.cancelled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = email.length > 3 && password.length >= 6 && confirm === password && !loading;

  return (
    <AtmosphericBackground>
      <BgPattern variant="dots" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="coral" size={240} opacity={0.20} />

      <NavHeader onBack={back} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: spacing.lg,
            paddingBottom: insets.bottom + spacing.xxxl,
            paddingHorizontal: spacing.xxl,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Eyebrow variant="accent">CREATE AN ACCOUNT</Eyebrow>
          <Text style={styles.title}>Save your plan{'\n'}across devices.</Text>
          <Text style={styles.sub}>Your streak, pain history, and unlocked programs stay with you.</Text>

          <View style={styles.form}>
            <Label>EMAIL</Label>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.inkSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
            />

            <View style={{ height: spacing.md }} />
            <Label>PASSWORD</Label>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="6+ characters"
              placeholderTextColor={colors.inkSubtle}
              secureTextEntry
              autoCapitalize="none"
              style={styles.input}
            />

            <View style={{ height: spacing.md }} />
            <Label>CONFIRM PASSWORD</Label>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Match the password above"
              placeholderTextColor={colors.inkSubtle}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, mismatch && styles.inputError]}
            />
            {mismatch && <Text style={styles.errorText}>Passwords don't match yet.</Text>}
          </View>

          <View style={styles.marketingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.marketingTitle}>Gentle updates</Text>
              <Text style={styles.marketingSub}>Research recaps and new routines — weekly, never daily.</Text>
            </View>
            <ToggleSwitch value={marketing} onChange={setMarketing} />
          </View>

          <View style={{ height: spacing.xl }} />

          <PillCTA
            variant="primary"
            size="lg"
            breath={canSubmit}
            disabled={!canSubmit}
            loading={loading}
            onPress={create}
          >
            Create account
          </PillCTA>
          {error && <Text style={styles.authError}>{error}</Text>}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {Platform.OS === 'ios' && (
            <>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={999}
                style={styles.appleBtn}
                onPress={apple}
              />
              <View style={{ height: spacing.sm }} />
            </>
          )}

          <Pressable onPress={google} style={({ pressed }) => [styles.oauthBtn, pressed && styles.pressed]}>
            <GoogleGlyph />
            <Text style={styles.oauthLabel}>Sign up with Google</Text>
          </Pressable>

          <Text style={styles.legal}>
            By continuing you accept the <Text style={styles.legalAccent}>Terms</Text> and{' '}
            <Text style={styles.legalAccent}>Privacy Policy</Text>.
          </Text>

          <Pressable onPress={signIn} hitSlop={10} style={styles.switchRow}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AtmosphericBackground>
  );
}

const Label: React.FC<{ children: string }> = ({ children }) => (
  <Text style={styles.label}>{children}</Text>
);

const GoogleGlyph = () => (
  <Svg width={18} height={18} viewBox="0 0 18 18">
    <Path d="M9 8 L9 11 L13.4 11 Q13 12.5 12 13.5 Q11 14.5 9 14.5 Q6 14.5 4.5 12 Q3 9 4.5 6 Q6 3.5 9 3.5 Q10.5 3.5 12 4.5 L14 2.5 Q12 1 9 1 Q5 1 2.5 4 Q0 7 2 11 Q4 15 9 15 Q12 15 14 13 Q16 11 16 8 L9 8 Z" fill={colors.primaryMid} />
  </Svg>
);

const styles = StyleSheet.create({
  title: {
    ...typeScale.headline,
    color: colors.ink,
    marginTop: spacing.sm,
  },
  sub: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.xs,
  },
  label: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typeScale.body,
    color: colors.ink,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    ...typeScale.bodySm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  marketingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  marketingTitle: {
    ...typeScale.titleLg,
    color: colors.ink,
  },
  marketingSub: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    marginTop: 2,
  },
  legal: {
    ...typeScale.bodySm,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  legalAccent: {
    color: colors.primaryMid,
  },
  switchRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  switchText: {
    ...typeScale.body,
    color: colors.inkMuted,
  },
  switchAccent: {
    color: colors.primaryMid,
    fontFamily: typeScale.title.fontFamily,
  },
  authError: {
    ...typeScale.bodySm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.inkHairline,
  },
  dividerText: {
    ...typeScale.labelSm,
    color: colors.inkSubtle,
    textTransform: 'uppercase',
  },
  appleBtn: {
    width: '100%',
    height: 48,
  },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: 999,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  oauthLabel: {
    ...typeScale.title,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.82,
  },
});
