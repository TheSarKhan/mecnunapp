import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Button, Screen, VideoBackdrop } from '../components';
import { colors, fontFamily, radii, spacing, type } from '../theme';
import { useAuthStore } from '../store';
import { errorMessage } from '../api';
import { useKeyboardOffset } from '../lib/useKeyboardOffset';
import { t } from '../i18n';

const MIN_PASSWORD_LENGTH = 6;

/**
 * Account creation only — no profile questions here.
 *
 * Name, gender, persona and relationship status are asked in onboarding, right after this, so the
 * sign-up form stays two fields. Every extra field on a registration screen costs sign-ups, and
 * these answers are better asked in the persona's own voice anyway.
 */
export default function RegisterScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardOffset();
  const register = useAuthStore((s) => s.register);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(async () => {
    const trimmed = identifier.trim();
    if (!trimmed || !password) {
      setError(t('register.missingFields'));
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('register.passwordTooShort'));
      return;
    }

    setBusy(true);
    setError(null);
    try {
      // Succeeding flips `authenticated` while `onboarded` stays false, which is what moves the
      // navigator on to the 18+ question — no imperative navigation needed.
      await register(trimmed, password);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [identifier, password, register]);

  return (
    <View style={styles.root}>
      <VideoBackdrop />

      <Screen edges={['top']} transparent>
        <View style={styles.brand}>
          <Text style={type.title}>{t('register.title')}</Text>
          <Text style={styles.copy}>{t('register.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={t('register.identifier')}
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t('register.password')}
            placeholderTextColor={colors.muted}
            secureTextEntry
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
          <Text style={styles.hint}>{t('register.passwordHint')}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View
          style={[
            styles.actions,
            {
              marginBottom: keyboardHeight,
              paddingBottom: keyboardHeight > 0 ? spacing.md : Math.max(insets.bottom, spacing.xl),
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <>
              <Button label={t('register.submit')} onPress={onSubmit} />
              <Button label={t('register.haveAccount')} variant="ghost" onPress={() => navigation.goBack()} />
            </>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  brand: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.xxxl, gap: spacing.sm },
  copy: { ...type.secondary, fontSize: 15, lineHeight: 21 },
  form: { gap: spacing.md, paddingBottom: spacing.xl },
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
  hint: { ...type.secondary, fontSize: 12 },
  error: { ...type.secondary, color: colors.ink },
  actions: { gap: spacing.sm },
});
