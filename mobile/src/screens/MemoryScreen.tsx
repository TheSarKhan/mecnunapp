import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { BackIcon, Button, CloseIcon, Screen } from '../components';
import { colors, radii, spacing, type } from '../theme';
import { errorMessage, memoryApi } from '../api';
import type { MemoryFactDto } from '../api';
import { t } from '../i18n';

/** "Məcnun məni necə tanıyır?" — what the bot has stored, with per-fact and bulk delete. */
export default function MemoryScreen() {
  const navigation = useNavigation();
  const [facts, setFacts] = useState<MemoryFactDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFacts(await memoryApi.getMemory());
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const deleteFact = async (factId: string) => {
    try {
      await memoryApi.deleteFact(factId);
      setFacts((current) => current.filter((f) => f.id !== factId));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const confirmDeleteAll = () => {
    Alert.alert(t('settings.memoryDeleteAll'), t('settings.memoryDeleteAllConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await memoryApi.deleteAllMemory();
            setFacts([]);
          } catch (err) {
            setError(errorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={14}>
          <BackIcon size={20} color={colors.muted} />
        </Pressable>
        <Text style={type.headline}>{t('settings.memory')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.ink} />
      ) : (
        <FlatList
          data={facts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.factRow}>
              <Text style={styles.factText}>{item.factText}</Text>
              <Pressable onPress={() => deleteFact(item.id)} hitSlop={12}>
                <CloseIcon size={14} color={colors.muted} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>{t('settings.memoryEmpty')}</Text>}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {facts.length > 0 ? (
        <View style={styles.actions}>
          <Button label={t('settings.memoryDeleteAll')} variant="secondary" onPress={confirmDeleteAll} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerSpacer: { width: 20 },
  loader: { marginTop: spacing.xxxl },
  list: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md, flexGrow: 1 },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  factText: { ...type.body, fontSize: 15, lineHeight: 21, flex: 1 },
  empty: { ...type.secondary, textAlign: 'center', marginTop: spacing.xxxl },
  error: { ...type.secondary, color: colors.ink, textAlign: 'center' },
  actions: { paddingBottom: spacing.xl },
});
