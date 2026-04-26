import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AtmosphericBackground,
  BgPattern,
  DecorativeArc,
  Eyebrow,
  NavHeader,
  PillCTA,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { useAuth } from '../../hooks/useAuth';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { signIn: doSignIn, loading, error } = useAuth();

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const signIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const r = await doSignIn(email, password);
    if (r.ok) router.replace('/main/home');
  };
  const signUp = () => {
    Haptics.selectionAsync();
    router.replace('/auth/sign-up');
  };
  const apple = () => {
    // Apple/Google OAuth wired in Stage 6.5 — for now show a friendly stub.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const canSubmit = email.length > 3 && password.length >= 6 && !loading;

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.04} tone="coral" />
      <DecorativeArc position="top-right" tone="peach" size={240} opacity={0.20} />

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
          <Eyebrow variant="accent">WELCOME BACK</Eyebrow>
          <Text style={styles.title}>Good to see you{'\n'}again.</Text>
          <Text style={styles.sub}>Your plan, streak, and pain history — right where you left them.</Text>

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
            <View style={styles.pwRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="6+ characters"
                placeholderTextColor={colors.inkSubtle}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoComplete="password"
                style={[styles.input, { flex: 1 }]}
              />
              <Pressable hitSlop={10} onPress={() => setShowPw((s) => !s)} style={styles.pwToggle}>
                <Text style={styles.pwToggleText}>{showPw ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>

            <Pressable hitSlop={10} style={styles.forgot} onPress={() => Haptics.selectionAsync()}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>
          </View>

          <View style={{ height: spacing.xl }} />

          <PillCTA
            variant="primary"
            size="lg"
            breath={canSubmit}
            disabled={!canSubmit}
            loading={loading}
            onPress={signIn}
          >
            Sign in
          </PillCTA>
          {error && <Text style={styles.authError}>{error}</Text>}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable onPress={apple} style={({ pressed }) => [styles.oauthBtn, pressed && styles.pressed]}>
            <AppleGlyph />
            <Text style={styles.oauthLabel}>Continue with Apple</Text>
          </Pressable>

          <View style={{ height: spacing.sm }} />

          <Pressable onPress={apple} style={({ pressed }) => [styles.oauthBtn, pressed && styles.pressed]}>
            <GoogleGlyph />
            <Text style={styles.oauthLabel}>Continue with Google</Text>
          </Pressable>

          <Pressable onPress={signUp} hitSlop={10} style={styles.switchRow}>
            <Text style={styles.switchText}>
              New here? <Text style={styles.switchAccent}>Create an account</Text>
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

const AppleGlyph = () => (
  <Svg width={16} height={18} viewBox="0 0 16 18">
    <Path d="M12 5 Q10 3 8 3 Q6 3 4 5 Q2 8 3 13 Q4 16 6 16 Q7 16 8 15 Q9 16 10 16 Q12 16 13 13 Q14 10 12 5 Z M8 3 Q9 2 10 1" fill={colors.ink} />
  </Svg>
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
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pwToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pwToggleText: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  forgotText: {
    ...typeScale.bodySm,
    color: colors.primaryMid,
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
});
