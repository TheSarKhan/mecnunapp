import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme';

interface Props {
  children: React.ReactNode;
  /** Adds the standard horizontal gutter. Off for full-bleed screens like Chat. */
  padded?: boolean;
  edges?: readonly Edge[];
  /** Drops the opaque background so something behind it (e.g. VideoBackdrop) shows through. */
  transparent?: boolean;
  style?: ViewStyle;
}

export function Screen({ children, padded = true, edges = ['top', 'bottom'], transparent, style }: Props) {
  return (
    <SafeAreaView style={[styles.safe, transparent && styles.transparent]} edges={edges}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  transparent: { backgroundColor: 'transparent' },
  content: { flex: 1 },
  padded: { paddingHorizontal: spacing.xxl },
});
