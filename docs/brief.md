# Brief — kod üçün çıxarış

> **Əsas sənəd:** [mecnun_brief_v2.docx](mecnun_brief_v2.docx) (Rev 2.1, 20 iyul 2026). Ziddiyyət olsa **o qalib gəlir**, bu fayl yox.
>
> Bu fayl brief-in yalnız **koda birbaşa toxunan** hissələrinin çıxarışıdır ki, işləyəndə docx açmaq lazım gəlməsin. İcra planı: [roadmap.md](roadmap.md).

## Positioning

**İstifadəçi məcnundur** — app məcnunların gəlib danışdığı yerdir. "Ex səni məcnun edib? Gəl danışaq."

Fərqləndirici üç şey: canlı danışıq azərbaycancası · tərəf tutan persona · istifadəçini yadda saxlayan yaddaş.

İlkin bazar AZ (18–30, şəhər, unisex). Faza 2 TR — launch-dan ~3 ay sonra.

## Personalar (kilidli)

| Persona | Xarakter |
| --- | --- |
| **Leyli** | isti, empatik, amma sözünü birbaşa deyən — lazım olanda "otur yerində" deyir |
| **Məcnun** | zarafatcıl, "qaqaş" enerjisi, birbaşa danışan |

Brend adı ilə kişi personanın adı qəsdən üst-üstə düşür — əfsanənin özü onboarding-dir.

**Xitab personadan yox, istifadəçinin cinsiyyətindən asılıdır:**

| İstifadəçi | Xitablar |
| --- | --- |
| Qadın | ay qız, canım, bacım |
| Kişi | brat, qaqaş, qardaş |

## Brend səsi

- Öz dramına gülür, istifadəçini **heç vaxt** ələ salmır
- Qısa yazır — dost yazışması ritmi, mühazirə yox; bəzən 2–3 ardıcıl qısa bubble
- Tərəf tutur, amma zərərli hərəkətə itələmir
- **Pafos və klişe qadağandır** — "hər şey yaxşı olacaq" tipli cümlələr yoxdur
- Bakı slengi, rusizmlərə icazə ("prosta", "davay", "voobşe"); emoji təbii dozada

Ton kalibri: limit ekranı — *"Bu günlük məcnunluq bəsdir 😌 Sabah davam"* · qeybət girişi — *"Burda ex-in tərəfini heç vaxt tutmuram. Danış."*

## Qırmızı xətlər (bütün modlarda, söyüş modundan asılı deyil)

- Real şəxsə qarşı hərəkət planı **yoxdur**: izləmə, intiqam, hesab sındırma, ünvan tapma. Yalnız emosional müstəvi.
- Kriz siqnallarında persona yumşalır, safety yoluna keçir.
- Tərəf tutmaq ≠ hər şeyi təsdiqləmək.

## Modlar

| Mod | Davranış |
| --- | --- |
| **Chat** | ümumi münasibət söhbəti — dinləmə, dəyərləndirmə, məsləhət |
| **Qeybət** | ex-venting — persona aktiv tərəf tutur, qeybətə qoşulur; UI-da inversiya |
| **Söyüş** | **premium**. Pulsuz istifadəçiyə toggle görünür, basanda paywall — əsas konversiya nöqtəsi. Aktivləşdirmədə **əlavə 18+ təsdiq**, default OFF. Yüngül-orta küfr, heç vaxt istifadəçinin özünə qarşı. |

## Onboarding

Splash → dil (v1 AZ) → 18+ → cinsiyyət → persona (2 kart) → ad + münasibət statusu → **personanın öz opener mesajı** (statusa uyğun).

Statuslar: subay · münasibətdə · yeni ayrılıb · qəlizdir 😅

Opener nümunəsi (yeni ayrılıb): *"Gəl əvvəlcədən deyim: burda ex-in tərəfini heç vaxt tutmuram 😌 Danış görüm nooldu"*

## Monetizasiya

| Element | Qərar |
| --- | --- |
| Pulsuz limit | 15–20 mesaj/gün |
| Rewarded ad | +5–10 mesaj/baxış, **gündə max 3** |
| Abunəlik | **10 AZN/ay** başlanğıc, planlar RevenueCat-də dinamik |
| Premium daxil | limitsiz mesaj, dərin yaddaş, **söyüş modu** |

Reklamın rolu gəlir deyil — AZ-də eCPM aşağıdır. Rolu limit yumşaldıb pulsuz istifadəçini saxlamaqdır. **Gəlir mənbəyi abunəlikdir.**

## Prompt kompozisiyası (hər çağırışda)

```
persona sistem promptu (Leyli/Məcnun)
+ xitab parametrləri (cinsiyyət)
+ mod təlimatı (chat/qeybət)
+ söyüş bayrağı
+ yaddaş faktları (top-k)
+ korpus parçaları (mövzuya görə)
+ son N mesaj
```

## Yaddaş

Sessiya sonunda (və ya ~15 mesajdan bir) ayrıca extraction çağırışı → JSON faktlar (ex adı, status, açar hadisələr, təkrarlanan mövzular, emosional vəziyyət) → pgvector-da embed → yeni mesajda semantik axtarışla top-k inject.

**"Məcnun məni necə tanıyır?"** ekranı bu cədvəldən oxuyur, silmə oradan. Güvən qurucu funksiyadır — gizli deyil.

## Vizual kimlik

Monoxrom, dark-first. **Rəng yoxdur — rəngi kontent gətirir.** Saf qara (#000) işlədilmir (OLED smearing).

| Rol | Hex |
| --- | --- |
| Fon | `#131313` |
| Səth / kart | `#1D1D1F` |
| Bot bubble | `#232326` |
| Ağ (istifadəçi bubble, mətn) | `#F5F5F4` |
| İkincil mətn | `#8E8E93` |
| Border | `rgba(255,255,255,.08)` |
| Light mode fon | `#FAFAFA` (v2) |

Wordmark kiçik hərflərlə **"məcnun"** — loqo elə qurulur ki, `ə⇄e` keçidi bir hərf dəyişikliyi olsun (AZ↔TR eyni loqo). Font **ə** hərfini mükəmməl çəkməlidir; fallback qəbuledilməz.

## v1-ə daxil DEYİL

- **v1.5:** daily check-in push-ları ("Neynir o biri? 👀" — retention üçün ilk prioritet); "ona nə yazım?" modu
- **v2:** səsli mesajlar, TR lokalizasiyası, əlavə personalar, light mode

## Metriklər (Ay 1)

D7 retention **≥ 20%** · ortalama sessiya **≥ 8 mesaj** · pulsuz→abunə **≥ 2%** · screenshot paylaşımı/aktiv istifadəçi (viral proxy). North star: **həftəlik aktiv istifadəçi**.

## Kod tərəfindəki fərq

**Domen `mecnun.com`-dur**, brief §2.1/§13-dəki `mecnun.app` yox. Bax: [roadmap.md §6](roadmap.md#6-qərar-jurnalı-kod-tərəfi).
