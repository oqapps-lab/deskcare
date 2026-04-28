import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { VideoPlaceholder } from './VideoPlaceholder';
import { radii } from '../../constants/tokens';

type Pose = React.ComponentProps<typeof VideoPlaceholder>['pose'];

interface Props {
  /** Atom code-derived pose for the SVG fallback when no video_url. */
  pose: Pose;
  /** Real video URL from exercises.video_url. When null, fallback. */
  videoUrl?: string | null;
  width?: number;
  height?: number;
  /** Visual radius — matches the surrounding card. */
  radius?: keyof typeof radii;
  /** Compact = small thumbnail in lists. Looped + muted, no controls. */
  compact?: boolean;
  /** Show play affordance over the placeholder (no effect when video plays). */
  showPlay?: boolean;
  /** Override container style if needed. */
  style?: ViewStyle;
}

/**
 * Renders a real exercise video when `videoUrl` is set; falls back to the
 * stick-figure VideoPlaceholder otherwise.
 *
 * Behaviour:
 *  - Compact mode (lists / small cards): muted + looped + autoplay,
 *    no controls. The "video as living thumbnail" pattern.
 *  - Full mode (detail screens, player): muted by default, looped,
 *    autoplay. Controls hidden — Routine Player handles the timed flow
 *    via its own progress ring and timer.
 *
 * The 7 atoms still pending shoot (W3, W6-W10, S2 as of 2026-04-29) have
 * `video_url=null` and so render the SVG fallback transparently.
 */
export const ExerciseVideo: React.FC<Props> = ({
  pose,
  videoUrl,
  width = 320,
  height = 240,
  radius = 'lg',
  compact = false,
  showPlay = true,
  style,
}) => {
  if (!videoUrl) {
    return (
      <VideoPlaceholder
        pose={pose}
        width={compact ? undefined : width}
        height={compact ? undefined : height}
        compact={compact}
        showPlay={showPlay}
      />
    );
  }

  return (
    <View
      style={[
        styles.wrap,
        {
          width: compact ? undefined : width,
          height: compact ? undefined : height,
          borderRadius: radii[radius],
        },
        style,
      ]}
    >
      <VideoBody videoUrl={videoUrl} />
    </View>
  );
};

const VideoBody: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // expo-video keeps the player alive until the parent unmounts; nothing to
  // tear down explicitly here, but we re-trigger play when URL flips to a
  // new atom (e.g. routine-player advancing items).
  useEffect(() => {
    player.play();
  }, [videoUrl, player]);

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
});
