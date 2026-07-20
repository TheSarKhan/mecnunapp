import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, OptionRow, Screen } from '../../components';
import { spacing, type } from '../../theme';
import { useOnboardingStore } from '../../store';
import type { Gender } from '../../api';
import { t } from '../../i18n';

const OPTIONS: { value: Gender; labelKey: string }[] = [
  { value: 'FEMALE', labelKey: 'onboarding.gender.female' },
  { value: 'MALE', labelKey: 'onboarding.gender.male' },
  { value: 'UNSPECIFIED', labelKey: 'onboarding.gender.unspecified' },
];

export default function GenderSelectScreen() {
  const navigation = useNavigation();
  const gender = useOnboardingStore((s) => s.gender);
  const setGender = useOnboardingStore((s) => s.setGender);

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={type.title}>{t('onboarding.gender.title')}</Text>
        <Text style={styles.copy}>{t('onboarding.gender.subtitle')}</Text>
        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <OptionRow
              key={option.value}
              label={t(option.labelKey)}
              selected={gender === option.value}
              onPress={() => setGender(option.value)}
            />
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Button label={t('common.continue')} onPress={() => navigation.navigate('PersonaSelect')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  copy: { ...type.secondary, fontSize: 15, marginBottom: spacing.sm },
  options: { gap: spacing.md },
  actions: { paddingBottom: spacing.xl },
});
