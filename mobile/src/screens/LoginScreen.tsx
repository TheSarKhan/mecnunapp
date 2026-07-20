import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Button, Screen } from '../components';
import { colors, fontFamily, radii, spacing, type } from '../theme';
import { useAuthStore } from '../store';
import { errorMessage } from '../api';
import { useKeyboardOffset } from '../lib/useKeyboardOffset';
import { useGoogleSignIn } from '../lib/useGoogleSignIn';
import { t } from '../i18n';

/**
 * Sign-in for an account that already exists.
 *
 * Reachable from onboarding rather than shown first: the product's default path is still "start
 * talking straight away", and the design has no login step. This exists for people coming back on
 * a new device, and for signing in with Google.
 */
export default function LoginScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardOffset();

  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { available: googleAvailable, signIn: googleSignIn } = useGoogleSignIn();

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onPasswordLogin = () =>
    run(async () => {
      if (!identifier.trim() || !password) {
        throw new Error(t('login.missingFields'));
      }
      await login(identifier.trim(), password);
    });

  const onGoogleLogin = () =>
    run(async () => {
      const idToken = await googleSignIn();
      // A cancelled Google sheet is not an error — the user simply changed their mind.
      if (idToken) {
        await loginWithGoogle(idToken);
      }
    });

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={type.title}>{t('login.title')}</Text>
        <Text style={styles.copy}>{t('login.subtitle')}</Text>

        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={t('login.identifier')}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="username"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={t('login.password')}
          placeholderTextColor={colors.muted}
          secureTextEntry
          textContentType="password"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

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
            <Button label={t('login.submit')} onPress={onPasswordLogin} />
            {googleAvailable ? (
              <Button label={t('login.google')} variant="secondary" onPress={onGoogleLogin} />
            ) : null}
            <Button label={t('common.back')} variant="ghost" onPress={() => navigation.goBack()} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: spacing.xxxl, paddingBottom: spacing.xl, gap: spacing.md },
  copy: { ...type.secondary, fontSize: 15, lineHeight: 21, marginBottom: spacing.sm },
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
  error: { ...type.secondary, color: colors.ink, marginTop: spacing.sm },
  actions: { gap: spacing.sm },
});
