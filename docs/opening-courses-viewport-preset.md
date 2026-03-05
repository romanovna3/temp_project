# Opening Courses – Viewport Preset (Design Doc, Hidden in UI)

**Status:** Viewport preset dropdown is **hidden** in the preset bar. L size (Desktop L) is used as default. This doc preserves the full design for when we re-enable it later. **Do not delete** viewport-related code; toggle visibility via `SHOW_VIEWPORT_PRESET_IN_BAR` in the views.

---

## Purpose

- **Responsiveness testing** for Opening Courses V1 and V9 flows without resizing the browser.
- Preset bar shows **Viewport** (size) and **Scenario** (user type). Viewport can be hidden so only Scenario is shown; layout always uses L when viewport is hidden.

---

## Viewport options

| Value     | Label     | Layout effect |
|----------|-----------|----------------|
| `default`| Desktop L | Panel 460px, board visible, full layout. |
| `narrow` | Desktop S | Panel **300px**, board visible. |
| `mobile` | Mobile    | Panel **300px**, **board hidden**, panel only; layout min-width 300px, height 560px. |

---

## Storage and keys

- **Courses.vue (Opening Courses V1):** `OPENING_COURSES_V1_PRESET_BAR_KEY` in `sessionStorage`. Object: `{ viewportPreset, scenarioPreset }`. Initial: `{ viewportPreset: 'default', scenarioPreset: 'returning-user' }`.
- **CoursesV9OC.vue / CoursesV9.vue:** Same pattern; each may use its own key or shared key. Viewport options and labels match.

---

## Options arrays (for PresetBarSelect)

```js
const viewportPresetOptions = [
  { value: 'default', label: 'Desktop L' },
  { value: 'narrow', label: 'Desktop S' },
  { value: 'mobile', label: 'Mobile' },
]
```

---

## CSS: app viewport class

- Root app element gets: `app--viewport-${viewportPreset}` → `app--viewport-default` | `app--viewport-narrow` | `app--viewport-mobile`.
- When viewport preset is **hidden in UI**, layout must behave as **L**: use `effectiveViewportPreset` = `'default'` so `app--viewport-default` is applied.

### Main layout effects (Courses.vue)

- **Default (L):** `.review-panel` 460px; board visible.
- **Narrow (S):** `.app.app--viewport-narrow .review-panel` → `flex: 0 0 300px; width: 300px;`
- **Mobile:**  
  - `.app.app--viewport-mobile .board-section`, `.board-settings` → `display: none`  
  - `.app.app--viewport-mobile .review-panel` → 300px, height 560px, border-radius 24px  
  - `.app.app--viewport-mobile .layout` → min-width 306px, height 560px  

### Card and content (narrow/mobile)

- Started card content: fixed widths (318px / 316px) overridden to `width: 100%; max-width: 100%; min-width: 0` so Practice badge stays visible (see Courses.vue).
- Complete card: Mastery **bar** on L; on S/Mobile show **L4 chip** instead of bar.
- Cover wrap: smaller (86×86 wrap, 80×80 board) for narrow/mobile.

---

## Where used

| File           | Preset bar | Effective viewport when hidden |
|----------------|------------|-------------------------------|
| Courses.vue    | Opening Courses V1: viewport + scenario | `effectiveViewportPreset` → `'default'` |
| CoursesV9OC.vue| Viewport + scenario                     | same pattern |
| CoursesV9.vue  | Viewport + scenario                     | same pattern |

---

## Re-enabling the viewport preset

1. In each view, set **`SHOW_VIEWPORT_PRESET_IN_BAR = true`** (constant near viewport preset options).
2. Ensure the first preset bar group (viewport) and the separator use **`v-if="SHOW_VIEWPORT_PRESET_IN_BAR"`** so they show when enabled.
3. Use **`effectiveViewportPreset`** (computed: when hidden → `'default'`, else `viewportPreset`) for:
   - `app--viewport-${effectiveViewportPreset}` on the root,
   - all conditionals like `viewportPreset === 'narrow' || viewportPreset === 'mobile'` (use `effectiveViewportPreset`).
4. Do **not** remove `viewportPresetOptions`, storage read/write, or CSS for `app--viewport-narrow` / `app--viewport-mobile`.

---

## Preset bar markup (reference)

```html
<div class="viewport-preset-bar" role="toolbar" aria-label="Viewport and scenario preset">
  <div v-if="SHOW_VIEWPORT_PRESET_IN_BAR" class="viewport-preset-bar__group">
    <PresetBarSelect v-model="viewportPreset" :options="viewportPresetOptions" aria-label="Viewport size" />
  </div>
  <span v-if="SHOW_VIEWPORT_PRESET_IN_BAR" class="viewport-preset-bar__separator" aria-hidden="true" />
  <div class="viewport-preset-bar__group">
    <PresetBarSelect v-model="openingV1ScenarioPreset" :options="openingV1ScenarioPresetOptions" aria-label="Scenario" />
  </div>
</div>
```

CSS for `.viewport-preset-bar`, `__group`, `__separator` remains as in the app (full width bar, flex, separator 1×16px).
