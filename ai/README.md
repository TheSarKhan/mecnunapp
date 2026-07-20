# /ai — persona promptları, korpus, yaddaş şablonları

Bu qovluq **məzmun** qovluğudur: kod yox, mətn. Backend bu mətnləri LLM sorğusu qurarkən oxuyur.

```
ai/
├── personas/
│   ├── leyli.md              # Leyli sistem promptu
│   └── mecnun.md             # Məcnun sistem promptu
├── corpus/
│   ├── slang-az.md           # AZ sleng lüğəti
│   ├── scenarios-az.md       # tipik münasibət ssenariləri
│   └── proverbs-az.md        # atalar sözləri
└── prompts/
    └── memory-extraction.md  # yaddaş fakt çıxarma şablonu
```

## Backend bunları necə yükləyəcək?

> **Qərar hələ verilməyib** — Gemini inteqrasiyası promptunda seçiləcək. İki variant:
>
> 1. **Build-time kopyalama** — Maven `maven-resources-plugin` ilə `/ai` → `backend/target/classes/ai`, sonra `ClassPathResource` ilə oxunur. Üstünlük: jar self-contained, deploy sadə. Çatışmazlıq: prompt dəyişəndə yenidən build.
> 2. **Runtime oxuma** — konteynerə volume kimi mount edilir (`MECNUN_AI_DIR`), `Files.readString` ilə oxunur, dəyişiklik restart-sız tutulur. Üstünlük: prompt iterasiyası sürətli. Çatışmazlıq: deploy-da əlavə mount.
>
> İlkin meyl: **v1-də (1)**, prompt-lar stabilləşənə qədər lokal profildə (2) ilə override etmək imkanı ilə.

Nə seçilsə də, promptları yükləyən nöqtə tək bir `PromptRepository` interfeysi olacaq ki, ikinci variantа keçid bir sinif dəyişikliyi olsun.

## Redaktə qaydası

- Fayllar **azərbaycanca** yazılır (personanın danışdığı dil).
- Persona faylları LLM-ə birbaşa sistem promptu kimi gedir — orada "bu fayl haqqında" meta-mətn olmamalıdır (skeleton mərhələsi bitəndə yuxarıdakı `> Status:` blokları silinəcək).
- Ortaq qaydalar (təhlükəsizlik, format) təkrarlanmağa başlayanda `personas/_shared.md`-ə çıxarılır.
