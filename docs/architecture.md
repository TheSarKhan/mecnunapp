# Arxitektura qeydləri

Bootstrap mərhələsində verilmiş qərarlar və onların səbəbləri. Qərar dəyişəndə burada yenilə.

## Ümumi forma

```
Expo (RN/TS)  ──HTTPS──>  Spring Boot  ──>  PostgreSQL 16 + pgvector   (istifadəçi, söhbət, yaddaş)
                                       ──>  Redis 7                    (gündəlik limit sayğacı)
                                       ──>  Gemini API                 (cavab + embedding — hələ qoşulmayıb)
                          RevenueCat  ──webhook──>  Spring Boot
                          AdMob SSV   ──callback─>  Spring Boot
```

Mobile heç vaxt LLM-ə birbaşa getmir — açar backend-də qalır, limit və persona məntiqi bir yerdə olur.

## Qərarlar

### Maven, Gradle yox
Spring Boot ekosistemində konfiqurasiya azdır, Docker multi-stage build-də `dependency:go-offline` ilə cache davranışı proqnozlaşdırılandır.

### Tək artefakt, feature-based paketlər
Ayrı Maven modulları bu ölçüdə yalnız yavaşlıq gətirər. Sərhədlər paket səviyyəsindədir (`auth`, `chat`, `memory`, ...) — modula ayırmaq lazım olsa sərhədlər artıq yerindədir.

### Gündəlik limit Redis-də, cədvəldə yox
Sayğac hər mesajda yazılır və gündəlik atılır — bu, relational baza üçün yanlış iş yüküdür. `INCR` + TTL atomik və ucuzdur.

Tarix `Asia/Baku` üzrə hesablanır, UTC üzrə yox: istifadəçi üçün "limit gecə yarısı sıfırlanır" yerli gecə yarısı deməkdir.

### `embedding` sütunu JPA-da map olunmayıb
`vector(768)` Hibernate-in bildiyi tip deyil. Sxemdə var (Flyway), amma entity-də yoxdur — RAG gələndə `MemoryFactRepository`-yə native `@Query` əlavə olunacaq (`ORDER BY embedding <=> :queryEmbedding LIMIT k`). JPA-nı süni tiplərlə əyməkdənsə bu sərhəd təmizdir.

768 ölçü Gemini `text-embedding-004`-ə uyğundur. Model dəyişsə → yeni migrasiya + bütün faktların yenidən embed olunması.

### `BotReplyGenerator` interfeys kimi
`ChatService` LLM-dən xəbərsizdir. `MockBotReplyGenerator` echo qaytarır; Gemini implementasiyası ikinci `@Component` kimi gələcək. Söhbətin saxlanması, limitin yeyilməsi, transaksiya sərhədi — hamısı artıq işləyir və dəyişməyəcək.

### Anonim cihaz hesabı
Dizaynda giriş ekranı yoxdur — onboarding-dən birbaşa chat-a keçilir. Ona görə `ProfileSetupScreen` arxa planda `device-<random>@mecnun.local` identifikatoru ilə qeydiyyatdan keçir və şifrəni `AsyncStorage`-də saxlayır.

Nəticə: hesab cihaza bağlıdır — app silinsə itir. Telefon + OTP girişi gələndə bu, "anonim hesabı yüksəlt" axınına çevriləcək.

### `ProblemDetail` (RFC 7807) + `code`
Standart sahələr + bizim `code` sahəsi. Mobile `detail`-i istifadəçiyə göstərir, `code` üzrə branch edir (`daily_limit_reached` → paywall, `premium_required` → paywall).

### Naviqasiyada `initialRouteName` yoxdur
Stack-də hansı ekranların olduğu `ready`/`onboarded` flag-larından asılıdır, ilk ekran isə avtomatik giriş nöqtəsidir. Bu, `navigate`/`reset` çağırışlarını tamamilə aradan qaldırır və "geri" düyməsi ilə onboarding-ə qayıtmaq mümkün olmur.

## Açıq suallar

- **`/ai` faylları backend-ə necə çatır?** Build-time kopyalama, yoxsa runtime mount? Bax: [ai/README.md](../ai/README.md).
- **Yaddaş çıxarma nə vaxt işləyir?** Hər mesajdan sonra (bahalı) yoxsa N mesajdan bir / söhbət bitəndə (ucuz, gecikməli)?
- **Qeybət modu ayrı söhbətdirmi?** Hazırda bəli — mod dəyişəndə yeni thread. Alternativ: tək söhbət, mod mesaj səviyyəsində atribut.
- **Premium limiti nə olsun?** Hazırda 500/gün abuse tavanı kimi. Real "limitsiz" olmalıdırmı?

## Verilməmiş, amma lazım olacaq qərarlar

- Rate limiting (limit sayğacından ayrı — IP səviyyəsində abuse qoruması)
- Söhbət tarixçəsinin saxlanma müddəti (GDPR/istifadəçi gözləntisi)
- Push notification (Expo Notifications vs FCM birbaşa)
- Observability (hazırda yalnız `actuator/health`)
