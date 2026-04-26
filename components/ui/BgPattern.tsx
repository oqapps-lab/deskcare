import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../../constants/tokens';

export type BgPatternVariant = 'waves' | 'dots' | 'arc';
export type BgPatternTone = 'coral' | 'lavender' | 'ink';

interface Props {
  variant?: BgPatternVariant;
  opacity?: number;
  tone?: BgPatternTone;
}

const TONE_COLOR: Record<BgPatternTone, string> = {
  coral: colors.primaryMid,
  lavender: colors.tertiaryMid,
  ink: colors.ink,
};

/**
 * BgPattern — decorative SVG overlay for screen backgrounds.
 *   waves — 3 gentle sine curves stacked, stroke-only.
 *   dots  — sparse pseudo-randomized grid of tiny circles.
 *   arc   — one large curved arc, like a distant horizon.
 *
 * Absolute, pointer-events none. Intended to live inside
 * <AtmosphericBackground /> alongside the OrbField layer.
 */
export const BgPattern: React.FC<Props> = ({
  variant = 'waves',
  opacity = 0.06,
  tone = 'coral',
}) => {
  const { width, height } = useWindowDimensions();
  const stroke = TONE_COLOR[tone];

  const content = useMemo(() => {
    if (variant === 'waves') {
      // 3 gentle sine-wave paths stacked vertically
      const makeWave = (yBase: number, amp: number, phase: number): string => {
        const steps = 8;
        const stepX = width / steps;
        let d = `M 0 ${yBase}`;
        for (let i = 0; i < steps; i++) {
          const x1 = stepX * i + stepX * 0.25;
          const y1 = yBase + (i % 2 === 0 ? -amp : amp) * phase;
          const x2 = stepX * i + stepX * 0.75;
          const y2 = yBase + (i % 2 === 0 ? amp : -amp) * phase;
          const x = stepX * (i + 1);
          d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x} ${yBase}`;
        }
        return d;
      };
      return (
        <>
          <Path
            d={makeWave(height * 0.22, 26, 1)}
            stroke={stroke}
            strokeWidth={1.25}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={makeWave(height * 0.5, 32, 1)}
            stroke={stroke}
            strokeWidth={1.25}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={makeWave(height * 0.78, 22, 1)}
            stroke={stroke}
            strokeWidth={1.25}
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    }

    if (variant === 'dots') {
      // Deterministic pseudo-random grid (no Math.random so SSR/re-render stable)
      const cols = 10;
      const rows = Math.ceil((height / width) * cols);
      const cellW = width / cols;
      const cellH = height / rows;
      const dots: React.ReactNode[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // deterministic jitter
          const seed = (r * 31 + c * 17) % 97;
          if (seed % 3 === 0) continue; // ~33% sparse
          const jitterX = ((seed * 7) % 100) / 100 - 0.5;
          const jitterY = ((seed * 13) % 100) / 100 - 0.5;
          const radius = 1 + ((seed * 5) % 20) / 10; // 1..3 px
          const cx = c * cellW + cellW / 2 + jitterX * cellW * 0.4;
          const cy = r * cellH + cellH / 2 + jitterY * cellH * 0.4;
          dots.push(
            <Circle
              key={`d-${r}-${c}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill={stroke}
            />,
          );
        }
      }
      return <>{dots}</>;
    }

    // arc — single horizon-like arc near top
    const cy = height * 0.28;
    const radius = width * 1.35;
    // Arc from left edge up and back down to right edge
    const d = `M ${-width * 0.2} ${cy} A ${radius} ${radius} 0 0 1 ${width * 1.2} ${cy}`;
    return (
      <Path
        d={d}
        stroke={stroke}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
    );
  }, [variant, width, height, stroke]);

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity }]}
    >
      <Svg width={width} height={height}>
        {content}
      </Svg>
    </View>
  );
};
