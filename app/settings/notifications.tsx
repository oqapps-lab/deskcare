import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AtmosphericBackground } from '../../components/ui/AtmosphericBackground';
import { NavHeader } from '../../components/ui/NavHeader';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { PillChip } from '../../components/ui/PillChip';
import { SettingsRow } from '../../components/ui/SettingsRow';
import { spacing } from '../../constants/tokens';

const TIMES = ['9:00', '12:00', '15:00', '18:00'];

export default function NotificationSettings() {
  const insets = useSafeAreaInsets();
  const [activeTime, setActiveTime] = useState('15:00');
  const [eyeTimer, setEyeTimer] = useState(true);
  const [sound, setSound] = useState(true);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <AtmosphericBackground>
      <NavHeader title="Настройки и напоминания" onBack={goBack} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.huge,
          paddingHorizontal: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.eyebrowRow}>
          <Eyebrow>Напоминания</Eyebrow>
        </View>

        <View style={styles.chipRow}>
          {TIMES.map((t) => (
            <PillChip
              key={t}
              active={t === activeTime}
              onPress={() => setActiveTime(t)}
            >
              {t}
            </PillChip>
          ))}
        </View>

        <View style={styles.listGap}>
          <SettingsRow
            icon="eye"
            title="20-20-20 таймер для глаз"
            right={{ type: 'toggle', value: eyeTimer, onChange: setEyeTimer }}
          />
          <SettingsRow
            icon="speaker"
            title="Звук уведомлений"
            right={{ type: 'toggle', value: sound, onChange: setSound }}
          />
          <SettingsRow
            icon="crown"
            title="Управление подпиской"
            right={{ type: 'chevron', badge: 'PREMIUM', onPress: () => {} }}
          />
        </View>
      </ScrollView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  eyebrowRow: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xxxl,
  },
  listGap: {
    gap: spacing.md,
  },
});
