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

## Opening course card (V1)

**Context:** Opening Courses V1 course list (`Courses.vue`, `.opening-v1-scroll`). Card shows cover, title, description, and “N Lines” chip.

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

*Add more Courses local components below as needed.*
