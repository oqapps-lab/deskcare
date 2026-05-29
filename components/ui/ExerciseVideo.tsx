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
  /**
   * Fires once the video reaches first-frame / readyToPlay. The Routine
   * Player listens to this so the timer only starts after the user can
   * actually see the exercise — no more "timer counting on a black frame".
   * Also fires immediately with `true` for the SVG fallback (no buffering).
   */
  onReady?: () => void;
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
  width = 300,
  height = 400, // 3:4 portrait — matches Russell's shooting spec
  radius = 'lg',
  compact = false,
  showPlay = true,
  style,
  onReady,
}) => {
  // SVG fallback path: no buffering, fire ready synchronously on mount so the
  // routine player doesn't stall waiting for a video that will never load.
  useEffect(() => {
    if (!videoUrl && onReady) onReady();
  }, [videoUrl, onReady]);

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
      <VideoBody videoUrl={videoUrl} onReady={onReady} />
    </View>
  );
};

const VideoBody: React.FC<{ videoUrl: string; onReady?: () => void }> = ({ videoUrl, onReady }) => {
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

  // Subscribe to statusChange and emit onReady when the player reaches
  // `readyToPlay`. Without this signal the routine player would either start
  // the timer too early (timer counting on a buffering black frame) or fall
  // back to a fixed grace timeout that's wrong on slow networks.
  useEffect(() => {
    if (!onReady) return;
    if (player.status === 'readyToPlay') {
      onReady();
      return;
    }
    // Also unblock the parent timer on error — without this, a 404 video URL
    // would leave the routine player stuck on the per-exercise fallback
    // setTimeout for its full duration, showing a black frame the whole time.
    if (player.status === 'error') {
      onReady();
      return;
    }
    const sub = player.addListener('statusChange', (evt: { status: string }) => {
      if (evt.status === 'readyToPlay' || evt.status === 'error') onReady();
    });
    return () => sub.remove();
  }, [player, onReady]);

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
