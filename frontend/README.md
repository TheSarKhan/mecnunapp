# Məcnun — web

Mobil app-in web qabığı. Eyni backend, eyni dizayn tokenləri, eyni axın: onboarding → chat →
ayarlar / yaddaş / premium.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 · zustand · axios

---

## İşə salmaq

Tələb: **Node 20.9+** (Next 16-nın minimumu).

```bash
cd frontend
npm install
cp .env.example .env.local     # NEXT_PUBLIC_API_URL-i yoxla
npm run dev
```

→ http://localhost:3000

Backend ayrıca qalxmalıdır (kökdən `docker compose up`). Backend başqa portdadırsa
`.env.local`-da `NEXT_PUBLIC_API_URL`-i dəyiş.

**CORS:** backend `mecnun.cors.allowed-origins` (env: `CORS_ALLOWED_ORIGINS`) ilə icazə verir,
default `http://localhost:3000`. Web başqa origin-dən açılırsa bu dəyər genişlənməlidir — əks
halda hər sorğu preflight-da ölür.

## Skriptlər

| Əmr | Nə edir |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Prod build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## Struktur

```
src/
├── api/          # backend klienti — mobile/src/api-in güzgüsü
├── app/          # marşrutlar (App Router)
│   ├── onboarding/{yas,cinsiyyet,persona,profil}/
│   └── chat/  ayarlar/  yaddas/  premium/
├── components/   # Screen, Bootstrap, PageHeader, ui/*
├── i18n/         # az.json + t()
├── lib/          # deviceAccount, storage, routes, useGuard
└── store/        # zustand: auth, onboarding, chat
```

## Mobil ilə əlaqə

Web ayrıca məhsul deyil, **eyni məhsulun ikinci qabığıdır**. Aşağıdakılar bilərəkdən dublikatdır
və **cüt-cüt yenilənməlidir**:

| Web | Mobil |
| --- | --- |
| `src/api/types.ts` | `mobile/src/api/types.ts` |
| `src/app/globals.css` (`@theme`) | `mobile/src/theme/colors.ts` |
| `src/i18n/az.json` | `mobile/src/i18n/az.json` |
| `src/store/chatStore.ts` | `mobile/src/store/chatStore.ts` |

Dublikatın səbəbi: ortaq paket çıxarmaq RN və web-in ayrı build zəncirlərini bir-birinə bağlayır,
qazancı isə bir neçə yüz sətirdir. Sərhəd aydın qaldıqca kopya ucuzdur — bu cədvəl həmin sərhədi
görünən saxlayır.

## Mobil ilə fərqlər (bilərəkdən)

- **Kopyalama** — mobildə uzun basmaq, web-də hover/fokusda görünən düymə. Web-də uzun basmaq
  jesti yoxdur.
- **Token saxlama** — `AsyncStorage` yerinə `localStorage`. Sinxrondur, ona görə mobildəki
  `loadTokens()` await-i burada yoxdur. Safari private rejimində bloklana bilər; `lib/storage.ts`
  bunu udur və app işləməyə davam edir (sadəcə sessiya yadda qalmır).
- **Cihaz açarları** — `Math.random` yerinə `crypto.getRandomValues`. Həmin sətir hesabın yeganə
  parolu olur, ona görə proqnozlaşdırıla bilən generator uyğun deyil.
- **Paywall** — web-də qiymət və alış düyməsi yoxdur. Abunə RevenueCat üzərindən mağaza hesabına
  bağlıdır (roadmap M3); qiymət də yazılmayıb, çünki mobildəki ₼4.99/₼39.99 roadmap-da səhv kimi
  işarələnib (brief §8 → 10 AZN/ay).
- **Reklama baxıb limit qazanmaq** — yoxdur. AdMob mobil SDK-dır.

## Hələ qalanlar

- **Söhbət tarixçəsi** — `GET /chat/conversations` bağlanmayıb; hər açılışda yeni sap başlayır
  (mobil də belədir). Web-də bu daha çox hiss olunur, çünki tab bağlamaq adi haldır.
- **Screenshot paylaşma + watermark** (roadmap M5) — viral nüvə; web-də DOM-dan şəkil çıxarmaq
  mobildən asandır.
- **ToS + Privacy səhifələri** (roadmap M4, launch blokeri).
- **Telefon + OTP ilə giriş** — hazırda hesab brauzer yaddaşına bağlıdır; yaddaş təmizlənsə
  söhbətlər əlçatmaz olur. Mobildə bu risk aşağıdır, web-də real.
