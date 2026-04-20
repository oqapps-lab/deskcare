import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../components/ui/AtmosphericBackground';
import { NavHeader } from '../components/ui/NavHeader';
import { PulseRings } from '../components/ui/PulseRings';
import { colors, spacing, typeScale } from '../constants/tokens';

export default function SyncScreen() {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <AtmosphericBackground>
      <NavHeader title="Синхронизация" onBack={goBack} />
      <View
        style={[
          styles.root,
          {
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
      >
        <View style={styles.ringsCluster}>
          <PulseRings size={260} rings={4} />
        </View>
        <Text style={styles.title}>Синхронизация данных…</Text>
        <Text style={styles.subtitle}>
          Пожалуйста, подождите. Мы обновляем{'\n'}вашу информацию.
        </Text>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  ringsCluster: {
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    ...typeScale.body,
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
