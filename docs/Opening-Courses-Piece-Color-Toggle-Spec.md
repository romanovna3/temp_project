# Opening Courses – Piece Color Toggle (filter by White / Black)

Filter control in the Opening Courses list header: user selects **White** or **Black** to show only courses for that color. Used in **Opening Courses V2** (`OpeningCoursesV2.vue`); component: `my-app/src/views/opening-courses/ColorToggle.vue`.

### GNS / DS: ColorPicker component and tokens

**Checked (GNS):** There is **no dedicated color-picker component** in `teams.design.public.components` (search and list input/display components). The switch is implemented with custom markup and aligned to GNS tokens below.

**Tokens used (from GNS):**

| Use | GNS key | Token |
|-----|---------|--------|
| Selected ring | `teams.design.public.tokens.semantic.color.border` | `--color-border-success` |
| Black tile border | same | `--color-border-default` (transparent-white-10 dark) |
| Focus ring | (semantic border) | `--color-border-focus` |
| Radius (tile + frame) | `teams.design.public.tokens.semantic.dimensions.radius` | `--radius-5` (5px) |
| Gap between options | `teams.design.public.tokens.semantic.dimensions.spacing` | `--space-8` (8px) |

**Icon:** GNS `teams.design.public.icons.pieces.king` documents CDN piece images (wk/bk). This switch uses the **piece-hollow-king-1** SVG (Colorpicker / PickYourColorV2 pattern), not the CDN piece image. When/if a DS `ColorPicker` or icon set includes that asset, prefer it.

---

## Version summary

| Version | Description | Persistence | File / notes |
|--------|-------------|-------------|--------------|
| **V1** | (Reserved) No dedicated filter; or legacy dropdown. | — | — |
| **V2** | (Reserved) Alternative UI if needed (e.g. chip or dropdown in header). | — | — |
| **V3** | Toggle switch (56×30), tooltip “Openings for White/Black”. Default `white`. | **None** – resets to `white` on reload. | `ColorToggle.vue`; `openingFilterColor` ref only. |
| **V4** | Same as V3 (same UI). | **sessionStorage** – key `openingCoursesV2FilterColor`, values `'white'` \| `'black'`. Restored on load. | `OpeningCoursesV2.vue`: init from storage, watch + save on change. |
| **V5** | **Switch:** two thumb squares side by side (not a sliding toggle). Selected option has an outline around the square (same as course card square-outline: wrapper larger than thumb, 2px green box-shadow). | Same as V4 (sessionStorage). | `ColorToggle.vue` with `variant="switch"`; `OpeningCoursesV2.vue` passes `variant="switch"`. |

**Current implementation:** **V5** (switch UI + V4 persistence).

---

## V3 spec (frozen – no persistence)

**Intent:** Single toggle in the search row; left = White, right = Black. Filters the course list by `card.type === 'White'` or `'Black'`.

**Component:** `ColorToggle.vue`  
**Binding:** `v-model:selected-color="openingFilterColor"` (`'white' | 'black'`).  
**Default:** `'white'`.

### UI

- **Control:** One `<button>` (entire hit area). Track + thumb inside; thumb and icon have `pointer-events: none` so the button receives all clicks.
- **Size:** 56×30px (button); track 56×26px, border-radius 14.5px; thumb 30×30px, border-radius 4px.
- **Track:** `background: rgba(116, 116, 116, 0.4)`.
- **Thumb:** White = `#ffffff`, Black = `#2d2d2d`; 1px border `var(--color-transparent-white-10)`; shadow `0 1px 2px rgba(0,0,0,0.12)`. Black state: `transform: translateX(26px)`.
- **Icon:** `king-outline.svg`, 20×24px max, inside thumb.
- **Interaction:** Click left half → White; right half → Black; click on thumb → toggle. Keyboard: Enter/Space toggles.
- **Tooltip:** CcTooltip, position top, delay 0. Text: “Openings for White” / “Openings for Black”. DS tokens: `--color-bg-base`, `--text-paragraph-medium`, `--font-weight-bold`, `--color-text-primary`.
- **A11y:** `aria-label="Filter by piece color"`, `:aria-pressed="selectedColor === 'white'"`.

### Parent (OpeningCoursesV2.vue)

- **Ref:** `openingFilterColor = ref('white')`.
- **Filter:** `openingCoursesFiltered` uses `openingFilterColor.value` → `typeMatch = colorFilter === 'white' ? 'White' : 'Black'`; filter cards by `c.type === typeMatch`.
- **Placement:** In `.opening-search-panel__row--inputs`, next to SearchInput; class `opening-search-panel__color-toggle`.

### CSS (ColorToggle.vue)

- `.color-toggle-wrap`: inline-flex, flex-shrink 0.
- `.color-toggle`: relative, 56×30, no padding, transparent bg, cursor pointer, z-index 1. Focus-visible: 2px outline `var(--color-border-focus)`, offset 2px.
- `.color-toggle__track`: absolute, right 0, top 50%, translateY(-50%), 56×26, radius 14.5px.
- `.color-toggle__thumb`: absolute left 0 top 0, 30×30, radius 4px; transition transform 0.28s cubic-bezier(0.4,0,0.2,1), background-color 0.28s ease, border-color 0.28s ease.
- `.color-toggle__thumb--black`: transform translateX(26px).
- Tooltip: non-scoped overrides for DS tooltip (background, arrow, text paragraph-medium bold).

---

## V4 spec (current – with persistence)

**Same as V3** for UI, component, and filter logic.

**Additions in `OpeningCoursesV2.vue`:**

- **Storage key:** `openingCoursesV2FilterColor` (sessionStorage).
- **Values:** `'white'` | `'black'`. Invalid/missing → treat as `'white'`.
- **Init:** On load, read `sessionStorage.getItem(OPENING_COURSES_V2_FILTER_COLOR_KEY)`; if valid, set `openingFilterColor` to it; else `'white'`.
- **On change:** Whenever `openingFilterColor` changes (user toggles), write to sessionStorage. Use a `watch` on `openingFilterColor` and `sessionStorage.setItem(..., value)` in a try/catch (ignore private mode / quota).

**Constant:**

```js
const OPENING_COURSES_V2_FILTER_COLOR_KEY = 'openingCoursesV2FilterColor'
```

**Init:**

```js
function getStoredOpeningFilterColor() {
  try {
    const raw = sessionStorage.getItem(OPENING_COURSES_V2_FILTER_COLOR_KEY)
    if (raw === 'white' || raw === 'black') return raw
  } catch (_) {}
  return 'white'
}
const openingFilterColor = ref(getStoredOpeningFilterColor())
```

**Persistence:**

```js
watch(openingFilterColor, (val) => {
  try {
    sessionStorage.setItem(OPENING_COURSES_V2_FILTER_COLOR_KEY, val)
  } catch (_) {}
}, { immediate: false })
```

---

## V5 spec (switch – two squares, outline on selected)

**Intent:** Not a toggle; two thumb squares placed next to each other. Click White or Black to select. The selected color has an outline around its square (same treatment as course card “square-outline”: outline wrapper is larger than the thumb so there is visible distance).

**Component:** `ColorToggle.vue` with **`variant="switch"`**.  
**Binding:** Same as V3/V4: `v-model:selected-color="openingFilterColor"`.  
**Persistence:** Same as V4 (sessionStorage).

### UI (DS-aligned medium)

- **Layout:** Two options side by side, gap `var(--space-8, 8px)`.
- **Frame:** **36×36px** outer (`.color-switch__outline`); selected: **2px** ring `rgba(129, 182, 76, 1)`.
- **Tile:** **32×32px** thumb – Colorpicker pattern: White `#e7e6e5` + dark border; Black `#312e2b` + `var(--color-border-default)`; `border-radius: var(--radius-5, 5px)`.
- **Icon:** **piece-hollow-king-1** – same SVG path as GNS/DS PickYourColor (`data-name="piece-hollow-king-1"`), fill `var(--fill-0, #8B8987)`; ~28×32px inside the 40px tile.
- **Interaction:** Click White or Black to select; no sliding. Same tooltip as V3/V4 (“Openings for White” / “Openings for Black”).
- **A11y:** Group `role="group"` `aria-label="Filter by piece color"`. Each option `aria-label="Openings for White"` / `"Openings for Black"`, `:aria-pressed`. Focus-visible: outline on the outline wrapper (2px `--color-border-focus`, offset 2px).

### Parent (OpeningCoursesV2.vue)

- Use `<ColorToggle ... variant="switch" />`. Filter and persistence unchanged from V4.

### CSS (ColorToggle.vue – .color-switch*)

- `.color-switch`: inline-flex, gap 6px.
- `.color-switch__option`: reset button; focus-visible → outline on `.color-switch__outline`.
- `.color-switch__outline`: 36×36; selected ring `0 0 0 2px rgba(129, 182, 76, 1)`.
- `.color-switch__thumb`: 32×32, radius `var(--radius-5)`; king SVG ~24×28px.

---

## Card display (separate from toggle)

How **each course card** shows its color (White/Black) is documented under **piece-color-style** in `docs/Courses-Local-Components.md`:

- **piece-color-style-v1:** Text “Learn as White” / “Learn as Black”.
- **piece-color-style-v2:** Grey CcChip with label “White” / “Black” (current on cards).

The **header toggle** (this spec) only filters the list; it does not change how the card label/chip is rendered.

---

## Switch version

- **V3:** In `OpeningCoursesV2.vue`, use `const openingFilterColor = ref('white')`, remove the watch + storage; use `<ColorToggle ... />` (no variant, or `variant="toggle"`).
- **V4:** Same as V3 but with init from `getStoredOpeningFilterColor()` and the watch; `<ColorToggle ... />` (toggle UI).
- **V5:** Use `<ColorToggle ... variant="switch" />`; keep V4 persistence (current).
