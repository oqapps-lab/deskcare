import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors } from '../../constants/tokens';

export type GlyphName =
  | 'bell'
  | 'eye'
  | 'speaker'
  | 'crown'
  | 'settings'
  | 'back-chevron'
  | 'chevron-right'
  | 'play'
  | 'pause'
  | 'refresh'
  | 'skip-back'
  | 'check'
  | 'wifi-off'
  | 'cloud-slash'
  | 'clock'
  | 'close-x'
  | 'infinity'
  | 'plus';

interface GlyphProps {
  name: GlyphName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Inline SVG icon set. Single stroke-weight, rounded caps.
 * Use colors.* from tokens — never pass hex directly.
 */
export const Glyph: React.FC<GlyphProps> = ({
  name,
  size = 24,
  color = colors.ink,
  strokeWidth = 2,
}) => {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  const paths: Record<GlyphName, React.ReactNode> = {
    bell: (
      <>
        <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" {...common} />
        <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" {...common} />
      </>
    ),
    eye: (
      <>
        <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...common} />
        <Circle cx="12" cy="12" r="3" {...common} />
      </>
    ),
    speaker: (
      <>
        <Path d="M11 5L6 9H2v6h4l5 4V5z" {...common} />
        <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" {...common} />
        <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" {...common} />
      </>
    ),
    crown: (
      <>
        <Path d="M2 7l5 5 5-8 5 8 5-5v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7z" {...common} />
      </>
    ),
    settings: (
      <>
        <Circle cx="12" cy="12" r="3" {...common} />
        <Path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          {...common}
        />
      </>
    ),
    'back-chevron': <Path d="M15 18l-6-6 6-6" {...common} />,
    'chevron-right': <Path d="M9 6l6 6-6 6" {...common} />,
    play: <Path d="M7 5l11 7-11 7V5z" {...common} fill={color} stroke={color} />,
    pause: (
      <>
        <Line x1="6" y1="4" x2="6" y2="20" {...common} stroke={color} strokeWidth={3.5} />
        <Line x1="18" y1="4" x2="18" y2="20" {...common} stroke={color} strokeWidth={3.5} />
      </>
    ),
    refresh: (
      <>
        <Path d="M23 4v6h-6" {...common} />
        <Path d="M1 20v-6h6" {...common} />
        <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" {...common} />
        <Path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" {...common} />
      </>
    ),
    'skip-back': (
      <>
        <Path d="M19 20L9 12l10-8v16z" {...common} fill={color} stroke={color} />
        <Line x1="5" y1="19" x2="5" y2="5" {...common} strokeWidth={2.5} />
      </>
    ),
    check: <Path d="M20 6L9 17l-5-5" {...common} />,
    'wifi-off': (
      <>
        <Line x1="1" y1="1" x2="23" y2="23" {...common} />
        <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" {...common} />
        <Path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" {...common} />
        <Path d="M10.71 5.05A16 16 0 0 1 22.58 9" {...common} />
        <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" {...common} />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" {...common} />
        <Line x1="12" y1="20" x2="12.01" y2="20" {...common} />
      </>
    ),
    'cloud-slash': (
      <>
        <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" {...common} />
        <Line x1="3" y1="3" x2="21" y2="21" {...common} />
      </>
    ),
    clock: (
      <>
        <Circle cx="12" cy="12" r="10" {...common} />
        <Path d="M12 6v6l4 2" {...common} />
      </>
    ),
    'close-x': (
      <>
        <Line x1="18" y1="6" x2="6" y2="18" {...common} />
        <Line x1="6" y1="6" x2="18" y2="18" {...common} />
      </>
    ),
    infinity: (
      <Path
        d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-5.095 0-5.095 8 0 8 5.606 0 7.644-8 12.739-8z"
        {...common}
      />
    ),
    plus: (
      <>
        <Line x1="12" y1="5" x2="12" y2="19" {...common} />
        <Line x1="5" y1="12" x2="19" y2="12" {...common} />
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </Svg>
  );
};
