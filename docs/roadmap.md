# Development planı — brief v2-dən icraya

**Mənbə:** [mecnun_brief_v2.docx](mecnun_brief_v2.docx) (Rev 2.1, 20 iyul 2026) · **Komanda:** solo · **Hədəf:** 6 həftəlik launch

Bu sənəd brief-i əvəz etmir — onu icra addımlarına çevirir. Brief *nə* və *niyə* deyir, bu sənəd *nə vaxt* və *bitdi sayılır ki* deyir.

> **Kodun brief-dən fərqləndiyi tək yer — domen.** Brief §2.1/§13-də `mecnun.app` kilidlənib, amma sonrakı qərar **`mecnun.com`**-dur. Kod buna uyğundur (`ProblemDetail.type` → `https://mecnun.com/problems/...`, bundle id `com.mecnun.app`). Brief-in həmin iki bəndi köhnəlmiş sayılır.

---

## 1. Hazırda harda dayanmışıq

Aşağıdakıların hamısı **işlədilib yoxlanılıb**, təxmin deyil:

| Sahə | Vəziyyət |
| --- | --- |
| Infrastruktur | `docker compose up` → postgres(pgvector) + redis + backend + adminer qalxır |
| Backend | 14 endpoint canlı, Swagger işləyir, JWT auth tətbiq olunur (tokensiz → 403) |
| Sxem | Flyway V1 — bütün cədvəllər + `vector` extension; `memory_facts.embedding vector(768)` hazır (JPA-da bilərəkdən map olunmayıb) |
| Limitlər | Redis sayğacı işləyir (20/gün, Asia/Baku gecə yarısı reset) |
| Premium gate | Söyüş toggle premium olmadan `402 premium_required` qaytarır |
| Mobil | Expo SDK 54, onboarding → chat → ayarlar → yaddaş → paywall naviqasiyası işləyir, iOS bundle build olur, `tsc` təmiz |
| Dizayn | UI kit inteqrasiya olunub, tokenlər tək mənbədə |

**Brief timeline-ına görə:** həftə 1 (dizayn, repo) bitib; həftə 2–3-ün (backend core + RN skelet) **skelet hissəsi** bitib, **persona inteqrasiyası** qalıb.

**Ən vacib boşluq:** LLM yoxdur. `POST /chat/messages` hələ `mock cavab: ...` qaytarır. Məhsulun nüvəsi məhz odur — qalan hər şey onun ətrafındakı qabıqdır.

---

## 2. Brief v2 ilə fərq (gap analizi)

| Brief | Tələb | Vəziyyət |
| --- | --- | --- |
| §5.1.6 | Personanın ilk opener mesajı (statusa görə) | ✗ yoxdur |
| §5.2 | Screenshot paylaşma + watermark (viral nüvə) | ✗ yoxdur |
| §5.2 | Söyüş modu aktivləşdirmədə **əlavə 18+ təsdiq** | ✗ yoxdur (premium gate var) |
| §6.1 | Xitab matrisi (cinsiyyətə görə: ay qız/canım vs brat/qaqaş) | ✗ yoxdur (`gender` sahəsi var) |
| §6.2 | 2–3 ardıcıl qısa bubble | ✗ API tək bot mesajı qaytarır |
| §7.1 | Gemini Flash | ✗ mock (interfeys hazırdır) |
| §7.2 | Prompt kompozisiyası | ✗ yoxdur |
| §7.3 | Yaddaş: extraction → embed → top-k inject | ✗ yoxdur (sxem hazır, ekran hazır) |
| §7.4 | RAG korpus | ✗ fayllar placeholder |
| §7.5 | Safety qatı | ✗ yoxdur — **launch blokeri** |
| §7.6 | AdMob SSV imza yoxlaması | ✗ placeholder (endpoint var) |
| §7.6 | RevenueCat event mapping | ✗ placeholder (webhook var) |
| §7.8 | PostHog analitika | ✗ yoxdur |
| §7.9 | Söhbətlərin şifrələnməsi | ✗ düz mətn |
| §7.9 | ToS + Privacy | ✗ yoxdur — **launch blokeri** |
| §8 | Reklam: gündə max 3 | ✓ düzəldildi (5 idi) |
| §8 | Pulsuz limit 15–20 | ✓ 20 |
| §5.2 | Yaddaş şəffaflıq ekranı | ✓ hazır (data gözləyir) |
| §5.2 | Söyüş toggle görünür, basanda paywall | ✓ hazır |
| §7.7 | i18n koddan ayrı | ✓ hazır |
| §2.4 | Monoxrom, inversiya ilə mod fərqi | ✓ hazır |

---

## 3. Milestone-lar

Ardıcıllıq təsadüfi deyil: **M1 olmadan M2 mənasızdır** (fakt çıxarma özü LLM çağırışıdır), **M1 olmadan M3-ü test etmək çətindir** (ödənişə dəyər məhsul olmalıdır ki, abunə axını real görünsün).

---

### M1 — Persona və LLM nüvəsi ← **indi burdayıq**
*Brief §6, §7.1, §7.2 · timeline həftə 2–3-ün qalanı*

Mock cavabı real Gemini Flash ilə əvəzləyirik və personaya səs veririk.

**İşlər**
1. `PromptRepository` — `/ai` fayllarını yükləyən tək nöqtə. **Bu, `ai/README.md`-dəki açıq sualı bağlayır:** build-time kopyalama (`maven-resources-plugin`) əsas yol, lokal profildə qovluqdan oxuma ilə override — prompt iterasiyası restart-sız getsin.
2. `PromptComposer` — brief §7.2-nin birbaşa tərcüməsi: `persona + xitab parametrləri + mod təlimatı + söyüş bayrağı + [yaddaş: M2] + [korpus: M2] + son N mesaj`.
3. **Persona promptlarının real yazılması** — `ai/personas/leyli.md`, `mecnun.md`. Hazırda skeletdirlər. Ortaq qaydalar (format, qırmızı xətlər) `_shared.md`-ə çıxır.
4. **Xitab matrisi** — `Gender` → xitab dəsti, prompt parametri kimi. Persona xitabı yox, üslubu dəyişir.
5. **Çox-bubble cavab** — `SendMessageResponse.botMessage` → `botMessages: MessageDto[]`. Bu, **API qıran dəyişiklikdir**; mobil `chatStore` və `types.ts` eyni commit-də yenilənir.
6. **Opener mesajı** — yeni conversation yaradılanda persona statusa uyğun ilk mesajı atır (brief §5.1.6 nümunəsi).
7. Model konfiqurasiyası: model adı, timeout, retry, xərc tavanı (brief §10: $0.1–0.5/ay/istifadəçi).
8. Copy tonu: `az.json`-da `COMPLICATED` → "qəlizdir 😅" (brief §5.1.5 tonu), limit ekranı → "Bu günlük məcnunluq bəsdir 😌 Sabah davam" (brief §2.3).

**Bitdi sayılır ki**
- Real cavab gəlir, `mock` sözü kodda qalmır
- Leyli və Məcnun **eyni suala nəzərəçarpan fərqli** cavab verir
- Qeybət modu açıq şəkildə tərəf tutur, chat modu balanslıdır
- Söyüş bayrağı ON/OFF cavabın leksikasını dəyişir
- Qadın/kişi istifadəçi fərqli xitab alır
- Bir cavab 2–3 bubble kimi gəlir
- Yeni istifadəçi chat-ı açanda persona artıq yazıb

**Risklər** — Gemini-nin azərbaycanca keyfiyyəti prompt-a çox həssasdır; "quru ChatGPT azərbaycancası" ilə "canlı Bakı danışığı" arasındakı fərq bu milestone-un əsl işidir, kod deyil. Buna **prompt iterasiyası üçün ayrıca vaxt** ayrılmalıdır.

---

### M2 — Yaddaş v1 (RAG)
*Brief §7.3, §7.4 · timeline həftə 4*

**İşlər**
1. **Extraction tetiyi (qərar verilib):** arxa planda hər **10 mesajdan bir** + söhbət **30 dəqiqə sakitləşəndə** qalanı yığan `@Scheduled` sweep. İstifadəçiyə görünən "sessiya" anlayışı yoxdur — ChatGPT-dəki kimi. Çıxarma cavab axınından ayrıdır, cavabı gözlətmir.
2. Extraction promptu — strukturlu JSON: ex adı, münasibət statusu, açar hadisələr, təkrarlanan mövzular, emosional vəziyyət.
3. Embedding (`text-embedding-004`, 768 — sxem artıq buna görə qurulub).
4. `MemoryFactRepository`-yə native pgvector sorğusu: `ORDER BY embedding <=> :q LIMIT k`.
5. Top-k faktın `PromptComposer`-ə inject olunması.
6. RAG korpusunun doldurulması: sleng lüğəti, ssenarilər, atalar sözləri + mövzu detektoru.
7. Dublikat faktların qarşısının alınması (mövcud faktlar extraction promptuna verilir).

**Bitdi sayılır ki** — 3 sessiyalıq söhbətdən sonra bot əvvəlki sessiyanın detalını təbii şəkildə xatırlayır; "Necə tanıyır?" ekranı real faktlarla dolur; silmə həqiqətən unutdurur.

**Risk** — ivfflat indeksi boş cədvəldə faydasızdır; data yığılandan sonra `REINDEX` lazım olacaq.

---

### M3 — Monetizasiya
*Brief §7.6, §8 · timeline həftə 4*

**İşlər**
1. RevenueCat webhook: imza yoxlaması + `INITIAL_PURCHASE / RENEWAL / CANCELLATION / EXPIRATION` → `Subscription`.
2. Mobil: `react-native-purchases`, offerings-dən dinamik qiymət (paywall hazırda statik "₼39.99/₼4.99" göstərir — brief §8 **10 AZN/ay** deyir, düzəliş burada).
3. AdMob SSV: ECDSA imza yoxlaması, `verifier-keys.json` cache-i, `key_id` üzrə açar seçimi. Replay qoruması artıq var (`transaction_id` unique).
4. Mobil: `react-native-google-mobile-ads` rewarded axını.
5. Premium limiti 500/gün tavan olaraq qalır (qərar verilib, §6) — marketinqdə "limitsiz".

**Bitdi sayılır ki** — sandbox alışı premium açır və söyüş toggle-ı işə salır; reklama baxış limiti gündə max 3 dəfə artırır; imzasız SSV çağırışı **rədd olunur**.

---

### M4 — Safety, hüquq, analitika
*Brief §7.5, §7.8, §7.9 · timeline həftə 5 · **launch blokeri***

**İşlər**
1. **Kriz detektoru** — keyword + model əsaslı, hər modda aktiv, söyüş modundan asılı deyil.
2. Safety cavab şablonu + **lokal AZ dəstək resursları** (real nömrələr — ayrıca araşdırma tələb edir).
3. Qırmızı xətlərin test dəsti: izləmə/intiqam/hesab sındırma sorğularına personanın imtinası (brief §6.3).
4. Söhbətlərin şifrələnməsi (bax: açıq qərar §5).
5. ToS + Privacy Policy (AZ) — LLM provayderinə gedən data barədə şəffaf bənd.
6. PostHog + brief §7.8-dəki hadisə siyahısı.

**Bitdi sayılır ki** — kriz ifadələrinin test dəsti **100%** safety yoluna düşür (bu, "əksəriyyət" qəbul etməyən yeganə metrikadır); söyüş modu ON ikən də düşür; hesab silmə hər şeyi silir.

---

### M5 — Viral mexanizm
*Brief §5.2, §9 · timeline həftə 5*

Screenshot paylaşma + "məcnun" watermark-ı. Brief bunu **v1 scope**-una salıb və GTM-in nüvəsi kimi qeyd edib (§9: "istifadəçi reklamı özü yayır") — buna görə backlog deyil.

**Bitdi sayılır ki** — söhbətin seçilmiş hissəsi watermark-lı şəkil kimi paylaşılır və şəkil oxunaqlıdır (monoxrom dizayn burada üstünlükdür).

---

### M6 — Beta və store
*Brief §14 · timeline həftə 6*

Brief §14 checklist-i olduğu kimi icra olunur: store assets, content rating, Apple review qeydləri (AI chat təbiəti + safety qatı + test hesabı), SSV canlı, kriz resursları, silmə axınlarının testi.

Əvvəlində **internal beta 10–15 nəfər** — brief §9-dakı ardıcıllıq.

---

## 4. Launch blokerləri

Bunlar bitmədən store submission mənasızdır:

1. **Safety qatı** (M4) — Apple/Google review-un AI chat üçün ilk baxdığı yer
2. **ToS + Privacy** (M4) — brief §7.9-da açıq "launch blokeridir" yazılıb
3. **Content rating 17+/18+** (M6)
4. **SSV endpoint canlı + sandbox billing testi** (M3/M6)
5. **Kriz resursları siyahısı** (M4) — lokal, real nömrələr

---

## 5. Açıq qərarlar

Qərar veriləndə bu bölmədən silinir və §6-ya yazılır.

| # | Sual | Niyə vacibdir | Nə vaxt lazımdır |
| --- | --- | --- | --- |
| 1 | **Şifrələmə üsulu** — sütun səviyyəsində (axtarış itir, açar idarəsi lazım) yoxsa disk/at-rest (sadə, amma DB-yə çıxışı olan görür)? | Brief §7.9 "şifrəli" deyir, üsulu demir | M4 |
| 2 | **`MARRIED` statusu** — brief 4 status sadalayır (subay/münasibətdə/yeni ayrılıb/qəlizdir), kodda 6 var | Kiçik, amma onboarding copy-sinə təsir edir | M1 copy passında |
| 3 | **mecnun.com qeydiyyatı + @mecnun handle-ları** | Brief §13-də açıq iş; store submission-a qədər lazımdır | M6-dan əvvəl |

---

## 6. Qərar jurnalı (kod tərəfi)

Brief §13 məhsul qərarlarını saxlayır; bu, texniki qərarları saxlayır. Səbəbləri [architecture.md](architecture.md)-dədir.

- **Domen `mecnun.com`** — brief §2.1/§13-dəki `mecnun.app` əvəzlənib
- **Yaddaş çıxarma tetiyi: "ChatGPT kimi" — istifadəçiyə görünən sessiya anlayışı yoxdur.** Arxa planda hər **10 mesajdan bir**, üstəgəl söhbət **30 dəqiqə sakitləşəndə** qalanı yığan planlaşdırılmış sweep. Çıxarma cavab axınından tam ayrıdır — cavabın sürətinə təsir etmir. Rədd edilən alternativ: hər mesajdan sonra çıxarma — LLM xərcini iki qat edirdi, yaddaşın keyfiyyətini isə nəzərəçarpan dərəcədə artırmırdı
- **Premium limiti: 500/gün tavan qalır.** Brief §8 "limitsiz" deyir; tavan istifadəçi üçün praktiki olaraq görünməzdir (ortalama sessiya hədəfi 8 mesajdır) və abuse/xərc partlayışına qarşı yeganə qoruyucudur. Marketinq mətnində "limitsiz" qalır — bu, texniki tavandır, məhsul vədi deyil
- **Reklam limiti gündə 3** — brief §8-ə uyğunlaşdırıldı (5 idi)
- **Expo SDK 54** — ən son SDK yox; köhnə iPhone-larda Expo Go uyğunsuzluğuna görə. Development build-ə keçəndə qalxa bilər
- **Adminer portu 8082** — 8081 Metro-nundur
- **Maven, Gradle yox**
- **Tək artefakt, feature-based paketlər** — modula ayırmaq üçün sərhədlər hazırdır
- **Limit Redis-də, cədvəldə yox** — `INCR` + TTL, Asia/Baku tarixi ilə
- **`embedding` JPA-da map olunmayıb** — native pgvector sorğusu M2-də
- **Anonim cihaz hesabı** — dizaynda giriş ekranı yoxdur; telefon+OTP gələndə "hesabı yüksəlt" axınına çevrilir
