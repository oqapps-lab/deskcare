import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground, BgPattern, NavHeader } from '../../components/ui';
import { colors, spacing, typeScale } from '../../constants/tokens';
import { PRIVACY_BLOCKS, TERMS_BLOCKS, type LegalBlock } from '../../lib/legalContent';

/**
 * In-app legal viewer (Privacy / Terms). Renders bundled text NATIVELY so the
 * user never leaves DeskCare for an external website (tester 2026-06-02:
 * "legal must stay inside the app, don't kick me out to a site"). Routed via
 * `/legal/privacy` and `/legal/terms` — replaces the old Linking.openURL.
 */
export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const isPrivacy = doc !== 'terms';
  const blocks: LegalBlock[] = isPrivacy ? PRIVACY_BLOCKS : TERMS_BLOCKS;
  const headerTitle = isPrivacy ? 'Privacy Policy' : 'Terms of Use';

  const back = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/main/home');
  };

  return (
    <AtmosphericBackground>
      <BgPattern variant="waves" opacity={0.04} tone="coral" />
      <NavHeader title={headerTitle} onBack={back} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.xxxl,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {blocks.map((b, i) => {
          if (b.k === 'title') return null; // header already shows the title
          if (b.k === 'h') return <Text key={i} style={styles.h}>{b.t}</Text>;
          if (b.k === 'li') {
            return (
              <View key={i} style={styles.liRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.li}>{b.t}</Text>
              </View>
            );
          }
          return <Text key={i} style={styles.p}>{b.t}</Text>;
        })}
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  h: {
    ...typeScale.titleLg,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  p: {
    ...typeScale.body,
    color: colors.inkMuted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  liRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingRight: spacing.md,
  },
  bullet: {
    ...typeScale.body,
    color: colors.primaryMid,
    lineHeight: 22,
  },
  li: {
    ...typeScale.body,
    color: colors.inkMuted,
    flex: 1,
    minWidth: 0,
    lineHeight: 22,
  },
});
