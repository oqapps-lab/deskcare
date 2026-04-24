import React from 'react';
import { StyleSheet, View, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Layout } from '@/constants/tokens';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Skip horizontal padding — for full-bleed screens like Exercise Player */
  noPadding?: boolean;
  /** Use canvas background (default) or transparent */
  background?: 'canvas' | 'transparent';
}

export function Screen({
  children,
  style,
  noPadding = false,
  background = 'canvas',
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        background === 'canvas' && styles.canvas,
        style,
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.canvas} />
      <View style={[styles.content, !noPadding && styles.padded]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  canvas: {
    backgroundColor: Colors.canvas,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Layout.screenPadding,
  },
});
