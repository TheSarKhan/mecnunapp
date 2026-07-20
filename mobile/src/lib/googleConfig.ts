import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined;
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;

/**
 * Expo Go cannot complete Google sign-in: it redirects to exp://192.168.x.x:8081, and Google
 * accepts https redirects only for Web clients and custom schemes only for iOS/Android clients.
 * Neither matches, so it always ends in redirect_uri_mismatch.
 */
export const IN_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Whether Google sign-in can be attempted at all.
 *
 * This gate must be checked BEFORE mounting anything that calls expo-auth-session's Google hook:
 * that hook throws during render when the current platform has no client id ("iosClientId must be
 * defined to use google auth on this platform"), and a hook cannot be called conditionally. So the
 * button lives in its own component that is only mounted when this is true.
 */
export function isGoogleSignInAvailable(): boolean {
  if (IN_EXPO_GO) {
    return false;
  }
  if (Platform.OS === 'ios') {
    return Boolean(GOOGLE_IOS_CLIENT_ID);
  }
  if (Platform.OS === 'android') {
    return Boolean(GOOGLE_ANDROID_CLIENT_ID);
  }
  return Boolean(GOOGLE_WEB_CLIENT_ID);
}
