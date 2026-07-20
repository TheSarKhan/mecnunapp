import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, OptionRow, Screen } from '../../components';
import { colors, fontFamily, radii, spacing, type } from '../../theme';
import { useAuthStore, useOnboardingStore } from '../../store';
import { errorMessage, userApi } from '../../api';
import type { RelationshipStatus } from '../../api';
import { getOrCreateDeviceCredentials } from '../../lib/deviceAccount';
import { t } from '../../i18n';

const STATUSES: { value: RelationshipStatus; labelKey: string }[] = [
  { value: 'SINGLE', labelKey: 'onboarding.profile.status.single' },
  { value: 'IN_RELATIONSHIP', labelKey: 'onboarding.profile.status.inRelationship' },
  { value: 'COMPLICATED', labelKey: 'onboarding.profile.status.complicated' },
  { value: 'BROKEN_UP', labelKey: 'onboarding.profile.status.brokenUp' },
  { value: 'MARRIED', labelKey: 'onboarding.profile.status.married' },
  { value: 'UNSPECIFIED', labelKey: 'onboarding.profile.status.unspecified' },
];

/** Last onboarding step — this is where every answer collected so far is flushed to the backend. */
export default function ProfileSetupScreen() {
  const { displayName, gender, persona, relationshipStatus, setDisplayName, setRelationshipStatus } =
    useOnboardingStore();
  const register = useAuthStore((s) => s.register);
  const setMe = useAuthStore((s) => s.setMe);
  const markOnboarded = useAuthStore((s) => s.markOnboarded);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      const { identifier, password } = await getOrCreateDeviceCredentials();
      await register(identifier, password);
      const me = await userApi.updateProfile({
        displayName: displayName.trim() || undefined,
        gender,
        persona,
        relationshipStatus,
      });
      setMe(me);
      await markOnboarded();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={type.title}>{t('onboarding.profile.title')}</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('onboarding.profile.namePlaceholder')}
          placeholderTextColor={colors.muted}
          maxLength={80}
          autoCapitalize="words"
        />

        <Text style={styles.sectionTitle}>{t('onboarding.profile.statusTitle')}</Text>
        <View style={styles.options}>
          {STATUSES.map((option) => (
            <OptionRow
              key={option.value}
              label={t(option.labelKey)}
              selected={relationshipStatus === option.value}
              onPress={() => setRelationshipStatus(option.value)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.actions}>
        {busy ? (
          <ActivityIndicator color={colors.ink} />
        ) : (
          <Button label={t('onboarding.profile.finish')} onPress={finish} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.xxxl, paddingBottom: spacing.xl, gap: spacing.lg },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.input,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: colors.ink,
  },
  sectionTitle: { ...type.headline, marginTop: spacing.sm },
  options: { gap: spacing.md },
  error: { ...type.secondary, color: colors.ink, marginTop: spacing.sm },
  actions: { paddingBottom: spacing.xl },
});
