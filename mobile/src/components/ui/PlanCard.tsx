import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontFamily } from './tokens';

interface Props {
  name: string;
  price: string;
  period: string;
  note?: string;
  selected?: boolean;
}

export function PlanCard({ name, price, period, note, selected }: Props) {
  return (
    <View style={[styles.card, { borderColor: selected ? colors.borderSelected : colors.border, borderWidth: selected ? 1.5 : 1 }]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{name}</Text>
        {selected ? (
          <View style={styles.chip}>
            <Text style={styles.chipText}>SEÇİLİ</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}> / {period}</Text>
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  name: { fontSize: 15, fontFamily: fontFamily.semibold, color: colors.white },
  chip: { backgroundColor: colors.white, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { fontSize: 11, fontFamily: fontFamily.semibold, color: colors.black, letterSpacing: 0.5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 28, fontFamily: fontFamily.bold, color: colors.white, letterSpacing: -0.5 },
  period: { fontSize: 14, fontFamily: fontFamily.regular, color: colors.textSecondary },
  note: { fontSize: 12, fontFamily: fontFamily.regular, color: colors.textSecondary, lineHeight: 16 },
});
