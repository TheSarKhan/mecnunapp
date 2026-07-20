import React, { useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { Button } from './ui';
import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '../lib/googleConfig';
import { t } from '../i18n';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  onIdToken: (idToken: string) => Promise<void> | void;
  onError: (message: string) => void;
}

/**
 * Only ever mounted when isGoogleSignInAvailable() is true.
 *
 * The Google hook below throws during render if the running platform has no client id, and hooks
 * cannot be called conditionally — so the guard has to be "do not mount this component", which is
 * why the button is a component rather than a branch inside the login screen.
 */
export function GoogleSignInButton({ onIdToken, onError }: Props) {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const onPress = useCallback(async () => {
    try {
      const result = await promptAsync();
      // Dismissing the sheet is a choice, not a failure — say nothing.
      if (result.type === 'dismiss' || result.type === 'cancel') {
        return;
      }
      if (result.type !== 'success') {
        onError(t('login.googleFailed'));
        return;
      }
      const idToken = result.params?.id_token ?? result.authentication?.idToken;
      if (!idToken) {
        onError(t('login.googleFailed'));
        return;
      }
      await onIdToken(idToken);
    } catch {
      onError(t('login.googleFailed'));
    }
  }, [promptAsync, onIdToken, onError]);

  return <Button label={t('login.google')} variant="secondary" onPress={onPress} disabled={!request} />;
}
