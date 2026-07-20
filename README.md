# Məcnun

Azərbaycan dilində münasibət mövzusunda dərdləşmək üçün AI yoldaş. İki persona (**Leyli** / **Məcnun**), iki mod (**söhbət** / **qeybət**), uzunmüddətli yaddaş, freemium model.

> **Status: bootstrap skeleton.** Hər şey ayağa qalxır və uçdan-uca işləyir, amma AI cavabları hələ mock-dur (`mock cavab: ...`). Gemini inteqrasiyası, RAG, RevenueCat və AdMob imza yoxlaması növbəti iterasiyalardadır.

## Repo strukturu

```
mecnun/
├── backend/            # Spring Boot 3.3 · Java 21 · Maven
├── mobile/             # React Native (Expo SDK 54) · TypeScript
├── frontend/           # Web app (Next.js 16 · Tailwind v4) — mobil axının brauzer qabığı
├── ai/                 # persona promptları, RAG korpus, yaddaş şablonları
├── docs/               # brief, arxitektura, dizayn tokenləri + UI kit
└── docker-compose.yml  # postgres(pgvector) + redis + backend + adminer
```

Build sistemi: **Maven** (Gradle yox). Səbəb — Spring Boot ekosistemində daha az konfiqurasiya, Docker multi-stage build-də daha proqnozlaşdırılan cache davranışı.

---

## 1. Hər şeyi qaldır (ən sürətli yol)

Tələb olunan: **Docker Desktop**. Başqa heç nə — Java/Maven host-da lazım deyil.

```bash
docker compose up --build
```

İlk build ~3–5 dəqiqə çəkir (Maven dependency-ləri yüklənir). Sonra:

| Nə | URL |
| --- | --- |
| **Swagger UI** | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |
| Health check | http://localhost:8080/actuator/health |
| Adminer (DB) | http://localhost:8082 — server `postgres`, user/pass/db hamısı `mecnun` |

**Host portları:**

| Servis | Host portu | Niyə |
| --- | --- | --- |
| backend | `8080` (`BACKEND_PORT` ilə dəyişilir) | — |
| postgres | `5433` | 5432 çox vaxt başqa layihə tərəfindən tutulur |
| redis | `6380` | 6379 üçün eyni səbəb |
| adminer | `8082` | `8081` Metro-nundur (`expo start`) |

Konteynerlər öz aralarında **daxili** portlarla (5432/6379/8080) danışır — yuxarıdakılar yalnız host tərəfidir. 8080 məşğuldursa: `BACKEND_PORT=8090 docker compose up` (və ya kök `.env`-ə yaz).

Dayandırmaq: `docker compose down`. Bazanı da silmək: `docker compose down -v`.

### Sürətli yoxlama

```bash
curl http://localhost:8080/actuator/health
# {"status":"UP",...}

# Qeydiyyat → token
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"+994501234567","password":"parol123"}'

# Söhbəti aç — ilk mesajı persona özü atır, gündəlik limitdən yemir
curl -X POST http://localhost:8080/api/v1/chat/conversations \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <accessToken>' \
  -d '{"mode":"QEYBET"}'

# Mesaj göndər — cavab 1–3 bubble kimi gəlir (botMessages massivi)
curl -X POST http://localhost:8080/api/v1/chat/messages \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <accessToken>' \
  -d '{"mode":"CHAT","content":"salam"}'
```

> `GEMINI_API_KEY` qurulmayıbsa cavablar **mock** olur və start-da xəbərdarlıq loglanır — app yenə də işləyir.

---

## 2. Backend-i ayrıca işə salmaq

Tələb: **JDK 21** + **Maven 3.9+**.

```bash
# Yalnız infrastruktur konteynerdə qalsın
docker compose up -d postgres redis

cd backend
mvn spring-boot:run
```

`local` profil default-dur və `localhost:5432` / `localhost:6379`-a bağlanır. Ətraflı: [backend/README.md](backend/README.md).

## 3. Mobile-ı işə salmaq

Tələb: **Node 20+**.

```bash
cd mobile
npm install
cp .env.example .env     # EXPO_PUBLIC_API_URL-i qur (aşağıya bax)
npx expo start
```

Sonra terminaldakı QR kodu **Expo Go** ilə skan et, ya da `a` (Android emulator) / `i` (iOS simulator) bas.

**Vacib — API URL:** `localhost` telefonun özünü göstərir, kompüteri yox.

| Harada işlədirsən | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS simulator | `http://localhost:8080` |
| Android emulator | `http://10.0.2.2:8080` |
| Fiziki cihaz (Expo Go) | `http://<kompüterin-LAN-IP>:8080` |

Ətraflı: [mobile/README.md](mobile/README.md).

## 4. Web-i işə salmaq

Tələb: **Node 20.9+**.

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

→ http://localhost:3000. Mobildən fərqli olaraq brauzer `localhost`-u kompüterin özü kimi görür,
ona görə default dəyər olduğu kimi işləyir.

Backend CORS-u default `http://localhost:3000`-a icazə verir; başqa origin lazımdırsa
`CORS_ALLOWED_ORIGINS`-i qur. Ətraflı: [frontend/README.md](frontend/README.md).

---

## Env dəyişənləri

Hamısının dev üçün default dəyəri var — `docker compose up` heç bir `.env` olmadan işləyir. Prod-da hamısı verilməlidir.

### Backend

| Dəyişən | Nəyə lazımdır | Dev default |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Postgres JDBC URL | `jdbc:postgresql://postgres:5432/mecnun` |
| `SPRING_DATASOURCE_USERNAME` | DB user | `mecnun` |
| `SPRING_DATASOURCE_PASSWORD` | DB parol | `mecnun` |
| `SPRING_REDIS_HOST` | Redis host | `redis` |
| `SPRING_REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | Token imzası (HS256, **≥32 bayt**) | dev secret — **prod-da mütləq dəyiş** |
| `GEMINI_API_KEY` | LLM cavabları + (M2) embedding | boş → **mock cavablar**, app yenə işləyir |
| `GEMINI_MODEL` | İstifadə olunan model | `gemini-2.0-flash` |
| `MECNUN_AI_DIR` | Promptları fayl sistemindən oxu (hot reload) | boş → classpath; `local` profildə `../ai` |
| `BACKEND_PORT` | Backend-in host portu | `8080` |
| `CORS_ALLOWED_ORIGINS` | Web klientinə icazə verilən origin-lər (vergüllə) | `http://localhost:3000` |
| `REVENUECAT_WEBHOOK_SECRET` | Webhook imza yoxlaması | boş (placeholder) |
| `ADMOB_SSV_PUBLIC_KEY` | Rewarded ad SSV imzası | boş (placeholder) |

### Mobile

| Dəyişən | Nəyə lazımdır |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend base URL (`/api/v1` kod tərəfindən əlavə olunur) |

### Web

| Dəyişən | Nəyə lazımdır |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (`/api/v1` kod tərəfindən əlavə olunur) |

---

## Növbəti addımlar

1. Gemini inteqrasiyası — `BotReplyGenerator`-un real implementasiyası, persona promptları ilə.
2. Yaddaş pipeline-ı — fakt çıxarma → embedding → `memory_facts` → RAG ilə geri çəkmə.
3. RevenueCat webhook-unun real işlənməsi + mobile-da `react-native-purchases`.
4. AdMob SSV imza yoxlaması + rewarded ad-ın mobile inteqrasiyası.
5. Telefon + OTP ilə giriş (hazırda onboarding anonim cihaz hesabı yaradır).

Arxitektura qərarları və detallar: [docs/architecture.md](docs/architecture.md).

---

## Canlı mühit

| Nə | Ünvan |
| --- | --- |
| Web | https://mecnun.sarkhan.az |
| Backend API | https://mecnun.sarkhan.az/api/v1 |
| Mobil `EXPO_PUBLIC_API_URL` | `https://mecnun.sarkhan.az` |

Tək hostname-dir: nginx `/api/` yolunu backend-ə, qalanını web-ə ötürür — ona görə brauzer
tərəfdə CORS iştirak etmir. Server bir neçə başqa layihəni də daşıyır; port seçimi, "qonşuya
dəymə" qaydaları, Cloudflare/TLS və CI/CD secret-ləri: [docs/deployment.md](docs/deployment.md).
