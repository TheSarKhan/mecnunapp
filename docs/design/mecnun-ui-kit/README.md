# Handoff: məcnun — Mobile UI Kit (v1)

## Overview
məcnun is an Azerbaijani-language AI relationship-venting companion app (React Native / Expo target). This package documents the v1 UI kit: foundations, core components, and the six primary screen flows (onboarding, chat, "qeybət" venting mode, message-limit/rewarded-ad, paywall, memory transparency).

## About the Design Files
The bundled file (`Mecnun UI Kit.dc.html`) is a **design reference built in HTML** — a static, high-fidelity mockup of look, layout, and copy. It is not production code. The task is to **recreate these screens/components natively in React Native (Expo)**, using the tokens and specs below, not to embed the HTML.

The file opens directly in any browser. It renders inline-styled markup with no external CSS framework — treat every inline style as the source of truth for the equivalent React Native `StyleSheet` value.

## Fidelity
**High-fidelity.** Colors, type sizes/weights, radii, spacing, and copy below are final v1 decisions from the product brief (Rev 2.1) — implement pixel-accurate, not just "inspired by."

## Design Tokens

### Colors (monochrome system — no color, content brings color via emoji/images, which this kit intentionally omits)
| Token | Hex / value | Usage |
|---|---|---|
| `bg` | `#131313` | App background (dark). Never pure `#000` — avoids OLED smearing/harsh contrast. |
| `surface` | `#1D1D1F` | Cards, inputs, sheets |
| `bubbleBot` | `#232326` | Bot chat bubble fill |
| `white` | `#F5F5F4` | Primary text, user bubble fill, primary button fill, inverted-mode fills |
| `textSecondary` | `#8E8E93` | Secondary/meta text, placeholders, inactive states |
| `border` | `rgba(255,255,255,0.08)` | Hairline borders on cards/inputs/dividers |
| `borderSelected` | `#F5F5F4` at 1.5px | Selected state border (radio rows, persona card, plan card) |
| `bg.light` (v2, not built) | `#FAFAFA` | Light mode background — ships free via inversion, out of v1 scope |

Inverted surfaces (paywall bottom CTA area, "on" toggle, active "Qeybət" pill segment, rewarded-ad CTA card) use `white` fill with `#131313` text/icon — this inversion **is** the accent language; no hue is ever introduced.

### Typography — Inter (400/500/600/700)
Font requirement: the chosen font **must render Azerbaijani "ə" correctly** — no fallback glyph is acceptable. Inter is the confirmed safe v1 choice; verify any future display-font swap against `ə ğ ı ş ö ü ç Ə Ğ I İ Ş Ö Ü Ç`.

| Role | Size / weight | Notes |
|---|---|---|
| Wordmark | 34–46 / 700 | `letter-spacing: -0.03em`, lowercase always ("məcnun" / "mecnun") |
| Title | 26–28 / 600 | `letter-spacing: -0.02em` |
| Headline | 19–22 / 600 | |
| Body | 15–16 / 400 | `line-height: 1.35` for chat, 1.4–1.55 for prose |
| Secondary | 12–14 / 400–500 | color `textSecondary` |
| Caption / eyebrow | 11 / 600 | `letter-spacing: .12em–.14em`, uppercase |

### Spacing & shape
- Corner radius: buttons/pills `28px` (full pill), cards `14–22px`, chat bubbles `20px` with one corner flattened to `6px` on the "tail" side (bottom-left for bot, bottom-right for user).
- Card border: `1px solid rgba(255,255,255,.08)`; selected state upgrades to `1.5px solid #F5F5F4`.
- Chat bubble max-width: `82%` of screen.
- Sequential same-sender bubbles: `6px` gap; new sender/group: `12–16px`.
- Screen horizontal padding: `20–24px`.

## Assets
No external image assets — everything is inline SVG (status-bar glyphs, back chevron, send arrow, check, close/x, chevron-right, play, share, memory/history icon) or system font glyphs (the "ə" wordmark/app-icon glyph). Recreate icons as a small icon set (e.g. `lucide-react-native` equivalents or custom SVG components); exact paths are in the HTML `<svg>` blocks if pixel match is required.

## Components
1. **Buttons** — Primary (fill `white`, text `#131313`, 600 weight, full-width, 15px vertical padding, 28px radius), Secondary (fill `surface`, border, text `white`), Ghost (transparent, text `textSecondary` or `white`, no border).
2. **Mode pill** — segmented control, two segments "Söhbət" / "Qeybət" inside a `surface` pill (`22px` radius, `3px` padding). Chat-active segment: `bubbleBot` fill. Qeybət-active segment: **inverted** — `white` fill, `#131313` text, 700 weight. This inversion is the only visual signal of mode.
3. **Toggle (söyüş modu / profanity)** — 46×28 track, 20px knob. Off: track `bubbleBot` + border, knob `textSecondary`, left-aligned, paired with a small "premium" chip (`white` fill, `#131313` text, 6px radius, uppercase 10px). On: track `white`, knob `#131313`, right-aligned. Tapping while locked/free-tier routes to paywall.
4. **Limit counter** — pill, `surface` fill, border, shows `n / limit` (bold current / secondary total) + a 4px-tall progress track (`bubbleBot`) with `white` fill proportional to usage.
5. **Chat bubbles** — Bot: `bubbleBot` fill, `white` text, tail bottom-left. User: `white` fill, `#131313` text, tail bottom-right. Both `15px/1.35`, `10px 14px` padding.
6. **Composer** — pill input (`surface`, bordered, `22px` radius, placeholder "Yaz..." in `textSecondary`) + circular `white` send button (40px, up-arrow icon in `#131313`).
7. **Persona card** — avatar circle (initial) + name (16/600) + one-line trait description (13/400, secondary). Selected: `1.5px` white border on `surface` background.
8. **Plan card** — plan name + "seçili" chip, price (28/700) + "/ ay" (secondary), feature summary line. Selected border `1.5px white`.

## Screens

### 1. Splash
- **Purpose:** brand entry point.
- **Layout:** full-bleed dark screen, centered column: app-icon squircle (80px, `ə` glyph) → wordmark (42/700) → tagline "Sevgidən dəli olanlar üçün" (secondary) → bottom-anchored primary button "Başla".

### 2. Dil (Language)
- **Purpose:** select conversation language (v1: AZ only, TR shown disabled).
- **Layout:** title "Dil" + subtitle, two selectable rows (radio-style, check icon on selected "Azərbaycanca"; "Türkçe" shown disabled with a "tezliklə" (coming soon) chip). Bottom primary "Davam et".

### 3. 18+ yaş təsdiqi (Age gate)
- **Purpose:** mandatory 18+ confirmation (content is mature-themed).
- **Layout:** centered "18+" numeral (60/700), headline "Sənin 18 yaşın var?", body copy, primary "Bəli, 18 yaşım var" + ghost "Xeyr, çıx".

### 4. Cinsiyyət (Gender — for address/xitab forms)
- **Purpose:** determines which address terms the persona uses (Qadın → "ay qız / canım / bacım"; Kişi → "brat / qaqaş / qardaş") — **not** tied to which persona (Leyli/Məcnun) is chosen.
- **Layout:** title + subtitle explaining why it's asked, 3 selectable rows (Qadın / Kişi / Deməyə bilərəm), bottom primary "Davam et".

### 5. Persona seçimi
- **Purpose:** pick the companion persona (locked pair: **Leyli** / **Məcnun**), changeable later in settings.
- **Layout:** title + subtitle "İstədiyin vaxt dəyişə bilərsən.", two persona cards stacked (see Persona card component), bottom primary "Seç".

### 6. Ad + münasibət statusu (Name + relationship status)
- **Purpose:** capture display name and relationship status, used to script the first opener message.
- **Layout:** title "Adın nədi?" + filled text input, headline "Münasibət statusun?" + wrapping choice chips (subay / münasibətdə / yeni ayrılıb / qəlizdir — one selected, inverted white fill), bottom primary "Hazıram".

### 7. İlk opener (First message)
- **Purpose:** persona sends the first, status-aware message (no user input yet) to kick off trust before the user has to type.
- **Layout:** standard chat shell (see Chat below) with only bot bubbles pre-filled, composer present but empty. Example (status = "yeni ayrılıb"): three short sequential bot bubbles greeting by name and previewing the "I always take your side" stance.

### 8. Chat modu (normal)
- **Purpose:** general relationship conversation — listening, evaluation, advice.
- **Layout:** status bar → header (back chevron, centered persona name + "onlayn", memory/history icon button) → mode pill (Söhbət active) → scrollable message list (alternating user/bot bubbles, grouped sequential bubbles) → small centered limit-counter caption above composer → composer.

### 9. Qeybət modu (venting mode)
- **Purpose:** persona actively takes the user's side against the ex; the one moment monochrome UI shows a mode change.
- **Layout:** identical shell to Chat, **except** the mode pill's active segment inverts to white/black, and a small secondary caption under the pill echoes the promise ("Burda ex-in tərəfini heç vaxt tutmuram"). Message content is more partisan/validating in tone.

### 10. Limit + rewarded ad
- **Purpose:** free-tier daily message cap reached; offer a rewarded-ad top-up or paywall upsell.
- **Layout:** centered column: maxed-out limit counter (n/n, full progress bar), headline "Bu günlük məcnunluq bəsdir", supporting line, then two stacked option cards: (a) neutral "Reklama bax" card with play-icon, "+5 mesaj" + today's ad-view count, chevron; (b) **inverted** (white-fill) "məcnun+ ə keç" card previewing paywall benefits, chevron. No composer on this screen — it blocks input.

### 11. Paywall (məcnun+)
- **Purpose:** primary conversion surface — triggered by limit screen or by tapping the locked söyüş-modu toggle.
- **Layout:** close (x) top-left in status bar row, wordmark "məcnun+" (32/700), subtitle, 4-row checked feature list (Limitsiz mesaj / Dərin yaddaş / Söyüş modu / Reklamsız), plan card pinned above the CTA (Aylıq / 10 AZN per ay, cancel-anytime note), bottom primary "Abunə ol" + ghost "İndi yox".

### 12. Yaddaş — "Məcnun məni necə tanıyır?" (Memory transparency)
- **Purpose:** trust-building screen showing exactly what long-term facts are stored about the user, with granular delete.
- **Layout:** back chevron + "Yaddaş" header, title + explanatory subtitle, list of fact rows (each: uppercase secondary label e.g. "Ex adı" + value e.g. "Kənan" + per-row × delete icon), bottom outlined destructive-style ghost button "Hər şeyi sil" (delete everything).

## Interactions & Behavior (for the developer to implement — not present as JS in the HTML mock, which is static)
- Mode pill tap toggles Chat ⇄ Qeybət instantly (no navigation, same screen/thread).
- Söyüş-modu toggle: if user is free-tier, tapping always opens Paywall instead of flipping the switch (switch never visually activates for free users).
- Limit counter decrements per sent message; hitting 0 free-remaining blocks the composer and pushes the Limit screen (as a screen or bottom sheet — recommend bottom sheet over the dimmed chat for lower navigation cost).
- Rewarded ad card: disabled/dimmed once daily ad cap (3) is reached; label should reflect remaining count.
- Memory row × icon: optimistic delete with undo affordance recommended (not shown in mock); "Hər şeyi sil" should confirm via native alert before wiping all facts.
- Persona/gender/status selections in onboarding: single-select, immediate visual selection state (border/fill flip), no multi-step confirmation needed.
- Screenshot-share (mentioned in product brief, not yet mocked): any share sheet triggered from chat should composite a watermark ("məcnun" wordmark) onto the shared image — flag for a follow-up design pass if needed.

## State Management (suggested)
- `onboarding`: language, ageConfirmed, gender, persona, name, relationshipStatus
- `chat`: mode ('chat' | 'qeybet'), messages[], dailyMessageCount, dailyMessageLimit, adViewsToday, adViewsMax
- `settings`: profanityModeEnabled (gated by subscription), subscriptionStatus
- `memory`: facts[] (each: label, value, id) with per-fact delete + bulk delete

## Files
- `Mecnun UI Kit.dc.html` — full kit: foundations (colors, type, wordmark/icon candidates), component inventory, and all 12 screens above, laid out as a scrollable spec sheet. Open directly in a browser to inspect/measure.
