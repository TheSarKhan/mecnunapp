# məcnun RN component kit

Real React Native (Expo) source, not a translation layer — import directly.

## Install
```
npx expo install react-native-svg
npx expo install expo-font @expo-google-fonts/inter
```
Load fonts (Inter_400Regular/500Medium/600SemiBold/700Bold) via `useFonts` before rendering; verify Azerbaijani glyphs (ə ğ ı ş ö ü ç) render — fallback to a system font only if Inter fails on a target device.

## Files
- `tokens.ts` — colors, radii, spacing, type scale. Single source of truth; edit here, not per-component.
- `Button.tsx` — primary / secondary / ghost.
- `ModePill.tsx` — Söhbət/Qeybət segmented control; Qeybət = inverted fill.
- `Toggle.tsx` — söyüş modu switch; `locked` prop routes tap to paywall instead of flipping.
- `LimitCounter.tsx` — n/max pill with progress track.
- `ChatBubble.tsx` — bot/user bubble, `grouped` prop tightens spacing for consecutive same-sender messages.
- `Composer.tsx` — text input + send button, disables on limit reached.
- `PersonaCard.tsx`, `PlanCard.tsx` — selectable cards (persona picker, paywall plan).
- `icons.tsx` — small `react-native-svg` icon set matching the HTML mock.

## Usage
```tsx
import { Button, ModePill, ChatBubble, colors } from './rn-components';

<View style={{ flex: 1, backgroundColor: colors.bg }}>
  <ModePill mode={mode} onChange={setMode} />
  <ChatBubble text="Gəl danışaq. Nooldu?" from="bot" />
  <Button label="Başla" onPress={...} />
</View>
```

Not included (build per-screen, composing these parts): onboarding screens, chat screen shell, settings list, paywall screen — see `../README.md` for full screen specs to assemble them from these components.
