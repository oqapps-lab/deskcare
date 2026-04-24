import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Layout, Radii, Spacing, Typography } from '@/constants/tokens';
import { Text } from './Text';

export type TabId = 'home' | 'library' | 'programs' | 'profile';

export interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  tabs: TabItem[];
  activeTab: TabId;
  onTabPress: (id: TabId) => void;
  style?: ViewStyle;
}

export function BottomNav({ tabs, activeTab, onTabPress, style }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  function handlePress(id: TabId) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(id);
  }

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, Spacing.md) },
        style,
      ]}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.tab,
              pressed && styles.pressed,
            ]}
          >
            {isActive ? (
              <View style={styles.activePill}>
                <View style={styles.icon}>{tab.icon}</View>
                <Text
                  variant="label"
                  upper
                  color={Colors.onPrimary}
                  style={styles.activeLabel}
                >
                  {tab.label}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.icon}>{tab.icon}</View>
                <Text
                  variant="caption"
                  color={Colors.onSurfaceVar}
                  upper
                  style={styles.inactiveLabel}
                >
                  {tab.label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 0,
    gap: Spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Layout.minTouchTarget,
    gap: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.xs,
  },
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: Typography.label.fontSize,
    letterSpacing: 0.4,
  },
  inactiveLabel: {
    fontSize: 10,
    letterSpacing: 0.4,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
