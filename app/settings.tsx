import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, StatusBar, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Card, Text, Divider, Toggle } from '@/components/primitives';
import { Colors, Layout, Spacing, Radii } from '@/constants/tokens';
import { mockSettings } from '@/mock/data';

function SectionTitle({ children }: { children: string }) {
  return (
    <>
      <Text variant="h3" color={Colors.onSurface}>{children}</Text>
      <Divider size="md" />
    </>
  );
}

function DropdownRow({ label, description, value }: { label: string; description: string; value: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.dropdownRow, pressed && styles.pressed]}
    >
      <View style={styles.dropdownText}>
        <Text variant="body" color={Colors.onSurface}>{label}</Text>
        <Text variant="caption" color={Colors.onSurfaceVar}>{description}</Text>
      </View>
      <View style={styles.dropdownValue}>
        <Text variant="bodyMd" color={Colors.primary}>{value}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.primary} />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reminderFreq]   = useState(mockSettings.reminderFrequency);
  const [targetDuration] = useState(mockSettings.targetDuration);
  const [upperBody,  setUpperBody]  = useState(mockSettings.focusUpperBody);
  const [lowerBody,  setLowerBody]  = useState(mockSettings.focusLowerBody);
  const [haptics,    setHaptics]    = useState(mockSettings.hapticFeedback);
  const [ambient,    setAmbient]    = useState(mockSettings.ambientSounds);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Назад">
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </Pressable>
        <Text variant="h3" style={styles.topTitle}>DeskCare</Text>
        <View style={styles.avatarSmall}>
          <Ionicons name="person" size={16} color={Colors.primary} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.xl) + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Settings</Text>
        <Text variant="bodyMd" color={Colors.onSurfaceVar}>
          Manage your session preferences and notifications.
        </Text>

        <Divider size="xl" />

        {/* Timers & Reminders */}
        <SectionTitle>Timers & Reminders</SectionTitle>
        <Card elevated>
          <DropdownRow
            label="Reminder Frequency"
            description="How often to remind you to stretch"
            value={reminderFreq}
          />
          <View style={styles.cardDivider} />
          <DropdownRow
            label="Target Duration"
            description="Length of stretch sessions"
            value={targetDuration}
          />
        </Card>

        <Divider size="xl" />

        {/* Focus Zones */}
        <SectionTitle>Focus Zones</SectionTitle>
        <Text variant="bodyMd" color={Colors.onSurfaceVar} style={styles.sectionSub}>
          Select areas to prioritize in routines.
        </Text>
        <Divider size="md" />
        <Card elevated>
          <View style={styles.zoneRow}>
            <View style={styles.zoneIcon}>
              <Ionicons name="body-outline" size={20} color={Colors.onSurfaceVar} />
            </View>
            <Toggle
              label="Upper Body"
              value={upperBody}
              onValueChange={setUpperBody}
              style={styles.toggle}
            />
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.zoneRow}>
            <View style={styles.zoneIcon}>
              <Ionicons name="accessibility-outline" size={20} color={Colors.onSurfaceVar} />
            </View>
            <Toggle
              label="Lower Body"
              value={lowerBody}
              onValueChange={setLowerBody}
              style={styles.toggle}
            />
          </View>
        </Card>

        <Divider size="xl" />

        {/* Experience */}
        <SectionTitle>Experience</SectionTitle>
        <Card elevated>
          <Toggle
            label="Haptic Feedback"
            description="Vibrate on routine completion"
            value={haptics}
            onValueChange={setHaptics}
          />
          <View style={styles.cardDivider} />
          <Toggle
            label="Ambient Sounds"
            description="Play calming audio during focus"
            value={ambient}
            onValueChange={setAmbient}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.canvas },
  scroll: { paddingHorizontal: Layout.screenPadding },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, textAlign: 'center' },
  avatarSmall: {
    width: 36, height: 36, borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },

  pageTitle: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 36,
    lineHeight: 44,
    color: Colors.onSurface,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  sectionSub: { marginTop: -Spacing.xs },

  cardDivider: {
    height: 1,
    backgroundColor: Colors.surfaceLow,
    marginVertical: Spacing.sm,
  },

  dropdownRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.sm, gap: Spacing.md,
    minHeight: 48,
  },
  dropdownText:  { flex: 1, gap: 2 },
  dropdownValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  zoneRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  zoneIcon: {
    width: 40, height: 40, borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  toggle: { flex: 1 },

  pressed: { opacity: 0.78 },
});
