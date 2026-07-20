import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { BackIcon, ChevronRightIcon, PersonaCard, Screen, Toggle } from '../components';
import { colors, radii, spacing, type } from '../theme';
import { useAuthStore } from '../store';
import { errorMessage, userApi } from '../api';
import { t } from '../i18n';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const me = useAuthStore((s) => s.me);
  const setMe = useAuthStore((s) => s.setMe);
  const logout = useAuthStore((s) => s.logout);
  const [error, setError] = useState<string | null>(null);

  const premium = me?.premium ?? false;

  const changePersona = async (persona: 'LEYLI' | 'MECNUN') => {
    if (!me) return;
    try {
      setMe(
        await userApi.updateProfile({
          displayName: me.displayName ?? undefined,
          gender: me.gender,
          persona,
          relationshipStatus: me.relationshipStatus,
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const toggleProfanity = async (value: boolean) => {
    try {
      setMe(await userApi.updateSettings(value));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteAccountConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await userApi.deleteAccount();
            await logout();
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
        <Text style={type.headline}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={type.caption}>{t('settings.persona').toUpperCase()}</Text>
        <View style={styles.group}>
          <PersonaCard
            initial="L"
            name={t('onboarding.persona.leyli.name')}
            description={t('onboarding.persona.leyli.description')}
            selected={me?.persona === 'LEYLI'}
            onPress={() => changePersona('LEYLI')}
          />
          <PersonaCard
            initial="M"
            name={t('onboarding.persona.mecnun.name')}
            description={t('onboarding.persona.mecnun.description')}
            selected={me?.persona === 'MECNUN'}
            onPress={() => changePersona('MECNUN')}
          />
        </View>

        <View style={styles.card}>
          <Toggle
            label={t('settings.profanity')}
            value={me?.profanityEnabled ?? false}
            onChange={toggleProfanity}
            locked={!premium}
            onLockedPress={() => navigation.navigate('Paywall')}
          />
        </View>

        <Pressable style={styles.row} onPress={() => navigation.navigate('Memory')}>
          <Text style={type.bodyMedium}>{t('settings.memory')}</Text>
          <ChevronRightIcon size={17} color={colors.muted} />
        </Pressable>

        {!premium ? (
          <Pressable style={styles.row} onPress={() => navigation.navigate('Paywall')}>
            <Text style={type.bodyMedium}>{t('settings.premium')}</Text>
            <ChevronRightIcon size={17} color={colors.muted} />
          </Pressable>
        ) : (
          <View style={styles.row}>
            <Text style={type.bodyMedium}>{t('settings.premium')}</Text>
            <Text style={type.secondary}>{t('settings.premiumActive')}</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.row} onPress={confirmDeleteAccount}>
          <Text style={type.bodyMedium}>{t('settings.deleteAccount')}</Text>
        </Pressable>
      </ScrollView>
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
  body: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  group: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  error: { ...type.secondary, color: colors.ink },
});
