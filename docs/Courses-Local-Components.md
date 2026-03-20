# Courses Local Components

Local UI components used in the Courses / right panel. Source of truth for implementation and reuse.

- **Course variant (right panel as a whole):** See [Course-Variant.md](./Course-Variant.md) for structure, note, and list of edits applied to the course variant.

---

## Circular Progress (ProgressCircle)

**File:** `my-app/src/components/ProgressCircle.vue`  
**Figma:** Item List (node 3-6240)

Production circular progress bar: dynamic arc from `progress` (0–100). Track ring (4px, white 10% opacity) + green progress arc; 100% = green circle + **mark-check** glyph inside with green shadow.

### Props

| Prop      | Type   | Default | Description                          |
|-----------|--------|--------|--------------------------------------|
| `progress`| Number | 0      | 0–100 completion percentage         |
| `size`   | Number | 24     | Width/height in px                   |

### Usage

```vue
<ProgressCircle :progress="section.total ? (section.completed / section.total) * 100 : 0" :size="24" />
```

### States

- **0%** – Track only (ring outline).
- **1–99%** – Track + green arc, clockwise from 12 o’clock.
- **100%** – Green circle (`#81B64C`) + white **mark-check** glyph (design system) with drop shadow `#45753C`.

### Dependencies

- `@chesscom/design-system` – `CcIcon` (glyph: `mark-check`).

---

### Full component source

```vue
<script setup>
/**
 * Production Circular Progress Bar – Item List (Figma node 3-6240).
 * Dynamic arc from progress (0–100). Track ring + progress arc; 100% = solid circle + checkmark.
 * Completed state: green circle + mark-check glyph inside with green shadow.
 */
import { computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  /** 0–100; completion percentage. Drives arc and completed state. */
  progress: { type: Number, default: 0 },
  /** Optional size in px (default 24). */
  size: { type: Number, default: 24 },
})

const VIEWBOX = 24
const CENTER = 12
/** Track and progress arc: same ring, center radius 10, stroke 4. */
const R = 10
const STROKE_WIDTH = 4
const CIRCUMFERENCE = 2 * Math.PI * R

const clampedProgress = computed(() => {
  const p = Number(props.progress)
  if (Number.isNaN(p)) return 0
  return Math.min(100, Math.max(0, p))
})

const showTrackOnly = computed(() => clampedProgress.value === 0)
const showArc = computed(() => clampedProgress.value > 0 && clampedProgress.value < 100)
const showCompleted = computed(() => clampedProgress.value >= 100)

/** Stroke-dasharray: visible length = (progress/100)*circumference, gap = rest. */
const arcStrokeDashArray = computed(() => {
  const pct = clampedProgress.value / 100
  const dash = CIRCUMFERENCE * pct
  return `${dash} ${CIRCUMFERENCE}`
})
/** Start at 12 o'clock: circle is rotated -90deg so path start is at top; offset 0 keeps arc from top. */
const arcStrokeDashOffset = computed(() => '0')
/** Checkmark icon size inside completed circle (~2/3 of circle so it sits inside). */
const checkIconSize = computed(() => Math.max(12, Math.round(props.size * (2 / 3))))
</script>

<template>
  <span
    class="progress-circle"
    role="progressbar"
    :aria-valuenow="clampedProgress"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="`Progress: ${clampedProgress}%`"
    :style="{ width: size + 'px', height: size + 'px' }"
    data-name="Progress Circle"
  >
    <svg
      class="progress-circle-svg"
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Track: circular ring, white 10% opacity (always present except in completed state we use solid circle) -->
      <circle
        v-if="showTrackOnly || showArc"
        id="track"
        :cx="CENTER"
        :cy="CENTER"
        :r="R"
        fill="none"
        stroke="var(--fill-0, white)"
        stroke-opacity="0.1"
        :stroke-width="STROKE_WIDTH"
      />

      <!-- Progress arc: 0 < progress < 100, clockwise from 12 o'clock (same width as track) -->
      <circle
        v-if="showArc"
        id="completed"
        :cx="CENTER"
        :cy="CENTER"
        :r="R"
        fill="none"
        stroke="#81B64C"
        :stroke-width="STROKE_WIDTH"
        :stroke-dasharray="arcStrokeDashArray"
        :stroke-dashoffset="arcStrokeDashOffset"
        transform="rotate(-90 12 12)"
      />

      <!-- Completed (100%): green circle background -->
      <rect
        v-if="showCompleted"
        id="completed"
        width="24"
        height="24"
        rx="12"
        fill="var(--fill-0, #81B64C)"
      />
    </svg>
    <!-- Completed (100%): mark-check glyph inside with green shadow -->
    <span v-if="showCompleted" class="progress-circle-completed" aria-hidden="true">
      <CcIcon
        name="mark-check"
        variant="glyph"
        :size="checkIconSize"
        class="progress-circle-completed-icon"
      />
    </span>
  </span>
</template>

<style scoped>
.progress-circle {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}
.progress-circle-svg {
  display: block;
  width: 100%;
  height: 100%;
}
/* Completed state: mark-check glyph (white) with green shadow */
.progress-circle-completed {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.progress-circle-completed-icon {
  color: white;
  filter: drop-shadow(0 1px 0 #45753C);
}
</style>
```

---

## Opening course card (V1 / V3)

**Context:** Opening course list — legacy **V1** in `Courses.vue` (`.opening-v1-scroll`, “N Lines” chip in older builds); **V3** in `OpeningCoursesV3.vue`. Card shows cover, title, description; **V3** uses **White/Black** gray chip under description and optional **gold Recommended** chip beside the title on the explore list (New User + All tab). See **Opening Courses V3 – course list layout** below.

### Description truncation when headline wraps to 2 lines

When the card **headline (title) wraps to two lines**, the description line-clamp is reduced so the card height stays balanced:

- **Desktop S (narrow):** description truncates after **1 line** (class `opening-course-card--title-two-lines` applied via JS when `title.scrollHeight > lineHeight * 1.3`).
- **Mobile:** description truncates after **2 lines** (otherwise 3 lines when headline is 1 line).

Measurement runs on mount, when the filtered list changes, on window resize, and when the viewport preset changes (e.g. switching to Desktop S). Implemented in `measureOpeningCardTitleLines()` and CSS under `.app.app--viewport-narrow` / `.app.app--viewport-mobile` with `.opening-course-card--title-two-lines`.

### Selected card hover

Selected card does **not** change background on hover (no `--color-bg-subtlest`); only unselected cards get a background on hover. The board preview stays on the selected card until pointer leaves.

---

## Color Picker V1 (Pick Your Color)

**File:** `my-app/src/components/PickYourColor.vue`  
**Local name:** `color-picker-V1`  
**Figma:** Pick your color (trigger node 208:20483), Black king icon (node 208:20656).

Dropdown to select piece color: “play for white” or “play for black”. Trigger shows current choice (king icon + label + chevron); panel opens **above** the trigger with two options. Selected option shows a green **mark-check** glyph on the right.

### Props

| Prop         | Type    | Default   | Description                                  |
|--------------|---------|-----------|----------------------------------------------|
| `modelValue` | String  | `'white'` | `'white'` \| `'black'`; v-model binding     |
| `disabled`  | Boolean | false     | Disables trigger and prevents open           |

### Usage

```vue
<PickYourColor v-model="openingPlaySide" class="pick-your-color-wrap" />
```

### Trigger (closed state)

- **Layout:** Flex row, `gap: 8px`, `padding: 5px`, `border-radius: 3px`, `min-height: 40px`.
- **Background:** Transparent (no background).
- **Icon:** 24×24px king (white or black). White king: 3 layers from Figma (base, dark, light) or fallback SVG. Black king: 3 layers from Figma (node 208:20656) or fallback SVG.
- **Label:** 14px, font-weight 600, line-height 16px, `color: rgba(255,255,255,1)`, `opacity: 0.72`. Text: “play for white” / “play for black”.
- **Chevron:** 12×12px, down when closed; `opacity: 0.72`. Rotates 180° when panel open.
- **Hover/focus (trigger):** Label and chevron only → `opacity: 0.85`. Icons and background unchanged.

### Dropdown panel

- **Position:** Above trigger: `bottom: 100%`, `left: -8px`, `margin-bottom: 4px`.
- **Size:** `width: 200px` (fixed).
- **Padding:** `4px 0` (vertical only).
- **Background:** `#1f1e1d`.
- **Border:** `1px solid rgba(255, 255, 255, 0.15)`.
- **Border radius:** `6px`.
- **Shadow:** `0 -4px 12px rgba(0, 0, 0, 0.4)` (upward).
- **z-index:** 100.

### Dropdown options

- **Layout:** Flex row per option, `gap: 8px`, `width: 100%`, `max-width: 100%`, `min-width: 0`, `padding: 5px 12px`.
- **Background:** Transparent (no option background).
- **Icon:** Same 24×24 king as trigger (white or black, same Figma/fallback).
- **Label:** Same as trigger: 14px, 600, white, `opacity: 0.72`. Hover/focus: **label only** → `opacity: 0.85` (icons do not change on hover).
- **Selected:** Green check on the right: **mark-check** glyph (DS), `variant="glyph"`, `size="16"`, color `var(--color-border-focus, #81b64c)`. Check container: `margin-left: auto` so it sits at the right edge of the panel.

### Icon assets (Figma MCP)

- **White king:** base, dark, light (node 208:20483).
- **Black king:** base, dark, light (node 208:20656).
- **Chevron:** single asset. All have `@error` fallback to inline SVG where needed.

### Dependencies

- `@chesscom/design-system` – `CcIcon` (glyph: `mark-check` for selected option).
- Vue 3 (ref, computed, onMounted, onUnmounted).

### Accessibility

- Trigger: `aria-label="Select piece color"`, `aria-haspopup="listbox"`, `:aria-expanded`, `:aria-controls` when open.
- Panel: `role="listbox"`, `aria-label="Piece color options"`.
- Options: `role="option"`, `:aria-selected`. Keyboard: Enter/Space to open; Arrow Up/Down to change; Escape to close; click outside to close.

---

## Piece color style (Opening course card – Returning User)

**Name:** `piece-color-style-v1` (saved for easy restore).  
**Used in:** Opening course cards (Returning User) in `OpeningCoursesV2.vue`; also `Courses.vue` (V1), `CoursesV9OC.vue` (course page card), `OpeningCoursePage.vue`.

### piece-color-style-v1 – Full specs (restore reference)

**Intent:** Show play side as text label “Learn as White” / “Learn as Black” (no king icon). On opening list, group title + Completed chip (when completed) + this label; Completed and “Learn as…” on same row.

**Template structure (OpeningCoursesV2.vue):**

```html
<div class="opening-course-card__started-top">
  <h3 class="opening-course-card__title">{{ card.title }}</h3>
  <div class="opening-course-card__started-top-row">
    <CcChip v-if="isOpeningCardCompleted(card)" label="Completed" color="green" variant="translucent" :is-uppercase="false" label-class="opening-course-card__chip-label" class="opening-course-card__completed-chip" />
    <span class="opening-course-card__learn-as-label course-card-completion__complete-label">{{ card.type === 'White' ? 'Learn as White' : 'Learn as Black' }}</span>
  </div>
</div>
```

**CSS – OpeningCoursesV2.vue:**

```css
/* Group: header (title) + Learn as White/Black + Completed chip (when completed); gap 4px */
.opening-course-card__started-top {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 314px;
  flex-shrink: 0;
  min-width: 0;
}
.opening-course-card__started-top .opening-course-card__title {
  width: fit-content;
  min-width: 0;
}
.opening-course-card__started-top-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  padding-left: 0;
  padding-right: 0;
}
/* Learn as White/Black label */
.opening-course-card__learn-as-label,
.opening-course-card__started-top .course-card-completion__complete-label {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: var(--text-xs, 12px);
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}
```

Chip styling (already scoped to `.opening-course-card__started-top`): `:deep(.cc-chip-fg)`, `:deep(.opening-course-card__chip-label)` → font-family system, font-size 12px; `:deep(.cc-chip-component.cc-chip-gray.cc-chip-translucent)` → background-color: var(--color-bg-subtle).

**Narrow/mobile (OpeningCoursesV2.vue):**

```css
.app.app--viewport-narrow .opening-course-card__content--started .opening-course-card__started-top,
.app.app--viewport-mobile .opening-course-card__content--started .opening-course-card__started-top,
.app.app--viewport-narrow .opening-course-card__content--started .opening-course-card__started-footer,
.app.app--viewport-mobile .opening-course-card__content--started .opening-course-card__started-footer {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}
```

**Course page (CoursesV9OC.vue) – same label, different layout:**  
Label lives inside `.opening-course-card__started-header` (flex column).  
`.opening-course-card__play-as-label { margin-top: 2px; color: rgba(255, 255, 255, 0.4); }`  
Label copy: “Learn as White” / “Learn as Black”.

**Other files (v1):**  
- `Courses.vue`: same started-header + started-meta structure; learn-as-label + same typography/color in started-meta.  
- `OpeningCoursePage.vue`: label inside started-header with classes `opening-course-card__learn-as-label course-card-completion__complete-label`.

**Copy:** “Learn as White” / “Learn as Black” everywhere. PickYourColorV3 / PlaySideSelector: “Learn as:” (not “Play As:”).

---

### piece-color-style-v2

**Intent:** Use a grey chip (same style as “X Lines”) for color: label `White` or `Black` instead of text “Learn as White/Black”.

**Implementation:** Replace the `<span class="opening-course-card__learn-as-label ...">` with:

```html
<CcChip :label="card.type === 'White' ? 'White' : 'Black'" color="gray" variant="translucent" :is-uppercase="false" label-class="opening-course-card__chip-label" class="opening-course-card__color-chip" />
```

Same CcChip API as Lines chip: `color="gray"`, `variant="translucent"`, `label-class="opening-course-card__chip-label"`. No extra CSS needed; `.opening-course-card__started-top :deep(...)` already styles gray chips.

---

## Opening Courses header color picker (ColorToggle switch variant)

**File:** `my-app/src/views/opening-courses/ColorToggle.vue`  
**Usage:** Opening Courses V2 search panel; filter by piece color (White / Black). Rendered only when **not** on Your Openings (New User or Returning User → All tab). See `docs/Opening-Courses-Piece-Color-Toggle-Spec.md` for full version history and persistence.

### Switch variant – canonical dimensions

| Element | Size | Notes |
|--------|------|--------|
| **Outline** (`.color-switch__outline`) | **44×44px** | Frame around each option; selected gets ring |
| **Thumb / square** (`.color-switch__thumb`) | **40×40px** | White `#e7e6e5`, Black `#312e2b`; inset stroke only |
| **Selection ring** (selected outline) | **3px** | `box-shadow: 0 0 0 3px rgba(129, 182, 76, 1)` |
| **Icon** (`.color-switch__king-svg`) | **32×32px** | GNS piece-hollow-king-1 inline; color `#8B8987` |
| **Gap** (`.color-switch`) | **4px** | Space between options |

- **Border radius:** Thumb `var(--radius-5, 5px)`; outline `calc(var(--radius-5, 5px) + 2px)`.
- **Tile stroke:** Inside only (`inset 0 0 0 1px` + subtle outer shadow); no outer border.
- **Optional Both tile:** When `allowBoth` is true, same 40×40 with left half white / right half black; king 32×32 centered on top.

---

## Design System: CcChip (`cc-chip`)

**GNS key:** `teams.design.public.components.display.chip`

Compact element for tags, labels, categorization. Multiple colors and opacity variants.

### Props (canonical)

| Prop | Type | Default | Description |
|------|--------|---------|-------------|
| `label` | `string \| number` | — | Chip label text |
| `color` | `'aqua' \| 'blue' \| 'brown' \| 'fuchsia' \| 'gold' \| 'gray' \| 'green' \| 'orange' \| 'purple' \| 'red' \| 'skin' \| 'slate'` | `'gray'` | Chip color (**12** options; **gold** = Recommended badge on Opening V3) |
| `variant` | `'opaque' \| 'translucent'` | `'translucent'` | Opacity variant |
| `icon` | `string` | — | Icon glyph name |
| `tooltip` | `string` | — | Tooltip on hover |
| `labelClass` | `string` | — | Custom class on label |
| `isUppercase` | `boolean` | `true` | Uppercase transform |

**Platform (internal):** Web `cc-chip` — `client/shared/design-system/components/cc-chip/`

### Opening Courses V3 – chip recipes

| Role | `color` | `variant` | `is-uppercase` | `label-class` | `class` (wrapper) | `label` |
|------|---------|-----------|----------------|---------------|-------------------|---------|
| Play side | `gray` | `translucent` | `false` | `opening-course-card__chip-label` | `opening-course-card__color-chip` | `White` / `Black` |
| Recommended | `gold` | `translucent` | `false` | `opening-course-card__chip-label` | `opening-course-card__recommended-chip` | `Recommended` |

Typography overrides (system 12px) use the same `:deep(.opening-course-card__chip-label)` / `:deep(.cc-chip-fg)` patterns as gray chips.

---

## Opening Courses V3 – course list layout (flat + Recommended chip)

**File:** `my-app/src/views/OpeningCoursesV3.vue`  
**Routes:** `/courses/opening-courses-v3`, `/learn/opening-courses-v3`

### Explore list (New User scenario, or Returning User → **All** tab)

- **UI:** Single vertical list — same structural pattern as **Your Openings** (one `.opening-course-cards-list`, no in-list section chrome).
- **Modifier:** `.opening-course-cards-list--flat` on the list container (semantic hook for “no section headers”).
- **Order:** All **recommended** courses first (same set as former “Recommended” section), then **all others** (same as former “All Courses”).

### Data model (retain for library, tests, and docs)

| Name | Role |
|------|------|
| `openingCoursesListForSections` | Source array: New User → `openingCoursesFiltered`; All tab → `openingCoursesRestList`. |
| `openingRecommendedEntries` | `ComputedRef<{ openingKey, type }[]>` — picks depend on scenario + (All tab) color filter. |
| `openingCoursesRecommendedList` | Filter: cards in `openingCoursesListForSections` that match `openingRecommendedEntries`. |
| `openingCoursesAllOthersList` | Filter: same list, **not** recommended. |
| `openingCoursesSections` | **Logical** shape only: `[{ id: 'recommended', title, count, list }, { id: 'all-courses', … }]`. **Not** rendered as headers in V3 UI; preserves the old “two sections” spec. |
| `openingCoursesFlatOrderedForExplore` | Rendered array: `[...openingCoursesRecommendedList, ...openingCoursesAllOthersList]`. |

### Template – not-started card (explore)

Title row + optional gold chip + description + properties row:

```vue
<div class="opening-course-card__title-author">
  <div class="opening-course-card__title-row opening-course-card__title-row--with-chips">
    <h3 class="opening-course-card__title">{{ card.title }}</h3>
    <CcChip
      v-if="isExploreListRecommended(card)"
      label="Recommended"
      color="gold"
      variant="translucent"
      :is-uppercase="false"
      label-class="opening-course-card__chip-label"
      class="opening-course-card__recommended-chip"
    />
  </div>
  <p class="opening-course-card__description">{{ card.description }}</p>
</div>
<div class="opening-course-card__properties">
  <CcChip
    :label="card.type === 'White' ? 'White' : 'Black'"
    color="gray"
    variant="translucent"
    :is-uppercase="false"
    label-class="opening-course-card__chip-label"
    class="opening-course-card__color-chip"
  />
</div>
```

### Helpers

- `isOpeningRecommended(card, entries)` — `entries.some(r => r.openingKey === card.openingKey && r.type === card.type)`.
- `isExploreListRecommended(card)` — `isOpeningRecommended(card, openingRecommendedEntries.value)`.

### Retired in V3 UI (spec kept above)

- Visible **section headers** (“Recommended”, “All Courses”) and **per-section counts** in the scroll list.
- Styles `.opening-v1-section`, `.opening-v1-section-header`, `.opening-v1-section-header__title`, `.opening-v1-section-header__count` remain in the stylesheet for reference / reuse.

### CSS highlights (`OpeningCoursesV3.vue` unscoped styles)

- `.opening-course-card__title-row--with-chips` — `display: flex`; `justify-content: flex-start`; `align-items: flex-end`; `gap: 6px`; full width; `min-width: 0`.
- Title inside row: `flex: 0 1 auto`; `width: fit-content`; `max-width: 100%`; `min-width: 0` — intrinsic width so the gold chip sits next to the title; can shrink for ellipsis when long.
- `.opening-course-card__recommended-chip` — `flex-shrink: 0`.
- `:deep(.cc-chip-fg)` / `:deep(.opening-course-card__chip-label)` on row + recommended chip → system font, **12px**.

### Preselection

- On first load (no back-from-chapter state), **first recommended** card: `openingCoursesRecommendedList[0]` → `preselectFirstRecommendedOpeningCard()`.

### Your Openings tab

- Still uses flat `openingV3RubCourseList` only; **no** gold Recommended chip (explore-only).

---

*Add more Courses local components below as needed.*
