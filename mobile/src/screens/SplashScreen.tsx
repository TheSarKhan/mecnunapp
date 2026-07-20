import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components';
import { colors, type } from '../theme';
import { t } from '../i18n';

/** Purely visual. The session bootstrap runs in App.tsx; this stays up until it resolves. */
export default function SplashScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={type.wordmark}>{t('splash.wordmark')}</Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  tagline: { ...type.secondary, color: colors.muted, textAlign: 'center' },
});
