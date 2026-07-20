# /ai — persona promptları, korpus, yaddaş şablonları

Bu qovluq **məzmun** qovluğudur: kod yox, mətn. Backend bu mətnləri LLM sorğusu qurarkən oxuyur.

```
ai/
├── personas/
│   ├── _shared.md            # HƏR İKİ personaya aid: format, qadağalar, qırmızı xətlər, safety
│   ├── leyli.md              # yalnız Leylinin xarakteri
│   └── mecnun.md             # yalnız Məcnunun xarakteri
├── prompts/
│   ├── mode-chat.md          # rejim təlimatı: söhbət
│   ├── mode-qeybet.md        # rejim təlimatı: qeybət
│   ├── profanity-on.md       # yalnız söyüş modu AÇIQ olanda əlavə olunur
│   ├── address-male.md       # xitab: brat / qaqaş / qardaş
│   ├── address-female.md     # xitab: ay qız / canım / bacım
│   ├── address-neutral.md    # xitab: cinsiyyət bildirilməyib
│   ├── opener.md             # personanın öz ilk mesajı üçün təlimat
│   └── memory-extraction.md  # yaddaş fakt çıxarma şablonu (M2)
└── corpus/
    ├── slang-az.md           # AZ sleng lüğəti (M2)
    ├── scenarios-az.md       # tipik münasibət ssenariləri (M2)
    └── proverbs-az.md        # atalar sözləri (M2)
```

Bloklar `PromptComposer`-də brief §7.2 ardıcıllığı ilə birləşir:
`_shared + persona + xitab + mod + [söyüş] + istifadəçi + [yaddaş]`

## Backend bunları necə yükləyir?

**Qərar verilib — hər ikisi, prioritetlə.** Tək giriş nöqtəsi: `com.mecnun.ai.PromptRepository`.

1. **Default: build-time kopyalama.** `maven-resources-plugin` `/ai/**/*.md`-ni `target/classes/ai`-yə köçürür, `ClassPathResource` ilə oxunur və cache-lənir. Jar self-contained olur — deploy-da əlavə mount yoxdur.
2. **Override: fayl sistemindən oxuma.** `mecnun.ai.dir` (env: `MECNUN_AI_DIR`) qurulubsa oradan oxunur və **heç nə cache-lənmir** — persona faylını redaktə edirsən, növbəti mesaj artıq yeni promptla gedir. Nə build, nə restart.

`local` profilində (2) `../ai` ilə açıqdır — **prompt iterasiyası məhz belə aparılır**. `docker`/prod-da (1) işləyir.

> Docker build konteksti repo köküdür (`context: .`, `dockerfile: backend/Dockerfile`) — məhz ona görə ki, image-ə həm `/backend`, həm `/ai` düşsün.

## Redaktə qaydası

- Fayllar **azərbaycanca** yazılır (personanın danışdığı dil) və birbaşa sistem promptuna düşür — "bu fayl haqqında" meta-mətn yazma.
- Ortaq qayda iki personada təkrarlanırsa `personas/_shared.md`-ə aiddir, persona faylına yox.
- **İnkarla qadağan etmə.** Model inkarı zəif tutur: "«ay qız» demə" yazmaq həmin ifadəni daha ehtimallı edir. Qadağan olunanı adlandırmaq əvəzinə, nə ediləcəyini müsbət formada yaz. (`address-neutral.md` bunun nümunəsidir — bir test məhz bu səhvi tutmuşdu.)
- Dəyişiklikdən sonra `mvn -f backend/pom.xml test` işlət: `PromptComposerTest` real faylları oxuyur, ona görə fayl adının dəyişməsi və ya blokun itməsi dərhal görünür.
