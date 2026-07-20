# Dizayn

## `mecnun-ui-kit/`

Claude Design-dan export edilmiş UI kit. **Toxunma** — bu, referans nüsxədir.

- `Mecnun UI Kit.dc.html` — bütün ekranların HTML mock-u (brauzerdə aç).
- `rn-components/` — real React Native mənbəyi (tərcümə qatı yox, birbaşa import olunan kod).
- `rn-components/tokens.ts` — orijinal token dəyərləri.

## Kod tərəfdə necə istifadə olunur

`rn-components/*.tsx` faylları `mobile/src/components/ui/` altına **kopyalanıb**. Kopyalar `./tokens`-i import edir, orada isə shim var — real dəyərlər `mobile/src/theme/colors.ts`-dədir.

Yəni:

```
docs/design/mecnun-ui-kit/rn-components/   ← referans, dəyişmir
              ↓ kopyalandı
mobile/src/components/ui/                  ← app-in işlətdiyi kod
              ↓ tokens.ts (shim) re-export edir
mobile/src/theme/colors.ts                 ← rənglərin TƏK mənbəyi
```

Rəng/ölçü dəyişmək lazımdırsa: `mobile/src/theme/colors.ts`.

Kit yenidən export olunanda: `rn-components/*.tsx`-i `mobile/src/components/ui/`-ə yenidən kopyala (`tokens.ts` shim-i üstünə yazma), sonra `npm run typecheck`.
