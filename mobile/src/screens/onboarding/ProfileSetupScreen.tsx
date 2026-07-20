import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, OptionRow, Screen } from '../../components';
import { colors, fontFamily, radii, spacing, type } from '../../theme';
import { useAuthStore, useOnboardingStore } from '../../store';
import { errorMessage, userApi } from '../../api';
import type { RelationshipStatus } from '../../api';
import { useKeyboardOffset } from '../../lib/useKeyboardOffset';
import { t } from '../../i18n';

/**
 * No "prefer not to say" option, unlike the other onboarding steps.
 *
 * The status is what the persona opens the conversation with and what marks the account as
 * onboarded, so an unset value would both flatten the first message and send the user back
 * through this flow on every launch. Brief v2 §5.1 lists exactly these; MARRIED is kept because
 * real users are.
 */
const STATUSES: { value: RelationshipStatus; labelKey: string }[] = [
  { value: 'SINGLE', labelKey: 'onboarding.profile.status.single' },
  { value: 'IN_RELATIONSHIP', labelKey: 'onboarding.profile.status.inRelationship' },
  { value: 'COMPLICATED', labelKey: 'onboarding.profile.status.complicated' },
  { value: 'BROKEN_UP', labelKey: 'onboarding.profile.status.brokenUp' },
  { value: 'MARRIED', labelKey: 'onboarding.profile.status.married' },
];

/** Last onboarding step — this is where every answer collected so far is flushed to the backend. */
export default function ProfileSetupScreen() {
  const { displayName, gender, persona, relationshipStatus, setDisplayName, setRelationshipStatus } =
    useOnboardingStore();
  const setMe = useAuthStore((s) => s.setMe);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyboardHeight = useKeyboardOffset();
  const insets = useSafeAreaInsets();

  const finish = async () => {
    if (relationshipStatus === 'UNSPECIFIED') {
      // The status is what marks the account as onboarded, so leaving it unset here would drop
      // the user straight back into this flow on the next launch.
      setError(t('onboarding.profile.pickStatus'));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      // The account already exists — registration happened before onboarding. This only saves the
      // answers, and setMe flips `onboarded`, which is what moves the navigator to the chat.
      setMe(
        await userApi.updateProfile({
          displayName: displayName.trim() || undefined,
          gender,
          persona,
          relationshipStatus,
        }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    // Bottom inset is handled below so it is not applied on top of the keyboard offset.
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
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

      <View
        style={[
          styles.actions,
          { marginBottom: keyboardHeight, paddingBottom: keyboardHeight > 0 ? spacing.md : Math.max(insets.bottom, spacing.xl) },
        ]}
      >
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
  // Horizontal padding comes from Screen; only the bottom is set inline, next to the keyboard offset.
  actions: {},
});
