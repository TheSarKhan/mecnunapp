import AsyncStorage from '@react-native-async-storage/async-storage';

const IDENTIFIER_KEY = 'mecnun.device.identifier';
const PASSWORD_KEY = 'mecnun.device.password';

/**
 * v1 has no login screen — the design goes straight from onboarding into chat. So onboarding
 * silently creates an anonymous device account and keeps the credentials locally.
 *
 * TODO(later): phone + OTP sign-in, which lets an account move between devices. These stored
 * credentials become the "upgrade this anonymous account" path at that point.
 */
export async function getOrCreateDeviceCredentials(): Promise<{ identifier: string; password: string }> {
  const [identifier, password] = await Promise.all([
    AsyncStorage.getItem(IDENTIFIER_KEY),
    AsyncStorage.getItem(PASSWORD_KEY),
  ]);

  if (identifier && password) {
    return { identifier, password };
  }

  const created = {
    identifier: `device-${randomToken(16)}@mecnun.local`,
    password: randomToken(32),
  };
  await AsyncStorage.multiSet([
    [IDENTIFIER_KEY, created.identifier],
    [PASSWORD_KEY, created.password],
  ]);
  return created;
}

function randomToken(length: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
