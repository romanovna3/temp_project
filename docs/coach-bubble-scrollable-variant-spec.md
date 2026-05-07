# Scrollable coach bubble variant — restore checklist

Use this file first when bringing **pinned heading + scrollable speech body + top/bottom fades** onto a new route or experiment.

**Full specification** (layout hug rule, scroll chain, fades, typography): [`move-trainer-coach-bubble-informational-fill-spec.md`](./move-trainer-coach-bubble-informational-fill-spec.md)

---

## One-screen restore

### 1. `CoachBubble` props

| Prop | Value |
|------|--------|
| `introCoachCombinedBubble` | `true` (or `informationalSingleBubble` for same shell without intro naming) |
| `fillAvailableHeight` | `true` when the bubble must cap to panel height and scroll inside |
| `introCombinedLeadBold` | Bold instruction line (e.g. `Play c5`) |
| `introCombinedTurnStripRegular` | Regular second line (e.g. `Black to play`) |
| `message` | Long body copy (`white-space: pre-line`), or `''` for heading-only |

### 2. Route / shell CSS (pattern)

- Parent stack: **`flex: 1 1 0`**, **`min-height: 0`** so `%` max-heights resolve.
- Coach wrapper (Play Move pattern): **`flex: 0 1 auto`**, **`max-height: 100%`**, **`min-height: 0`**, **`width: 100%`** — **do not** `flex-grow` the coach row or the bubble will stretch when content is short.

### 3. Source of truth (files)

| Concern | Location |
|---------|-----------|
| Scroll measurement, fades, `contentRef`, ResizeObserver | `MoveTrainer/src/components/CoachBubble.vue` |
| Fill-available + informational hug layout | Same file — selectors `.coach-container--fill-available.coach-container--informational-single`, `.bubble-scroll-panel--informational`, etc. |
| Product fade tweak | `my-app/src/views/move-trainer/move-trainer-3/MoveTrainer3LineCoach.vue` (`::after` override) |

---

## Pinned heading block — `.coach-intro-combined-heading`

Non-scrolling stack above the scrollable `.bubble-content`; stays at top while body scrolls.

| Property | Spec |
|----------|------|
| `padding-top` | **12px** |
| `padding-inline` | **16px** (`var(--space-16, 16px)`) |
| `padding-bottom` | **12px** |
| `gap` (between lead + subtitle) | **0** |
| `min-height` | **64px** (`box-sizing: border-box`) |

Typography on lines: `.coach-message.cc-text-speech`; lead **`font-weight: 700`**, subtitle **`font-weight: 500`**; Apple stack via `.bubble-informational-inner:has(.coach-intro-combined-heading) .coach-message.cc-text-speech`.

---

## Do not regress

- Never re-add `.bubble--informational-single::before, ::after { display: none }` — kills fades.
- Inner scroll lives on **`.bubble-content--informational-message`** (`contentRef`); fades read that element’s `scrollTop` / overflow.
