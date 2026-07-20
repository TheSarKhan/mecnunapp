import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

interface Props {
  current: number;
  max: number;
}

export function LimitCounter({ current, max }: Props) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <View style={styles.pill}>
      <Text style={styles.count}>
        {current}
        <Text style={styles.countMax}> / {max}</Text>
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  count: { fontSize: 13, fontFamily: fontFamily.semibold, color: colors.white },
  countMax: { fontFamily: fontFamily.medium, color: colors.textSecondary },
  track: { width: 52, height: 4, borderRadius: 2, backgroundColor: colors.bubbleBot, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.white },
});
