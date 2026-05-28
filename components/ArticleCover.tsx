import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '../constants/tokens';

/**
 * Programmatic article cover — replaces the broken `cover_image_url` CDN
 * placeholders with a stylised illustration matching the app's design
 * language. Picks a palette + motif from the article's first tag so each
 * topic family reads visually distinct: neck/posture = coral, eyes = lavender,
 * wrists/carpal = mint, sciatica = peach, generic = cream.
 *
 * All motifs are SVG with the brand-coral gradient ink — same vocabulary as
 * the pose-figure thumbnails in VideoPlaceholder + the welcome eyebrow.
 */
type Motif = 'neck' | 'eye' | 'wrist' | 'spine' | 'sleep' | 'flow';
type Palette = 'coral' | 'lavender' | 'mint' | 'peach' | 'cream';

interface Props {
  tags?: string[] | null;
  /** Override auto-pick if needed. */
  motif?: Motif;
  palette?: Palette;
}

const motifFromTags = (tags?: string[] | null): Motif => {
  const t = (tags || []).join(' ').toLowerCase();
  if (/(forward_head|posture|neck)/.test(t)) return 'neck';
  if (/(eye|cvs|20-?20|vision)/.test(t)) return 'eye';
  if (/(carpal|wrist|tendon|nerve)/.test(t)) return 'wrist';
  if (/(sciatica|lumbar|spine|disc|back)/.test(t)) return 'spine';
  if (/(sleep|recovery|circadian)/.test(t)) return 'sleep';
  return 'flow';
};

const paletteFromMotif = (m: Motif): Palette => {
  switch (m) {
    case 'neck':  return 'coral';
    case 'eye':   return 'lavender';
    case 'wrist': return 'mint';
    case 'spine': return 'peach';
    case 'sleep': return 'lavender';
    case 'flow':  return 'cream';
  }
};

const GRADIENT_STOPS: Record<Palette, [string, string]> = {
  coral:    ['#FFCAB1', '#FF9A6E'],
  lavender: ['#D7D2F0', '#A9A5D6'],
  mint:     ['#D9EBE0', '#9BC3AE'],
  peach:    ['#FBE0CB', '#E1B894'],
  cream:    ['#FBF1E2', '#E8D6B8'],
};

const INK = colors.primaryDeep;
const INK_SOFT = colors.primaryMid;

export const ArticleCover: React.FC<Props> = ({ tags, motif: motifOverride, palette: paletteOverride }) => {
  const motif = motifOverride ?? motifFromTags(tags);
  const palette = paletteOverride ?? paletteFromMotif(motif);
  const [from, to] = GRADIENT_STOPS[palette];

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgLinearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={INK} stopOpacity="0.65" />
            <Stop offset="1" stopColor={INK_SOFT} stopOpacity="0.85" />
          </SvgLinearGradient>
          <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <Stop offset="60%" stopColor="#ffffff" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Soft halo behind the motif */}
        <Circle cx="160" cy="90" r="92" fill="url(#halo)" />

        {motif === 'neck' && (
          <>
            {/* head + spine — neck curve */}
            <Circle cx="160" cy="62" r="16" fill="none" stroke="url(#ink)" strokeWidth="3" />
            <Path
              d="M160 78 Q158 96 162 116 Q166 130 162 144"
              stroke="url(#ink)" strokeWidth="3.5" fill="none" strokeLinecap="round"
            />
            <Path d="M148 96 L172 96" stroke="url(#ink)" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {motif === 'eye' && (
          <>
            {/* almond eye + iris + lash */}
            <Path
              d="M100 90 Q160 50 220 90 Q160 130 100 90 Z"
              fill="none" stroke="url(#ink)" strokeWidth="3" strokeLinecap="round"
            />
            <Circle cx="160" cy="90" r="14" fill="none" stroke="url(#ink)" strokeWidth="3" />
            <Circle cx="160" cy="90" r="5" fill={INK} opacity={0.55} />
            <Path d="M120 70 L130 60 M160 56 L160 44 M200 70 L210 60" stroke="url(#ink)" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {motif === 'wrist' && (
          <>
            {/* wrist + fingers fan */}
            <Path
              d="M110 130 L130 92 Q138 78 156 76 L188 74"
              stroke="url(#ink)" strokeWidth="3" fill="none" strokeLinecap="round"
            />
            <Path d="M188 74 L220 70" stroke="url(#ink)" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M188 86 L222 88" stroke="url(#ink)" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M186 98 L218 104" stroke="url(#ink)" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M182 110 L210 120" stroke="url(#ink)" strokeWidth="2.5" strokeLinecap="round" />
            {/* wristband */}
            <Path d="M118 122 L138 130 M114 130 L134 138" stroke={INK_SOFT} strokeWidth="2" strokeLinecap="round" opacity={0.7} />
          </>
        )}

        {motif === 'spine' && (
          <>
            {/* vertebrae stack — gently curved */}
            <Path d="M160 30 Q156 70 162 110 Q168 140 160 160" stroke="url(#ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
            {[40, 60, 80, 100, 120, 140].map((y, idx) => (
              <Circle key={idx} cx={158 + (idx % 2 === 0 ? 0 : 4)} cy={y} r="6" fill={INK} opacity={0.55} />
            ))}
          </>
        )}

        {motif === 'sleep' && (
          <>
            {/* crescent moon + 3 zZ */}
            <Path
              d="M150 60 Q120 70 122 100 Q124 130 156 138 Q140 130 138 100 Q138 70 150 60 Z"
              fill="url(#ink)"
            />
            <Path d="M188 60 L210 60 L188 84 L210 84" stroke="url(#ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
            <Path d="M218 92 L234 92 L218 108 L234 108" stroke="url(#ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        )}

        {motif === 'flow' && (
          <>
            {/* abstract flow — three offset arcs */}
            <Path
              d="M70 110 Q110 70 160 90 Q210 110 250 76"
              stroke="url(#ink)" strokeWidth="3" fill="none" strokeLinecap="round"
            />
            <Path
              d="M70 130 Q120 100 165 118 Q210 134 250 104"
              stroke={INK_SOFT} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.7}
            />
            <Circle cx="70" cy="110" r="5" fill={INK} opacity={0.5} />
            <Circle cx="250" cy="76" r="5" fill={INK} opacity={0.5} />
          </>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
});
