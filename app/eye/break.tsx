import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { HeroNumber } from '../../components/ui/HeroNumber';
import { PillCTA } from '../../components/ui/PillCTA';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function EyeBreakScreen() {
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('/eye/session');
  };

  const handleSkip = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <AtmosphericBackground>
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {/* top spacer — hero placed slightly above optical centre */}
        <View style={styles.topCluster}>
          <HeroNumber ghost halo>
            30
          </HeroNumber>
          <View style={{ marginTop: -spacing.sm }}>
            <Eyebrow variant="accent" size="md">
              СЕК
            </Eyebrow>
          </View>
        </View>
        <View style={styles.midCluster}>
          <Text style={styles.title}>Отдохните{'\n'}от экрана</Text>
        </View>
        <View style={styles.ctaCluster}>
          <PillCTA
            variant="iconOnly"
            size="xl"
            icon="play"
            onPress={handleStart}
            accessibilityLabel="Начать отдых"
          />
        </View>
        <View style={styles.bottomRow}>
          <View />
          <Pressable
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Пропустить"
            hitSlop={12}
          >
            <Text style={styles.skip}>SKIP</Text>
          </Pressable>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'space-between',
  },
  topCluster: {
    marginTop: spacing.huge,
    alignItems: 'center',
  },
  midCluster: {
    alignItems: 'center',
  },
  ctaCluster: {
    alignItems: 'center',
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  skip: {
    ...typeScale.label,
    color: colors.primaryMid,
  },
});
