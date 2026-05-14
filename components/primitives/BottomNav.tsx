import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
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

const WEB_BLUR = Platform.OS === 'web'
  ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any)
  : {};

export function BottomNav({ tabs, activeTab, onTabPress, style }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  function handlePress(id: TabId) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onTabPress(id);
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, Spacing.sm) + Spacing.sm }]}>
      <View style={[styles.island, WEB_BLUR, style]}>
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
                    color={Colors.primaryLight}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
  },

  island: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 32,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    gap: Spacing.xs,
    shadowColor: '#2271B3',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
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
    backgroundColor: 'rgba(34, 113, 179, 0.12)',
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: 'rgba(34, 113, 179, 0.30)',
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
  pressed: { opacity: 0.7 },
});
