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
  ToggleSwitch,
} from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [marketing, setMarketing] = useState(true);

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
  };
  const create = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/main/home');
  };
  const signIn = () => {
    Haptics.selectionAsync();
    router.replace('/auth/sign-in');
  };

  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = email.length > 3 && password.length >= 6 && confirm === password;

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

          <PillCTA variant="primary" size="lg" breath={canSubmit} disabled={!canSubmit} onPress={create}>
            Create account
          </PillCTA>

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
});
