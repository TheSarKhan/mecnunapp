import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, radii, spacing } from '../theme';
import { CheckIcon } from './ui';

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

/** Single-select list row — used by gender and relationship-status pickers. */
export function OptionRow({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: selected ? colors.borderSelected : colors.border, borderWidth: selected ? 1.5 : 1 },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.check}>{selected ? <CheckIcon size={17} color={colors.ink} /> : null}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  pressed: { opacity: 0.85 },
  label: { fontSize: 15, fontFamily: fontFamily.medium, color: colors.ink },
  check: { width: 17, height: 17 },
});
