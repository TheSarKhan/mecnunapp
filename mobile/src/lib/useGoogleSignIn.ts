import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Expo Go cannot complete Google sign-in.
 *
 * The redirect it hands Google is `exp://192.168.x.x:8081`, and Google only accepts https
 * redirects for Web OAuth clients and custom schemes for iOS/Android clients. Neither matches, so
 * the consent screen ends in redirect_uri_mismatch no matter what is configured here.
 *
 * A development build has its own scheme (`mecnun://`), which an iOS/Android OAuth client does
 * accept — at which point this hook starts working with no code change.
 */
const IN_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function platformClientId(): string | undefined {
  if (Platform.OS === 'ios') return IOS_CLIENT_ID ?? WEB_CLIENT_ID;
  if (Platform.OS === 'android') return ANDROID_CLIENT_ID ?? WEB_CLIENT_ID;
  return WEB_CLIENT_ID;
}

export function useGoogleSignIn() {
  const available = !IN_EXPO_GO && Boolean(platformClientId());

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
  });

  // The hook resolves through `response`, so nothing to do here beyond keeping the reference
  // stable; the promise below reads the latest value when it settles.
  useEffect(() => {}, [response]);

  /**
   * @returns the Google ID token, or null when the user dismissed the sheet
   * @throws when sign-in is unavailable or Google returned an error
   */
  const signIn = useCallback(async (): Promise<string | null> => {
    if (IN_EXPO_GO) {
      throw new Error(
        'Google ilə giriş Expo Go-da işləmir — development build lazımdır. Hələlik e-poçt/şifrə ilə gir.',
      );
    }
    if (!request) {
      throw new Error('Google girişi hazır deyil. Client ID qurulub?');
    }

    const result = await promptAsync();
    if (result.type === 'dismiss' || result.type === 'cancel') {
      return null;
    }
    if (result.type !== 'success') {
      throw new Error('Google girişi tamamlanmadı.');
    }

    const idToken = result.params?.id_token ?? result.authentication?.idToken;
    if (!idToken) {
      throw new Error('Google ID token qaytarmadı.');
    }
    return idToken;
  }, [request, promptAsync]);

  return { available, signIn, inExpoGo: IN_EXPO_GO };
}
