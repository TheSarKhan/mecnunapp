# Deployment

**Server:** `173.249.54.197` (Ubuntu 24.04) · **Qovluq:** `/opt/mecnun` · **Domen:** `mecnun.sarkhan.az` (Cloudflare arxasında)

| Nə | Ünvan |
| --- | --- |
| Web | https://mecnun.sarkhan.az |
| Backend API | https://mecnun.sarkhan.az/api/v1 |
| Mobil `EXPO_PUBLIC_API_URL` | `https://mecnun.sarkhan.az` |

Konteyner portları (`8090`, `3100`) yalnız `127.0.0.1`-ə bağlıdır — **birbaşa IP:port ilə giriş
yoxdur.** Yeganə açıq qapı nginx-dir; belə olmasa IP ilə həm HTTPS-i, həm Cloudflare-i keçmək
olardı.

---

## 1. Bu server tək bizim deyil

Maşında **başqa 4 layihə** işləyir: `starsoft`, `fanus`, `fintech`, `testup`. Buradakı hər
konfiqurasiya qərarı ondan çıxır ki, onlara dəyilməsin:

| Qərar | Səbəb |
| --- | --- |
| Compose layihə adı `name: mecnun` | Volume/şəbəkə adları bununla prefikslənir; başqa stack-in resursuna dəymir |
| Backend `8090`, web `3100` | `8080` starsoft-un, `8081` bir java prosesinin, `8085` fintech-in, `3000` başqa Next app-ındır |
| Postgres/Redis host portu **yoxdur** | `5432/5433/5440` və `6379/6380/6390` artıq tutulub — üstəlik bazanı internetə açmağın səbəbi yoxdur |
| Adminer prod-da **yoxdur** | Dev alətidir; açıq qoyulsa internetdə parolsuz DB konsoludur |
| nginx-ə **toxunulmayıb** | 80/443-də `fintrack`, `khansoft.az`, `starsoft.az` var |

**Qonşu konteynerə heç vaxt `docker compose down`, `docker system prune` və ya `docker stop`
işlətmə.** Həmişə `-f docker-compose.prod.yml` və servis adı ilə işlə.

## 2. Profil: `prod`, `docker` yox

`SPRING_PROFILES_ACTIVE=prod`. `docker` profilində `seed-test-user: true` var — bilinən parollu
hesab yaradır. Lokalda faydalıdır, açıq serverdə isə hər kəsin girə bildiyi canlı hesabdır.
`application-prod.yml` həm də log səviyyəsini `DEBUG`→`INFO` endirir: DEBUG-da istifadəçi
mesajları və prompt məzmunu log-a düşür.

## 3. Serverdəki `.env`

`/opt/mecnun/.env` (chmod 600) — **repoya düşmür, deploy zamanı üzərinə yazılmır.**
`POSTGRES_PASSWORD` və `JWT_SECRET` serverdə `openssl rand` ilə generasiya olunub.

```
BACKEND_PORT=8090
WEB_PORT=3100
POSTGRES_PASSWORD=<generasiya olunub>
JWT_SECRET=<generasiya olunub>
GEMINI_API_KEY=...
GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_API_URL=http://173.249.54.197:8090
CORS_ALLOWED_ORIGINS=http://173.249.54.197:3100
```

> `NEXT_PUBLIC_API_URL` **build zamanı** bundle-a həkk olunur. Dəyişdirsən konteyneri restart
> etmək kifayət etmir — `--build` ilə image yenidən qurulmalıdır.
>
> `JWT_SECRET` dəyişsə bütün mövcud tokenlər etibarsız olur; anonim cihaz hesabları saxlanmış
> açarlarla yenidən girir, amma hamı bir dəfə "çıxmış" olur.

## 3.5 Domen, nginx və TLS

`/etc/nginx/sites-available/mecnun.sarkhan.az` — **tək hostname**, `api.*` alt-domeni yoxdur:

- `/api/` → `127.0.0.1:8090` (backend)
- `/` → `127.0.0.1:3100` (web)

**Niyə tək hostname:** Cloudflare-in pulsuz Universal SSL-i yalnız bir səviyyə alt-domeni örtür
(`*.sarkhan.az`), `api.mecnun.sarkhan.az` örtülməzdi. Üstəlik eyni origin olduğu üçün brauzer
tərəfdə CORS ümumiyyətlə iştirak etmir.

**80 → 443 yönləndirməsi qəsdən yoxdur.** Cloudflare SSL rejimi "Flexible"dırsa CF origin-ə
80-dən gəlir və redirect sonsuz döngə yaradır. HTTPS-i Cloudflare tərəfdə **"Always Use HTTPS"**
məcbur etməlidir.

**ModSecurity qoşulmayıb** (qonşu saytlardan fərqli): söhbət tətbiqidir, istifadəçi mətni sərbəst
formadadır və OWASP CRS belə mətndə müntəzəm yalançı pozitiv verir.

### Sertifikat

`/etc/ssl/mecnun/` — private açar **serverdə yaradılıb və oradan çıxmır**.

| Fayl | Nədir |
| --- | --- |
| `origin.key` | Private açar (chmod 600) |
| `origin.csr` | Cloudflare Origin CA-ya verilən sorğu |
| `fullchain.pem` | Sertifikat |

Hazırda `fullchain.pem` **müvəqqəti self-signed**-dır — sayt işləsin deyə. Cloudflare-də
SSL rejimi **"Full"** olmalıdır; **"Full (strict)" bu sertifikatla İŞLƏMƏZ.**

Kalıcı həll (Cloudflare → SSL/TLS → Origin Server → Create Certificate → "Use my own private key
and CSR", `origin.csr` məzmununu yapışdır):

```bash
# Cloudflare-in verdiyi sertifikatı serverə yaz (bu, gizli məlumat deyil):
nano /etc/ssl/mecnun/fullchain.pem
nginx -t && systemctl reload nginx
# Sonra Cloudflare-də SSL rejimini "Full (strict)"-ə keçir.
```

## 4. Əl ilə deploy

```bash
ssh root@173.249.54.197
cd /opt/mecnun
docker compose -f docker-compose.prod.yml up -d --build          # hamısı
docker compose -f docker-compose.prod.yml up -d --build backend   # yalnız backend
docker compose -f docker-compose.prod.yml logs -f backend
```

## 5. CI/CD (GitHub Actions)

Hər qovluq üçün ayrı workflow, `paths` filtri ilə:

| Workflow | Tetik | Nə edir |
| --- | --- | --- |
| `backend.yml` | `backend/**`, `ai/**` | `mvn verify` → main-də: rsync + `--build backend` + health gözləmə |
| `frontend.yml` | `frontend/**` | typecheck + lint + build → main-də: rsync + `--build web` + HTTP yoxlama |
| `mobile.yml` | `mobile/**` | `tsc --noEmit` |

`ai/**` backend-ə bağlıdır, çünki promptlar backend image-inə kopyalanır.

### Lazım olan GitHub secret-ləri

Repo → Settings → Secrets and variables → Actions:

| Secret | Dəyər |
| --- | --- |
| `DEPLOY_HOST` | `173.249.54.197` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_SSH_KEY` | `~/.ssh/mecnun-deploy/id_ed25519` faylının **tam məzmunu** (private key) |

Açar cütü artıq yaradılıb və public hissəsi serverin `authorized_keys`-inə əlavə olunub.
Private key-i əlavə etmək üçün:

```bash
cat ~/.ssh/mecnun-deploy/id_ed25519      # çıxanı olduğu kimi secret-ə yapışdır
```

### İki tələ

1. **`paths` filtri + "required status check" PR-ları əbədi bloklayır.** İşə düşməyən workflow
   "skipped" kimi report olunmur — ümumiyyətlə report olunmur, GitHub isə gözləyir. Bu
   workflow-ları required etmə, ya da həmişə işə salıb addımları daxildə atlat.
2. **`concurrency: deploy-server`** hər iki deploy job-unda eynidir — backend və frontend eyni
   anda serverdə build etməsin (7.8Gi RAM-lı maşındır).

## 6. Açıq risklər

- **Origin sertifikatı hələ self-signed-dır** — Cloudflare "Full (strict)"-ə keçmək üçün
  yuxarıdakı Origin CA addımı tamamlanmalıdır. Hazırkı "Full" rejimində brauzer↔Cloudflare
  şifrəlidir, Cloudflare↔origin də şifrəlidir, amma origin sertifikatı yoxlanılmır.
- **Root parolu söhbətdə paylaşılıb** — dəyişdirilməlidir. Deploy artıq açarla işləyir, ona görə
  parolu dəyişmək heç nəyi sındırmır. Daha yaxşısı: `PasswordAuthentication no`.
- **Backup yoxdur.** `mecnun_postgres-data` volume-u yaddaş faktlarını və söhbətləri saxlayır.
- **Swap yoxdur** (7.8Gi RAM, 5 layihə). Backend build-i pik anda yaddaş yeyir.
