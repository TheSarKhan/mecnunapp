# Məcnun — məhsul brifi

> Bu fayl bootstrap prompt-undakı təsvirdən yığılıb. Məhsul qərarları dəyişəndə burada yenilə — kod və README-lər buna istinad edir.

## Nədir

Azərbaycan dilində münasibət mövzusunda dərdləşmək üçün mobil AI yoldaş.

## Persona

İstifadəçi onboarding-də birini seçir, ayarlardan istənilən vaxt dəyişir:

- **Leyli** — qadın persona; canlı, çox sual verən, empatiya ilə başlayan.
- **Məcnun** — kişi persona; sakit, ağır, az danışan, çox eşidən.

Sistem promptları: [`/ai/personas`](../ai/personas).

## Modlar

| Mod | Nə edir |
| --- | --- |
| **Söhbət** (`CHAT`) | Ümumi münasibət söhbəti. Balanslı — hər iki tərəfi görür. |
| **Qeybət** (`QEYBET`) | Ex-venting. Persona açıq şəkildə istifadəçinin tərəfini tutur (amma yalan danışmır və zərərli davranışa təhrik etmir). |

UI-da fərq mod pill-i ilə verilir: qeybət modunda pill ağa dönür — monoxrom sistemdə yeganə vizual "state" siqnalı.

## Monetizasiya (freemium)

- **Pulsuz:** gündəlik mesaj limiti (hazırda 20).
- **Rewarded ad (AdMob):** bir reklam = +5 mesaj, gündə maksimum 5 dəfə.
- **Premium (RevenueCat):** praktiki olaraq limitsiz + söyüş modu + daha dərin yaddaş + reklamsız.

Rəqəmlər `backend/src/main/resources/application.yml` → `mecnun.limits` / `mecnun.ads`.

## Uzunmüddətli yaddaş

Söhbətlərdən istifadəçi haqqında faktlar çıxarılır, embed edilir, `memory_facts`-də saxlanılır və gələcək söhbətlərdə RAG ilə geri çəkilir.

İstifadəçi bunu görür və idarə edir: **"Məcnun məni necə tanıyır?"** ekranı — faktların siyahısı, tək-tək və ya toplu silmə.

Fakt çıxarma promptu: [`/ai/prompts/memory-extraction.md`](../ai/prompts/memory-extraction.md).

## Vizual kimlik

Monoxrom, dark-first. Heç bir hue yoxdur.

| Token | Dəyər |
| --- | --- |
| `bg` | `#131313` |
| `surface` | `#1D1D1F` |
| `botBubble` | `#232326` |
| `ink` (mətn) | `#F5F5F4` |
| `muted` (ikincil) | `#8E8E93` |
| `border` | `rgba(255,255,255,0.08)` |

Şrift: **Inter**. UI kit: [`docs/design/mecnun-ui-kit`](design/mecnun-ui-kit).

## Ekranlar

1. Splash
2. Onboarding — yaş təsdiqi (18+)
3. Onboarding — cinsiyyət
4. Onboarding — persona (Leyli / Məcnun kartları)
5. Onboarding — ad + münasibət statusu
6. Chat — mod toggle
7. Paywall
8. Ayarlar — persona, söyüş toggle (premium-gated), yaddaş ekranı, hesab silmə

## Dil

v1 **azərbaycanca**. Türkcə struktur baxımından hazırdır (`mobile/src/i18n/tr.json`), tərcümə edilməyib.

## Yaş həddi

18+. Onboarding-in ilk addımı yaş təsdiqidir.
