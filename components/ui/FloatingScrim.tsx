import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Soft fade-mask behind a floating bottom CTA.
 *
 * Drop into the absolute floating-CTA container *as the first child* so it sits
 * underneath the pill but above the scroll content. Eliminates the harsh white
 * rectangle that a flat backgroundColor would create — the fade goes from
 * fully transparent at the top edge to solid canvas at the bottom, so scroll
 * content dissolves into the CTA area instead of being visibly cut.
 *
 * Tone: 5-stop gradient that lifts from 0% at top → 0.55 → 0.85 → 0.97 → 1.
 * The non-linear curve hides the gradient itself; users only see "the page
 * gets quieter near the CTA". Pure cosmetic, no interactivity.
 */
export const FloatingScrim: React.FC = () => (
  <LinearGradient
    pointerEvents="none"
    colors={[
      'rgba(251,249,245,0)',
      'rgba(251,249,245,0.55)',
      'rgba(251,249,245,0.85)',
      'rgba(251,249,245,0.97)',
      'rgba(251,249,245,1)',
    ]}
    locations={[0, 0.35, 0.6, 0.82, 1]}
    style={StyleSheet.absoluteFill}
  />
);
