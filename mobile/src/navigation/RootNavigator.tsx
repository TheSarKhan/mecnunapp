import React from 'react';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import { useAuthStore } from '../store';
import type { RootStackParamList } from './types';

import SplashScreen from '../screens/SplashScreen';
import AgeGateScreen from '../screens/onboarding/AgeGateScreen';
import GenderSelectScreen from '../screens/onboarding/GenderSelectScreen';
import PersonaSelectScreen from '../screens/onboarding/PersonaSelectScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import ChatScreen from '../screens/ChatScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MemoryScreen from '../screens/MemoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.ink,
    border: colors.border,
    primary: colors.ink,
  },
};

export default function RootNavigator() {
  const ready = useAuthStore((s) => s.ready);
  const onboarded = useAuthStore((s) => s.onboarded);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        // No initialRouteName on purpose: the first screen in the list wins, so flipping
        // `ready` / `onboarded` moves the entry point without any imperative navigation.
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'fade',
        }}
      >
        {!ready ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : (
          <>
            {!onboarded && (
              <>
                <Stack.Screen name="AgeGate" component={AgeGateScreen} />
                <Stack.Screen name="GenderSelect" component={GenderSelectScreen} />
                <Stack.Screen name="PersonaSelect" component={PersonaSelectScreen} />
                <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
              </>
            )}
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Memory" component={MemoryScreen} />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
