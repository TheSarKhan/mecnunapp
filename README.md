# Məcnun

Azərbaycan dilində münasibət mövzusunda dərdləşmək üçün AI yoldaş. İki persona (**Leyli** / **Məcnun**), iki mod (**söhbət** / **qeybət**), uzunmüddətli yaddaş, freemium model.

> **Status: bootstrap skeleton.** Hər şey ayağa qalxır və uçdan-uca işləyir, amma AI cavabları hələ mock-dur (`mock cavab: ...`). Gemini inteqrasiyası, RAG, RevenueCat və AdMob imza yoxlaması növbəti iterasiyalardadır.

## Repo strukturu

```
mecnun/
├── backend/            # Spring Boot 3.3 · Java 21 · Maven
├── mobile/             # React Native (Expo SDK 57) · TypeScript
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

> Port `8081` bilərəkdən boş saxlanılıb — `expo start` onu default olaraq istifadə edir.

Dayandırmaq: `docker compose down`. Bazanı da silmək: `docker compose down -v`.

### Sürətli yoxlama

```bash
curl http://localhost:8080/actuator/health
# {"status":"UP",...}

# Qeydiyyat → token
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"+994501234567","password":"parol123"}'

# Mesaj göndər (yuxarıdakı accessToken ilə)
curl -X POST http://localhost:8080/api/v1/chat/messages \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <accessToken>' \
  -d '{"mode":"CHAT","content":"salam"}'
# -> botMessage.content = "mock cavab: salam"
```

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
| `GEMINI_API_KEY` | LLM cavabları + embedding | boş (hələ istifadə olunmur) |
| `REVENUECAT_WEBHOOK_SECRET` | Webhook imza yoxlaması | boş (placeholder) |
| `ADMOB_SSV_PUBLIC_KEY` | Rewarded ad SSV imzası | boş (placeholder) |

### Mobile

| Dəyişən | Nəyə lazımdır |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Backend base URL (`/api/v1` kod tərəfindən əlavə olunur) |

---

## Növbəti addımlar

1. Gemini inteqrasiyası — `BotReplyGenerator`-un real implementasiyası, persona promptları ilə.
2. Yaddaş pipeline-ı — fakt çıxarma → embedding → `memory_facts` → RAG ilə geri çəkmə.
3. RevenueCat webhook-unun real işlənməsi + mobile-da `react-native-purchases`.
4. AdMob SSV imza yoxlaması + rewarded ad-ın mobile inteqrasiyası.
5. Telefon + OTP ilə giriş (hazırda onboarding anonim cihaz hesabı yaradır).

Arxitektura qərarları və detallar: [docs/architecture.md](docs/architecture.md).
