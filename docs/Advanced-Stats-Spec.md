# Advanced Stats (More / Less) – Spec

**Location:** `my-app/src/App.vue` – inside `.more-container`, under the Mastery bar in the right panel (Courses view).

Spec for the expandable “Advanced Stats” block: one control that shows as **More** (top) when collapsed and **Less** (bottom) when expanded; header “Level” / “Variations”; 8 mastery level rows; auto-scroll so Less is visible when expanded.

---

## Note for developers

- **Single control, two positions:** The same logical control is rendered in two places: “More” at the top when collapsed, “Less” at the bottom when expanded. There is no separate “Less Stats” button; the bottom button is the same interaction, relabeled “Less” with chevron up.
- **Scroll behavior:** On expand we call `scrollIntoView({ behavior: 'smooth', block: 'end' })` on the Less button wrapper (`lessBtnWrapRef`) so the scrollable area (`.courses-content`) scrolls to show the Less button. Implement in `expandMoreStats()` after `showMoreStats = true` and `nextTick`.
- **DS usage:** Use DS `CcChip` for both active (aqua translucent) and locked (gray translucent) levels. Do not override the gray chip’s font color; only override aqua to `#26C2A3` via `--chip-translucent-fg` on `.cc-chip-aqua`. Lock icon: `CcIcon name="tool-lock-blank"` (20×20).
- **DOM order:** `.advanced-stats-header` is a direct child of `.more-container` (sibling of the More button and of `.advanced-stats-expanded`), not inside `.advanced-stats-expanded`.

---

## Structure

```
.more-container
├── [More button]          (v-show="!showMoreStats") – "More" + chevron down
├── .advanced-stats-header (v-show="showMoreStats") – "Level" | "Variations"
└── .advanced-stats-expanded (v-show="showMoreStats")
    ├── .advanced-stats-variations – 8 mastery level rows
    └── .more-btn-wrap-bottom   – "Less" button (ref="lessBtnWrapRef" for scroll)
```

---

## Layout & styling

### More container
- Flex column, align center, full width, padding-bottom 4px.

### More / Less button (same class `.more-btn`)
- Flex, gap 8px, height 32px, padding 8px 16px, transparent background, radius 5px.
- Text: System Semi Bold 14px/16px, `--text-secondary`; hover: `--text-primary`.
- Chevron: 16×16, `--icon-tertiary`; hover: `--icon-secondary`; drop shadow. **Less** uses `.more-chevron-expanded` (rotate 180° / point up).

### Practice Filter header (`.advanced-stats-header`)
- Background: `--bg-header-dark` (black 14%).
- Flex, space-between, padding 12px 16px (explicit 16px left/right).
- Labels “Level” and “Variations”: System Semi Bold 14px/16px, `--text-tertiary` (white 50%).

### Variations container (`.advanced-stats-variations`)
- Flex column, align start, **gap 8px**, **padding 12px 16px** (12px top/bottom, 16px left/right).
- Full width, flex-shrink 0.

### Mastery level item (`.mastery-level-item`)
- Flex row, **gap 8px**, padding 2px 16px.
- Left: chip (DS CcChip) + title; right: counter (number) or lock icon.
- **Locked rows (L7, L8):** `opacity: 0.4`; chip = DS gray translucent; right = lock icon `tool-lock-blank` 20×20 (white 40%, drop shadow).

### Less button wrapper (`.more-btn-wrap-bottom`)
- Flex column, align center, padding 4px 0 8px; holds the “Less” button (same `.more-btn` styles).

---

## Data

- **masteryLevelItems:** 8 items, each `{ level, title, counter, locked }`.
  - L1–L6: counter number, `locked: false`.
  - L7–L8: `counter: null`, `locked: true`; show lock icon instead of counter.

---

## Behavior

1. **Collapsed:** Only “More” button visible; click sets `showMoreStats = true` and calls `expandMoreStats()` which, after `nextTick`, scrolls `lessBtnWrapRef` into view (smooth, block end).
2. **Expanded:** Header + variations list + “Less” button at bottom; “More” hidden. Click “Less” sets `showMoreStats = false`.

---

## References

- Implementation and edit list: [Course-Variant.md](./Course-Variant.md).
- Local components: [Courses-Local-Components.md](./Courses-Local-Components.md).
