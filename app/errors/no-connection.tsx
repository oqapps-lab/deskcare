import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { ClayIllustration } from '../../components/ui/ClayIllustration';
import { PillCTA } from '../../components/ui/PillCTA';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function NoConnectionScreen() {
  const insets = useSafeAreaInsets();

  const retry = () => {
    // TODO: wire actual retry logic
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <AtmosphericBackground>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.huge,
            paddingBottom: insets.bottom + spacing.huge,
          },
        ]}
      >
        <View style={styles.illoCluster}>
          <ClayIllustration name="wifi-cloud" size={200} />
        </View>
        <Text style={styles.title}>Нет подключения</Text>
        <Text style={styles.subtitle}>
          Кэшированные упражнения{'\n'}доступны оффлайн
        </Text>
        <View style={{ flex: 1 }} />
        <View style={styles.ctaCluster}>
          <PillCTA variant="outlined" icon="refresh" onPress={retry} size="lg">
            Попробовать снова
          </PillCTA>
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
  },
  illoCluster: {
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
  ctaCluster: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});
