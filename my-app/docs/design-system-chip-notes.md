# Design System Chip (CcChip) – Why It May Not Work

The mastery level list uses a **custom chip** (mint badge with system font) instead of the design system `CcChip` so the UI works reliably.

## Possible reasons CcChip doesn’t work in this app

1. **Design system context**  
   Some DS components call `inject('design-system-key')`. The chip itself doesn’t, but it renders `CcTooltip` as a child. If the tooltip or another nested component expects that context and it’s missing or different, rendering can fail or behave oddly. This app does `provide('design-system-key', { routes, trans })` in `App.vue`, so context is present for the app tree.

2. **CSS scope / load order**  
   Chip styles live in `@chesscom/design-system/dist/style.css` and `cc-utils.css` (e.g. `.cc-chip-component`, `.cc-chip-fg`, `.cc-text-medium-bold`). If app or scoped styles override these, or if DS CSS isn’t loaded before app CSS, the chip can look wrong or invisible.

3. **`labelClass` and scoped styles**  
   Passing `label-class="mastery-level-chip-label"` applies that class to the label span inside the chip. Scoped CSS like `.mastery-level-chip-label` is compiled to `.mastery-level-chip-label[data-v-xxx]`; the span is rendered by the child component and may not have that `data-v-xxx` attribute, so the selector might not match. Using `:deep(.mastery-level-chip-label)` fixes that, but if the chip’s root isn’t what you expect (e.g. `.cc-chip-component` instead of `cc-chip`), selectors can still miss.

4. **Bundle / runtime**  
   The DS bundle uses internal helpers (e.g. a local `uid`). In theory a different Vue version or build setup could cause runtime errors when the chip (or its tooltip) mounts. Building the app succeeds, so any failure would be at runtime in the browser; check the console for errors when the “More” section is open.

## What we use instead

The **custom chip** in `App.vue` (`.mastery-level-chip` / `.mastery-level-chip-text`) matches the intended spec:

- Mint background: `rgba(98, 246, 202, 0.1)`
- System font, 12px, semibold, uppercase, 0.05em letter-spacing
- Text color `#26c2a3`, text-shadow
- Same spacing/sizing tokens as the spec

So the mastery level list works without depending on CcChip. To try the DS chip again later:

1. Ensure `provide('design-system-key', ...)` is available for the whole app (already in `App.vue`).
2. Import and use `<CcChip :label="item.level" color="aqua" :is-uppercase="false" />`.
3. If the label font is wrong, use `label-class` and `:deep(.your-class)` so the class applies to the inner span.
4. Check the browser console when opening “More” to see any DS or Vue errors.
