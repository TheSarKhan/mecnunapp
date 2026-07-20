export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  AgeGate: undefined;
  GenderSelect: undefined;
  PersonaSelect: undefined;
  ProfileSetup: undefined;
  Chat: undefined;
  Paywall: undefined;
  Settings: undefined;
  Memory: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
