import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fontFamily } from './tokens';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  onSend: () => void;
  disabled?: boolean; // e.g. limit reached
  placeholder?: string;
}

export function Composer({ value, onChangeText, onSend, disabled, placeholder = 'Yaz...' }: Props) {
  const canSend = value.trim().length > 0 && !disabled;
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        editable={!disabled}
        multiline
      />
      <Pressable
        onPress={canSend ? onSend : undefined}
        style={[styles.sendBtn, { backgroundColor: canSend ? colors.white : colors.bubbleBot }]}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 19V5M5 12l7-7 7 7"
            stroke={canSend ? colors.black : colors.textSecondary}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.white,
    maxHeight: 120,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
