import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { NavHeader } from '../../components/ui/NavHeader';
import { BodyPainMap, PainZone } from '../../components/ui/BodyPainMap';
import { GlassCard } from '../../components/ui/GlassCard';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { PillChip } from '../../components/ui/PillChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { SeveritySlider } from '../../components/ui/SeveritySlider';
import { colors, spacing, typeScale } from '../../constants/tokens';

type SeverityLevel = 'mild' | 'moderate' | 'severe';

export default function PainCheckInScreen() {
  const insets = useSafeAreaInsets();
  const [zones] = useState<PainZone[]>(['neck', 'chest']);
  const [severityPct, setSeverityPct] = useState(0.4);
  const [level, setLevel] = useState<SeverityLevel>('moderate');

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const save = () => {
    goBack();
  };

  return (
    <AtmosphericBackground>
      <NavHeader onBack={goBack} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.huge + 60,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Где именно болит?</Text>

        <View style={styles.mapWrap}>
          <BodyPainMap painZones={zones} width={240} height={320} />
        </View>

        <View style={{ height: spacing.lg }} />

        <GlassCard radius="xl" padding={spacing.xl}>
          <Eyebrow>Severity</Eyebrow>
          <View style={{ height: spacing.md }} />
          <SeveritySlider value={severityPct} onChange={setSeverityPct} />
        </GlassCard>

        <View style={{ height: spacing.lg }} />

        <View style={styles.chipColumn}>
          <PillChip active={level === 'mild'} onPress={() => setLevel('mild')}>
            Лёгкий дискомфорт
          </PillChip>
          <PillChip
            active={level === 'moderate'}
            icon={level === 'moderate' ? 'check' : undefined}
            onPress={() => setLevel('moderate')}
          >
            Умеренная боль
          </PillChip>
          <PillChip active={level === 'severe'} onPress={() => setLevel('severe')}>
            Сильная боль
          </PillChip>
        </View>
      </ScrollView>

      <View style={[styles.floatingCta, { bottom: insets.bottom + spacing.lg }]}>
        <PillCTA onPress={save} size="lg">
          Сохранить
        </PillCTA>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  mapWrap: {
    alignItems: 'center',
  },
  chipColumn: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
  floatingCta: {
    position: 'absolute',
    left: spacing.xxl,
    right: spacing.xxl,
  },
});
