# Məcnun — mobile

React Native · **Expo SDK 57** · TypeScript · React Navigation (native-stack) · Zustand · axios

## İşə salmaq

```bash
npm install
cp .env.example .env
npx expo start
```

Terminalda: `a` → Android emulator, `i` → iOS simulator (yalnız macOS), QR kod → **Expo Go** ilə fiziki cihaz.

Tip yoxlaması:

```bash
npm run typecheck
```

## API URL

`localhost` telefonun özünü göstərir, sənin kompüterini yox. `.env`-də:

| Harada | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS simulator | `http://localhost:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| Fiziki cihaz | `http://<LAN-IP>:8080` (məs. `http://192.168.1.20:8080`) |

Backend işləmirsə app açılır, amma onboarding-in son addımı xəta verir — `docker compose up` işlətdiyindən əmin ol.

Yalnız `EXPO_PUBLIC_` prefiksli dəyişənlər bundle-a düşür. `.env` dəyişəndən sonra Expo-nu restart et.

## Struktur

```
mobile/
├── App.tsx                 # font yükləmə + session bootstrap + naviqator
├── src/
│   ├── api/                # axios client + endpoint-lər (backend DTO-larının güzgüsü)
│   ├── components/
│   │   └── ui/             # docs/design/mecnun-ui-kit-dən kopyalanmış komponentlər
│   ├── screens/
│   │   └── onboarding/
│   ├── navigation/         # RootNavigator + route tipləri
│   ├── store/              # Zustand — auth, chat, onboarding
│   ├── theme/              # dizayn tokenləri (tək mənbə)
│   ├── i18n/               # az.json (dolu), tr.json (placeholder)
│   └── lib/
└── assets/
```

## Naviqasiya

`RootNavigator`-da `initialRouteName` **yoxdur** — siyahıdakı ilk ekran giriş nöqtəsidir. Beləliklə `ready` / `onboarded` flag-ları dəyişəndə imperativ `navigate` çağırışı olmadan doğru ekrana keçilir:

```
!ready              → Splash
!onboarded          → AgeGate → GenderSelect → PersonaSelect → ProfileSetup
onboarded           → Chat (+ Settings, Memory, Paywall modal)
```

## Dizayn tokenləri

`src/theme/colors.ts` **tək mənbədir**. `src/components/ui/tokens.ts` yalnız shim-dir — kit komponentlərinin `./tokens` import-u işləsin deyə tema dəyərlərini kit adları ilə (`colors.white`, `colors.bubbleBot`, ...) re-export edir. Rəng dəyişirsənsə `src/theme/colors.ts`-i redaktə et.

Orijinal Claude Design export-u `docs/design/mecnun-ui-kit/` altında toxunulmaz qalır — referans üçün.

Monoxrom sistem: fon `#131313`, səth `#1D1D1F`, bot bubble `#232326`, mətn `#F5F5F4`, ikincil `#8E8E93`. Heç bir hue yoxdur; yeganə "accent" ağ/qara inversiyasıdır — məsələn `ModePill` qeybət modunda ağa dönür.

Şrift: **Inter** (`@expo-google-fonts/inter`). Cihazda AZ hərflərini yoxla: `ə ğ ı ş ö ü ç Ə Ğ I İ Ş Ö Ü Ç`.

## i18n

`t('onboarding.ageGate.title')` — nöqtəli açar, `{{placeholder}}` interpolyasiyası. Sadə öz implementasiyamızdır (`src/i18n/index.ts`), tapılmayan açar `az`-a, sonra açarın özünə düşür. Sonradan `react-i18next`-ə keçilsə çağırış yeri dəyişmir.

`tr.json` boşdur — struktur TR üçün hazırdır.

## Hələ yoxdur

- RevenueCat SDK (`Paywall` ekranı statik qiymətlərlə)
- AdMob rewarded ad (`chat.watchAd` mətni var, inteqrasiya yox)
- 401 üzrə avtomatik token refresh (`src/api/client.ts`-də TODO)
- Söhbət tarixçəsi ekranı (`GET /chat/conversations` API-si hazırdır)
