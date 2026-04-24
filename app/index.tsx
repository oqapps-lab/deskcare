/**
 * Welcome Screen (ONB-02)
 * Source of truth: WIREFRAMES.md §1, USER-FLOWS.md Flow 1
 *
 * Stitch vs UX conflicts resolved:
 * - Copy: Stitch "Precision recovery for the high-performance body" →
 *   UX "2 минуты в день — шея перестанет болеть" (direct pain relief value prop)
 * - CTA: UX "Начать" (not "Next →")
 * - Added "Уже есть аккаунт? Войти" link per wireframe
 */
import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { PillCTA, Text, Divider } from '@/components/primitives';
import { Colors, Spacing, Radii } from '@/constants/tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero illustration placeholder */}
        <View style={styles.heroWrap}>
          <View style={styles.heroCircle}>
            <Ionicons name="body-outline" size={80} color={Colors.primary} />
          </View>
        </View>

        <Divider size="xl" />

        {/* Headline */}
        <Text variant="h1" center style={styles.headline}>
          2 минуты в день —{'\n'}шея перестанет болеть
        </Text>

        <Divider size="md" />

        {/* Sub-headline */}
        <Text variant="body" center color={Colors.onSurfaceVar} style={styles.sub}>
          Микро-растяжки прямо за рабочим столом.{'\n'}Без коврика. Без переодевания.
        </Text>

        <Divider size="xxxl" />

        {/* Primary CTA */}
        <PillCTA
          label="Начать"
          onPress={() => router.push('/home')}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />}
          style={styles.cta}
        />

        <Divider size="lg" />

        {/* Secondary link */}
        <Pressable
          onPress={() => { /* TODO: Sign In */ }}
          accessibilityRole="link"
          accessibilityLabel="Уже есть аккаунт? Войти"
          style={styles.signInRow}
        >
          <Text variant="bodyMd" color={Colors.onSurfaceVar}>
            Уже есть аккаунт?{' '}
          </Text>
          <Text variant="bodyMd" color={Colors.primary}>
            Войти
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  heroWrap: {
    alignItems: 'center',
  },
  heroCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    lineHeight: 40,
  },
  sub: {
    lineHeight: 24,
  },
  cta: {
    alignSelf: 'stretch',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
});
