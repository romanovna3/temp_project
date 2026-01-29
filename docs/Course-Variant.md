# Course Variant (Right Panel – Courses View)

**Location:** `my-app/src/App.vue` – right panel (`.review-panel`) when in Courses view.

This document describes our **course variant**: the right-hand panel that shows course cards, progress, mastery, “More” expandable stats, lines filter, and section list. It is the single source of truth for the structure and for **edits applied** on top of design system / Figma specs.

---

## Note

The course variant is **not** a separate Vue component; it lives inside `App.vue` as the right column of the main layout. All course-specific markup and scoped styles (`.review-panel`, `.panel-content.courses-content`, `.more-container`, `.mastery-level-*`, `.panel-footer`, etc.) belong to this variant. Local components used by the variant (e.g. `ProgressCircle`) are documented in [Courses-Local-Components.md](./Courses-Local-Components.md). Design system components (e.g. `CcChip`, `CcButton`, `CcIcon`) are used with the edits listed below. **Advanced Stats (More/Less)** has a dedicated spec and developer note: [Advanced-Stats-Spec.md](./Advanced-Stats-Spec.md).

---

## Structure (high level)

- **Header** (`.panel-header`) – back, “Courses” + book icon, sound; fixed, not scrolling.
- **Scrollable body** (`.panel-content.courses-content`) – course cards, Progress bar, Mastery bar, “More” button + AdvancedStatsExpanded (header “Level”/“Variations”, 8 mastery items, “Less Stats” button), lines row (“Show All”), sections list (Chapter V2 items).
- **Footer** (`.panel-footer`) – two sections: lesson action buttons (`.footer-section-actions`), then toolbar (`.footer-section-toolbar`); fixed, not scrolling.

---

## List of edits applied to the component

Edits applied on top of design system or Figma defaults. Use this list when syncing with design or porting the variant.

### Panel & layout

- **Right panel width:** Fixed `460px` (`flex: 0 0 460px; width: 460px`), height `700px`, `overflow: hidden`.
- **Panel background:** `--color-bg-secondary`.
- **Scrollable area:** Only `.panel-content.courses-content` scrolls; header and both footer sections are outside the scroll container. `.panel-content` and `.courses-content` use `min-height: 0` so the flex child scrolls correctly.
- **Sections list:** No longer its own scroll container; scroll is on the parent `.courses-content` so the whole body (cards, progress, mastery, More list, lines row, sections) scrolls together.

### Header

- **Panel header:** Height `4.8rem`, background `--color-bg-tertiary`; layout and icons per Figma.

### Footer

- **Footer layout:** Two explicit sections – `.footer-section-actions` (top), `.footer-section-toolbar` (bottom); `gap: 0`, `padding: 0` on `.panel-footer`.
- **Footer section actions:** `padding: 12px 16px`, background `unset`.
- **Footer section toolbar:** `padding: 12px 16px 8px 16px`, background `unset`.

### Practice All button & badge

- **Badge text:** Heading-label style – `--font-family-heading` (Chess Sans), 12px, 16px line-height, 700, `letter-spacing: 0.05em`, uppercase; color `--text-badge-dark-green` (#45753C).
- **Badge pill:** `padding-left/right: 4px`, `border-radius: 30px` (all corners), `font-family: var(--font-family-heading)` on the badge element.

### More button & AdvancedStatsExpanded

- **More button:** Toggles `showMoreStats`; chevron rotates 180° when expanded (`more-chevron-expanded`); `aria-expanded` set.
- **AdvancedStatsExpanded** (when `showMoreStats`): Main container `.advanced-stats-expanded` (flex column, align start, full width).
  - **Practice Filter (header):** `.advanced-stats-header` – background `--bg-header-dark` (black 14%), flex space-between, padding 12px 16px; column labels “Level” and “Variations” – System font Semi Bold 14px/16px, `--text-tertiary` (white 50%).
  - **Variations container:** `.advanced-stats-variations` – flex column, gap 8px, padding 12px vertical (no horizontal); contains 8 Mastery Level items.
  - **Mastery level items (L1–L8):** L1 Rookie (120), L2 Keen Learner (100), L3 Apprentice (80), L4 Rank Riser (68), L5 Booked Up (54), L6 Expert (1) – active: DS CcChip aqua + counter. L7 Encyclopaedic, L8 Master – **locked:** row `opacity: 0.4`, disabled chip (bg white 10%, text white 72%), lock icon (20×20, white 40%, drop shadow) instead of counter.
  - **Less Stats:** `.less-stats-section` – padding 4px top 8px bottom; button “Less Stats” + chevron (arrow-chevron-bottom with `scaleY(-1)`); System Semi Bold 14px, `--text-secondary`, text shadow; chevron 16×16, `--icon-tertiary`, drop shadow; click sets `showMoreStats = false`.
- **Mastery level chip (active):** DS `CcChip` with `color="aqua"`, `:is-uppercase="false"`, `label-class="mastery-level-chip-label"`. Edits: `--chip-translucent-fg` → `--color-aqua-300` (#26C2A3); label font `--font-family-system`.
- **Mastery level item layout:** Row gap 16px, padding 2px 16px; left panel (chip + title) `flex: 1 0 0`, counter or lock right-aligned; title 14px semibold `--text-secondary`; counter Chess Sans Bold 17px/20px `--text-primary`.

### Chapter V2 (sections list)

- **Chapter items:** Flex layout, cover 80×80, title/author/count and chevron; bottom border; expand/collapse with chevron rotation.
- **Progress circle:** Per [Courses-Local-Components.md](./Courses-Local-Components.md) (ProgressCircle).

### Other

- **Show All filter:** “Show” + select + triangle icon; layout and typography per Figma (Frame 238011).
- **Course cards:** Cover 80×80, 3px radius; title Chess Sans Bold 14px; author/count system font; border-bottom decoration.
- **Progress bar:** Track + fill with `--color-bg-progress-completed-gradient`; Learned count in header.
- **Mastery bar:** Segmented track (8 segments), aqua/mint fill and gradient overlay; no “Learned” text in header.

---

## Data / state used by the variant

- `courses`, `courseSections`, `masteryLevelItems` (8 items: level, title, counter or null, locked boolean; L7/L8 locked).
- `progressLearned`, `progressTotal`, `progressPercent`; `masteryLevel`, `masteryTotal`, `masteryPercent`.
- `showMoreStats` (More expand/collapse), `expandedSectionIds` (section accordion), `linesFilterValue`, `showLessonActions`, `practiceAllBadgeCount`.

---

## Dependencies

- **Design system:** `CcButton`, `CcChip`, `CcIcon`, `CcIconButton` from `@chesscom/design-system`.
- **Local:** `ProgressCircle` from `./components/ProgressCircle.vue`.
- **Context:** `provide('design-system-key', { routes, trans })` in `App.vue` for DS components that inject it.

---

*When updating the course variant, add new edits to the list above and keep this file in sync with `App.vue`.*
