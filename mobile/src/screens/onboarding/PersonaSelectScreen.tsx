import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, PersonaCard, Screen } from '../../components';
import { spacing, type } from '../../theme';
import { useOnboardingStore } from '../../store';
import { t } from '../../i18n';

export default function PersonaSelectScreen() {
  const navigation = useNavigation();
  const persona = useOnboardingStore((s) => s.persona);
  const setPersona = useOnboardingStore((s) => s.setPersona);

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={type.title}>{t('onboarding.persona.title')}</Text>
        <Text style={styles.copy}>{t('onboarding.persona.subtitle')}</Text>
        <View style={styles.cards}>
          <PersonaCard
            initial="L"
            name={t('onboarding.persona.leyli.name')}
            description={t('onboarding.persona.leyli.description')}
            selected={persona === 'LEYLI'}
            onPress={() => setPersona('LEYLI')}
          />
          <PersonaCard
            initial="M"
            name={t('onboarding.persona.mecnun.name')}
            description={t('onboarding.persona.mecnun.description')}
            selected={persona === 'MECNUN'}
            onPress={() => setPersona('MECNUN')}
          />
        </View>
      </View>
      <View style={styles.actions}>
        <Button label={t('common.continue')} onPress={() => navigation.navigate('ProfileSetup')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.md },
  copy: { ...type.secondary, fontSize: 15, marginBottom: spacing.sm },
  cards: { gap: spacing.md },
  actions: { paddingBottom: spacing.xl },
});
