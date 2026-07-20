import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

const DOTS = [0, 1, 2];
const DOT_DURATION = 420;
/** Stagger between dots, so they read as a wave rather than a blink. */
const DOT_DELAY = 140;

/**
 * The "persona is typing" bubble.
 *
 * Sits where the reply will appear and matches the bot bubble exactly, so the answer replaces it
 * in place instead of the thread jumping when it arrives.
 */
export function TypingBubble() {
  // useRef, not useState: these values are driven by the native animation driver and must survive
  // re-renders without restarting the loop.
  const dots = useRef(DOTS.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = dots.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * DOT_DELAY),
          Animated.timing(value, {
            toValue: 1,
            duration: DOT_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.3,
            duration: DOT_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          // Pads the cycle so every dot has the same period despite different start delays.
          Animated.delay((DOTS.length - 1 - index) * DOT_DELAY),
        ]),
      ),
    );

    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, [dots]);

  return (
    <View style={styles.bubble} accessibilityLabel="yazır">
      {dots.map((value, index) => (
        <Animated.View key={index} style={[styles.dot, { opacity: value }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.botBubble,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.muted,
  },
});
