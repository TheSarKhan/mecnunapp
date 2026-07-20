import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

interface Props {
  initial: string;
  name: string;
  description: string;
  selected?: boolean;
  onPress?: () => void;
}

export function PersonaCard({ initial, name, description, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { borderColor: selected ? colors.borderSelected : colors.border, borderWidth: selected ? 1.5 : 1 }]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bubbleBot, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: fontFamily.semibold, color: colors.white },
  textCol: { flex: 1, gap: 3 },
  name: { fontSize: 16, fontFamily: fontFamily.semibold, color: colors.white },
  desc: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.regular, color: colors.textSecondary },
});
