# Pick Your Color – V1 / V2 / V3

## Versions

- **V1** – Dropdown like V2, but icons from GNS color icon library: **piece-white-king**, **piece-black-king** (CcIcon, variant="color", 24px). File: `my-app/src/components/PickYourColorV1.vue`.
- **V2** – Dropdown: trigger + panel; custom icons (light/dark bg + hollow king SVG). File: `my-app/src/components/PickYourColorV2.vue`. **Currently in use** (entry point uses V2).
- **V3** – Inline: “Play As:” + two icons, green outline on selected. File: `my-app/src/components/PickYourColorV3.vue`.
- **Entry point** – `my-app/src/components/PickYourColor.vue` re-exports the component in use (currently **V2**).

## Switch version

In `my-app/src/components/PickYourColor.vue`:
- To use **V2**: import `PickYourColorV2` and use `<PickYourColorV2 ... />` in the template.
- To use **V3**: import `PickYourColorV3` and use `<PickYourColorV3 ... />` in the template.
- To use **V1**: import `PickYourColorV1` and use `<PickYourColorV1 ... />` in the template.

---

## V1 spec (frozen)

- **Same as V2** (dropdown, trigger + panel, labels “play for white” / “play for black”, same layout and behavior).
- **Icons**: From GNS / design system **color icon library**: `CcIcon` with `variant="color"`, `name="piece-white-king"` for white, `name="piece-black-king"` for black, size 24. Used in trigger and in panel options. No custom SVG or bg tiles.
- **API**: `v-model` (`'white' | 'black'`), optional `disabled` (boolean).
- **Behavior**: Same as V2 (click outside closes; keyboard open/close/arrows).

---

## V2 spec (frozen)

- **API**: `v-model` (string `'white' | 'black'`), optional `disabled` (boolean).
- **Options**: `play for white` / `play for black`.
- **Trigger**: Flex row, gap 8px, padding 0, min-height 40px, 14px/600 label, chevron 12×12. Icon 24×24: white = bg `#e7e6e5`, black = bg `#312E2B`, same hollow king SVG `#8B8987`.
- **Panel**: Above trigger, left -10px, width 240px, padding 8px 2px, gap 2px, bg `#1a1816`, no border/shadow, radius 5px. Options: same icon + label + check (CcIcon mark-check) when selected.
- **Behavior**: Click outside closes; keyboard: Enter/Space/ArrowDown open, Escape/Enter/Space close, ArrowUp/Down change selection.

---

## V3 spec (frozen – inline selection)

- **API**: Same as V2: `v-model` (`'white' | 'black'`), optional `disabled` (boolean). Default `modelValue` is `'white'`.
- **Layout**: Single row, full width. Label **“Play As:”** on the left; two icon buttons on the right (`margin-left: auto`).
- **Label**: “Play As:” – 14px, font-weight 600, color `rgba(255, 255, 255, 0.72)`. Root gap between label and icons: 12px.
- **Icons container** (`.pick-your-color-v3__icons`): Flex row, `gap: 1px`, `flex-shrink: 0`, `margin-left: auto`.
- **Icon wrap** (each button): 32×32px. Border 2px solid transparent; when selected, green outline `var(--color-border-focus, #81b64c)`. Border-radius 5px.
- **Icon** (inside wrap): 24×24px. Same white/black king as V2 (bg + hollow king SVG).
- **Behavior**: Click white or black icon to select; no dropdown.
