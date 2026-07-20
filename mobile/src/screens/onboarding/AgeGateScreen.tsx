import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, Screen } from '../../components';
import { spacing, type } from '../../theme';
import { useOnboardingStore } from '../../store';
import { t } from '../../i18n';

export default function AgeGateScreen() {
  const navigation = useNavigation();
  const setAgeConfirmed = useOnboardingStore((s) => s.setAgeConfirmed);

  const confirm = () => {
    setAgeConfirmed(true);
    navigation.navigate('GenderSelect');
  };

  const decline = () => {
    setAgeConfirmed(false);
    Alert.alert(t('onboarding.ageGate.title'), t('onboarding.ageGate.body'));
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={type.title}>{t('onboarding.ageGate.title')}</Text>
        <Text style={styles.copy}>{t('onboarding.ageGate.body')}</Text>
      </View>
      <View style={styles.actions}>
        <Button label={t('onboarding.ageGate.confirm')} onPress={confirm} />
        <Button label={t('onboarding.ageGate.decline')} variant="ghost" onPress={decline} />
        {/* Entry point for people who already have an account — a new device, or Google. */}
        <Button
          label={t('login.haveAccount')}
          variant="ghost"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  copy: { ...type.secondary, fontSize: 15, lineHeight: 21 },
  actions: { gap: spacing.sm, paddingBottom: spacing.xl },
});
