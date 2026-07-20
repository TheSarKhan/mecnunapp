# Məcnun — mobile

React Native · **Expo SDK 54** · TypeScript · React Navigation (native-stack) · Zustand · axios

> **Niyə SDK 54, ən sonuncu yox?** Ən son SDK Expo Go-nun ən son versiyasını tələb edir, onu da köhnə iPhone/Android-lər quraşdıra bilmir — mağaza onlara OS-ə uyğun sonuncu (köhnə) build-i verir və app "incompatible with this version of Expo Go" deyir. SDK 54 daha geniş cihaz dəstəyi verir. Development build-ə keçəndə bu məhdudiyyət aradan qalxır və SDK-nı qaldırmaq olar.

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
| **Canlı server (default)** | `https://mecnun.sarkhan.az` |
| iOS simulator + lokal backend | `http://localhost:8090` |
| Android emulator + lokal backend | `http://10.0.2.2:8090` |
| Fiziki cihaz + lokal backend | `http://<LAN-IP>:8090` (məs. `http://192.168.1.8:8090`) |

Backend işləmirsə app açılır, amma giriş/qeydiyyat xəta verir.

Yalnız `EXPO_PUBLIC_` prefiksli dəyişənlər bundle-a düşür. `.env` dəyişəndən sonra Expo-nu restart et.

## APK / build (EAS)

Build konfiqurasiyası `eas.json`-dadır. **`EXPO_PUBLIC_*` dəyərləri orada yazılıb, `.env`-də
yox** — `.env` repoda deyil və hər maşında fərqlidir, build isə təkrarlana bilən olmalıdır.

```bash
npx eas-cli build --platform android --profile preview     # paylaşıla bilən APK
npx eas-cli build --platform android --profile production  # Play Store üçün .aab
npx eas-cli build:list                                     # keçmiş build-lər + linklər
```

| Profil | Nəticə | Nə üçün |
| --- | --- | --- |
| `preview` | `.apk` | Telefona birbaşa quraşdırılır, mağaza lazım deyil |
| `production` | `.aab` | Play Store yalnız bunu qəbul edir |
| `development` | `.apk` + dev client | Metro-ya qoşulur, native modul debug üçün |

### Google girişi APK-da hələ işləmir

`GoogleSignInButton` Android-də `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` tələb edir; o
qurulmayana qədər düymə sadəcə **görünmür** (email/şifrə girişi işləyir). Bu, toyuq-yumurta
məsələsidir — Android OAuth client yaratmaq üçün imzalayan keystore-un SHA-1-i lazımdır:

```bash
npx eas-cli credentials --platform android    # SHA-1 fingerprint-i göstərir
```

Sonra Google Cloud Console → Credentials → OAuth client ID → **Android**, paket
`com.mecnun.app` + həmin SHA-1. Alınan ID `eas.json`-un `env` bölməsinə
`EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` kimi yazılır və APK **yenidən** qurulur.

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
