import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { NavHeader } from '../../components/ui/NavHeader';
import { HeroNumber } from '../../components/ui/HeroNumber';
import { GlassIconChip } from '../../components/ui/GlassIconChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { ProgressDots } from '../../components/ui/ProgressDots';
import { Glyph } from '../../components/ui/Glyph';
import { colors, spacing, typeScale } from '../../constants/tokens';

const DURATION_SEC = 20;

export default function EyeSessionScreen() {
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(18);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setElapsed((e) => (e + 1 > DURATION_SEC ? DURATION_SEC : e + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <AtmosphericBackground>
      <NavHeader
        title="Упражнение для глаз"
        onBack={goBack}
        rightIcon="settings"
        onRightPress={() => {}}
      />
      <View
        style={[
          styles.root,
          { paddingBottom: insets.bottom + spacing.xl, paddingTop: spacing.md },
        ]}
      >
        <View style={styles.timerCluster}>
          <HeroNumber size="lg">{`${mm}:${ss}`}</HeroNumber>
        </View>

        <View style={styles.iconCluster}>
          <GlassIconChip icon="infinity" size={200} iconSize={88} glow />
        </View>

        <Text style={styles.hint}>Посмотрите на{'\n'}дальний объект</Text>

        <View style={styles.dotsCluster}>
          <ProgressDots count={5} active={1} />
        </View>

        <View style={styles.transportRow}>
          <View style={styles.sideBtn}>
            <Glyph name="skip-back" size={22} color={colors.inkMuted} />
          </View>
          <PillCTA
            variant="iconOnly"
            size="xl"
            icon={paused ? 'play' : 'pause'}
            onPress={() => setPaused((p) => !p)}
            accessibilityLabel={paused ? 'Продолжить' : 'Пауза'}
          />
          <View style={styles.sideBtn}>
            <Glyph name="refresh" size={22} color={colors.inkMuted} />
          </View>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerCluster: {
    marginTop: spacing.lg,
  },
  iconCluster: {
    marginVertical: spacing.xxl,
  },
  hint: {
    ...typeScale.headlineSm,
    color: colors.ink,
    textAlign: 'center',
  },
  dotsCluster: {
    marginTop: spacing.xl,
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
    marginTop: spacing.xxl,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9D431A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
});
