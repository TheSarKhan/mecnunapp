# Məcnun — backend

Spring Boot 3.3 · Java 21 · **Maven** · PostgreSQL 16 (pgvector) · Redis 7 · Flyway · springdoc-openapi

Paket kökü: `com.mecnun`

## İşə salmaq

### A) Hər şey konteynerdə

Repo kökündən:

```bash
docker compose up --build
```

### B) Backend host-da, DB/Redis konteynerdə

```bash
docker compose up -d postgres redis

cd backend
mvn spring-boot:run          # local profil default-dur
```

Testlər (infrastruktur tələb etmir):

```bash
mvn test
```

Jar build:

```bash
mvn clean package
java -jar target/mecnun-backend-0.1.0.jar
```

## URL-lər

- Swagger UI — http://localhost:8080/swagger-ui.html
- OpenAPI JSON — http://localhost:8080/v3/api-docs
- Health — http://localhost:8080/actuator/health
- Adminer — http://localhost:8082 (8081 Metro üçün boş saxlanılıb)

## Paket strukturu

Ayrı Maven modulları yox — tək artefakt, feature-based paketlər:

```
com.mecnun
├── auth/          JWT issuing/parsing, register/login/refresh
├── user/          profil, cinsiyyət, persona, münasibət statusu, ayarlar
├── chat/          söhbət, mesaj, mod; BotReplyGenerator (hazırda mock)
├── memory/        yaddaş faktları (pgvector sahəsi ilə)
├── subscription/  RevenueCat webhook, plan statusu
├── ads/           AdMob rewarded SSV callback
├── limits/        gündəlik mesaj sayğacı (Redis)
└── common/        error handling (ProblemDetail), security config, OpenAPI, properties
```

Hər feature paketi eyni forma daşıyır: `domain/` (entity + enum), `repository/`, `dto/`, servis və controller kök səviyyədə.

## Auth

`Authorization: Bearer <accessToken>`. `/api/v1/**` altındakı hər şey autentifikasiya tələb edir, istisnalar:

- `/api/v1/auth/**`
- `/api/v1/ads/reward-callback` (AdMob server-dən çağırır)
- `/api/v1/billing/webhook` (RevenueCat server-dən çağırır)
- `/actuator/health`, `/swagger-ui/**`, `/v3/api-docs/**`

Token-in subject-i user id-dir (UUID). `CurrentUser.id()` controller-lərdə cari istifadəçini verir.

> Bu mərhələdə auth minimaldır: identifier + parol, BCrypt. Real OTP/SMS sonrakı iterasiyadadır — token formatı dəyişməyəcək.

## Xəta formatı

Bütün xətalar RFC 7807 `ProblemDetail`-dir, əlavə `code` sahəsi ilə:

```json
{
  "type": "https://mecnun.com/problems/daily_limit_reached",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Bugünkü mesaj limitin bitib. Reklama bax və ya premium al.",
  "instance": "/api/v1/chat/messages",
  "code": "daily_limit_reached"
}
```

Mobile tərəf `detail` sahəsini göstərir, `code` üzrə branch edir.

## Baza

Flyway `src/main/resources/db/migration` altından işləyir. `V1__init.sql` `vector` extension-ını aktivləşdirir və bütün cədvəlləri yaradır.

Hibernate `ddl-auto: validate` ilə işləyir — sxem yalnız migrasiya ilə dəyişir. Yeni sahə lazımdırsa `V2__...sql` yaz, entity-ni yenilə.

`memory_facts.embedding vector(768)` sütunu sxemdə var, amma **JPA entity-də map olunmayıb** — RAG gələndə native sorğu ilə yazılıb-oxunacaq. 768 ölçü Gemini `text-embedding-004`-ə uyğundur.

## Gündəlik limit (Redis)

Cədvəl yoxdur. Açar formatı:

```
mecnun:limit:{userId}:{yyyy-MM-dd}     istifadə olunmuş mesaj sayı   (INCR, TTL 48s)
mecnun:bonus:{userId}:{yyyy-MM-dd}     reklamdan qazanılan əlavə
mecnun:rewards:{userId}:{yyyy-MM-dd}   həmin gün baxılan ad sayı
```

Tarix `mecnun.limits.timezone` (default `Asia/Baku`) üzrə hesablanır ki, limit yerli gecə yarısı sıfırlansın, UTC-də yox.

Konfiqurasiya `application.yml` → `mecnun.limits` / `mecnun.ads`.

## Profillər

| Profil | Nə vaxt | DB/Redis host |
| --- | --- | --- |
| `local` | default, host-da `mvn spring-boot:run` | `localhost` |
| `docker` | `docker compose` daxilində | `postgres` / `redis` |

## Env dəyişənləri

Bax: [kök README](../README.md#env-dəyişənləri).
