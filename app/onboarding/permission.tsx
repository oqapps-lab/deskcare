import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { BrandMark } from '../../components/ui/BrandMark';
import { BulletRow } from '../../components/ui/BulletRow';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassIconChip } from '../../components/ui/GlassIconChip';
import { PillCTA } from '../../components/ui/PillCTA';
import { colors, spacing, typeScale } from '../../constants/tokens';

export default function PermissionPromptScreen() {
  const insets = useSafeAreaInsets();

  const handleEnable = () => {
    // TODO: wire expo-notifications
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleLater = () => {
    Haptics.selectionAsync();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <AtmosphericBackground>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xxl,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xxl,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <BrandMark />
        </View>
        <View style={styles.iconCluster}>
          <GlassIconChip icon="bell" size={96} iconSize={42} glow />
        </View>
        <Text style={styles.title}>Мы поможем{'\n'}не забыть</Text>
        <View style={styles.cardWrap}>
          <GlassCard radius="xl" padding={spacing.xxl}>
            <BulletRow>87% людей занимаются регулярно с напоминаниями</BulletRow>
            <BulletRow>Не пропустите ни одной разминки в течение дня</BulletRow>
            <BulletRow>Оставайтесь последовательными в своих целях</BulletRow>
          </GlassCard>
        </View>
        <View style={styles.spacer} />
        <View style={styles.ctaCluster}>
          <Pressable onPress={handleLater} hitSlop={12} accessibilityRole="button">
            <Text style={styles.later}>Позже</Text>
          </Pressable>
          <View style={{ height: spacing.md }} />
          <PillCTA onPress={handleEnable} size="lg">
            Включить напоминания
          </PillCTA>
        </View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCluster: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    ...typeScale.headline,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  cardWrap: {
    marginBottom: spacing.lg,
  },
  spacer: {
    flexGrow: 1,
  },
  ctaCluster: {
    alignItems: 'center',
  },
  later: {
    ...typeScale.body,
    color: colors.inkSubtle,
  },
});
