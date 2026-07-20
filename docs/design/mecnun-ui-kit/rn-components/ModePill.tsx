import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

export type ChatMode = 'chat' | 'qeybet';

interface Props {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}

// Qeybət (venting) mode inverts to white fill — the one place monochrome UI signals a state change.
export function ModePill({ mode, onChange }: Props) {
  return (
    <View style={styles.track}>
      <Pressable style={[styles.segment, mode === 'chat' && styles.segmentActiveChat]} onPress={() => onChange('chat')}>
        <Text style={[styles.label, mode === 'chat' && styles.labelActiveChat]}>Söhbət</Text>
      </Pressable>
      <Pressable style={[styles.segment, mode === 'qeybet' && styles.segmentActiveQeybet]} onPress={() => onChange('qeybet')}>
        <Text style={[styles.label, mode === 'qeybet' && styles.labelActiveQeybet]}>Qeybət</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 3,
    alignSelf: 'center',
  },
  segment: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 18 },
  segmentActiveChat: { backgroundColor: colors.bubbleBot },
  segmentActiveQeybet: { backgroundColor: colors.white },
  label: { fontSize: 12, fontFamily: fontFamily.medium, color: colors.textSecondary },
  labelActiveChat: { color: colors.white, fontFamily: fontFamily.semibold },
  labelActiveQeybet: { color: colors.black, fontFamily: fontFamily.bold },
});
