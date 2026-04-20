import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { NavHeader } from '../../components/ui/NavHeader';
import { HeroNumber } from '../../components/ui/HeroNumber';
import { GlassIconChip } from '../../components/ui/GlassIconChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { ProgressDots } from '../../components/ui/ProgressDots';
import { Glyph } from '../../components/ui/Glyph';
import { colors, shadows, spacing, typeScale } from '../../constants/tokens';

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
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setElapsed((e) => Math.max(0, e - 10));
            }}
            accessibilityRole="button"
            accessibilityLabel="Назад на 10 секунд"
            style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]}
          >
            <Glyph name="skip-back" size={22} color={colors.inkMuted} />
          </Pressable>
          <PillCTA
            variant="iconOnly"
            size="xl"
            icon={paused ? 'play' : 'pause'}
            onPress={() => setPaused((p) => !p)}
            accessibilityLabel={paused ? 'Продолжить' : 'Пауза'}
          />
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setElapsed(0);
              setPaused(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Начать заново"
            style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]}
          >
            <Glyph name="refresh" size={22} color={colors.inkMuted} />
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
    ...shadows.soft,
  },
  sideBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.96 }],
  },
});
