import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { colors } from '../theme';

// Bundled rather than streamed: the login screen is the first thing anyone sees, and a background
// that pops in after a network round trip looks broken. 0.41 MB after re-encoding from Pexels' 4K
// original — see docs/design/README.md for the source and licence.
const SOURCE = require('../../assets/login-bg.mp4');

/**
 * Full-bleed looping video with a heavy scrim.
 *
 * The scrim is not decoration. The brand is strictly monochrome ("no hue anywhere"), so a colour
 * video would fight the design system; the near-opaque dark layer mutes it to a texture and keeps
 * text contrast readable no matter which frame is on screen.
 */
export function VideoBackdrop() {
  const player = useVideoPlayer(SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
        // Not a media player — no PiP, no fullscreen affordances on a background.
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
      <View style={styles.scrim} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    opacity: 0.72,
  },
});
