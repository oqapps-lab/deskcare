import React, { useState } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Text, PillCTA, Divider } from '@/components/primitives';
import { Colors, Spacing, Radii, Layout } from '@/constants/tokens';

interface QuizOption {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: QuizOption[] = [
  { id: 'neck',   title: 'Neck & Shoulders', subtitle: 'Tension & stiffness', icon: 'body-outline' },
  { id: 'back',   title: 'Lower Back',       subtitle: 'Posture & pain',      icon: 'accessibility-outline' },
  { id: 'eyes',   title: 'Eyes & Head',      subtitle: 'Fatigue & focus',     icon: 'eye-outline' },
  { id: 'wrists', title: 'Wrists & Hands',   subtitle: 'Strain & dexterity',  icon: 'hand-left-outline' },
];

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set(['neck']));

  function toggle(id: string) {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Progress dots */}
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>
          Which area needs{'\n'}attention most?
        </Text>
        <Divider size="xxxl" />

        {OPTIONS.map(opt => {
          const active = selected.has(opt.id);
          return (
            <Pressable
              key={opt.id}
              onPress={() => toggle(opt.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={opt.title}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.pressed,
              ]}
            >
              {active && <View style={styles.activeBorder} />}
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={active ? Colors.primary : Colors.onSurfaceVar}
                />
              </View>
              <View style={styles.cardText}>
                <Text variant="h3" color={Colors.onSurface}>{opt.title}</Text>
                <Text variant="bodyMd" color={Colors.onSurfaceVar}>{opt.subtitle}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
        <PillCTA
          label="This is my focus"
          onPress={() => router.push('/home')}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />}
          direction="diagonal"
          disabled={selected.size === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: Colors.canvas },
  scroll:{ paddingHorizontal: Layout.screenPadding },

  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceHighest,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },

  question: {
    fontFamily: 'CormorantGaramond-SemiBold',
    fontSize: 34,
    lineHeight: 44,
    color: Colors.onSurface,
    letterSpacing: 0.1,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardActive: {
    backgroundColor: Colors.surfaceLow,
  },
  activeBorder: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: Radii.lg,
    borderBottomLeftRadius: Radii.lg,
  },
  iconWrap: {
    width: 44, height: 44,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: `${Colors.primary}18`,
  },
  cardText: { flex: 1, gap: 2 },

  ctaWrap: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    backgroundColor: Colors.canvas,
  },
  pressed: { opacity: 0.78 },
});
