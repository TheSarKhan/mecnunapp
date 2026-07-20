import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

interface Props {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean; // free tier — tap should route to paywall instead of flipping
  onLockedPress?: () => void;
}

export function Toggle({ label, value, onChange, locked, onLockedPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {locked ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>PREMIUM</Text>
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={() => (locked ? onLockedPress?.() : onChange(!value))}
        style={[styles.track, value && !locked ? styles.trackOn : styles.trackOff]}
      >
        <View style={[styles.knob, value && !locked ? styles.knobOn : styles.knobOff]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15, fontFamily: fontFamily.regular, color: colors.white },
  chip: { backgroundColor: colors.white, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  chipText: { fontSize: 10, fontFamily: fontFamily.semibold, color: colors.black, letterSpacing: 0.5 },
  track: { width: 46, height: 28, borderRadius: 15, padding: 3, justifyContent: 'center' },
  trackOff: { backgroundColor: colors.bubbleBot, borderWidth: 1, borderColor: colors.border },
  trackOn: { backgroundColor: colors.white },
  knob: { width: 20, height: 20, borderRadius: 10 },
  knobOff: { backgroundColor: colors.textSecondary, alignSelf: 'flex-start' },
  knobOn: { backgroundColor: colors.black, alignSelf: 'flex-end' },
});
