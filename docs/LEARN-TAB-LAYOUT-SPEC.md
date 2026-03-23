# Learn tab layout spec (CoursesV9OC / V6–V7)

Use this as the single source of truth so the **Practice tab** can reuse the exact same structure and only swap in practice data.

---

## 1. Outer structure (tab panel)

- **Container:** `course-tab-panel` with `course-tabs-active === 'content'` (Learn) or `'stats'` (Practice).
- **Sections list:** One wrapper: `sections-list` with optional modifier (e.g. `sections-list--practice` for Practice-only styling).
- **Per section:** `section-item` with `data-section-id="{{ section.id }}"` and section ref.

---

## 2. Section layout (one per section)

- **Sticky wrap:** `v23-section-sticky-wrap`
- **Timeline wrap:** `v23-section-timeline-wrap` with:
  - `v23-section-timeline-wrap--v4` (V4 timeline)
  - `v23-section-timeline-wrap--v6` (V6: timeline on left, same as line cards)
  - **`v23-section-timeline-wrap--no-chapter`** when there is **no chapter row** (e.g. opening course from route / London System White). Line then starts at top (`top: 0`).
- **Vertical line:** One div: `v23-section-timeline-wrap__line`, `aria-hidden="true"`. Color and position come from shared CSS (same for Learn and Practice).

---

## 3. Chapter row (Learn with chapters only)

- **When:** Rendered only when **not** “no-chapter” mode (`!isLondonSystemWhiteCourse && !openingCourseIdFromRoute`).
- **Component:** `chapter-v2 chapter-v2--header` with:
  - `chapter-v2--sticky-title-v23` when section open
  - `chapter-v2--no-accordion` when not accordion
  - `chapter-v2--v4-timeline` and `chapter-v2--v6-timeline-right`
- **Content:**
  - `chapter-v2-border` (span, aria-hidden)
  - **Timeline col:** `chapter-v2__timeline-col` with `ProgressCircle` (24px, section progress %).
  - **Name block:** `chapter-progress-name` > `chapter-content` > `chapter-title` (section name).
  - **Variations:** `chapter-variations` > `chapter-count` (e.g. "3/12") and optional chevron.

**For opening course / no-chapter:** This whole chapter row is **omitted**. Practice tab should do the same: no chapter row.

---

## 4. Expandable + line list

- **Expandable:** `v23-expandable` with `v23-expandable--open` when section is open (for Learn with no-chapter, effectively always open).
- **Video block (optional):** `v22-chapter-video-block` (can be empty).
- **Video section (optional):** Only when not opening course; not relevant for Practice.
- **Transition:** `Transition name="chapter-moves"`.
- **List wrap:** `move-list-wrap` (visible when section has moves).
- **Cards wrapper:** `chapter-line-cards-list-wrapper`.
- **List:** `opening-course-cards-list chapter-line-cards-list`, `role="list"`, `data-name="Lines"`, `aria-label="Lines"` (or "Practice lines" for Practice).

---

## 5. Line card (article) – same for Learn and Practice

- **Element:** `<article>` with:
  - `opening-course-card opening-course-card--hover-v1 chapter-line-card chapter-line-card--v6-timeline-right`
  - Conditional: `move-item--inactive` when not completed (Learn) / practice-type classes (Practice).
  - `chapter-line-card--last` on last item.
  - `chapter-line-card--next-to-learn` (Learn) or `chapter-line-card--next-to-practice` (Practice) on the highlighted line.
- **Order of children (important):** Timeline col **first**, body **second** so checks are on the **left**.

### 5.1 Timeline column (first child)

- **Div:** `chapter-line-card__timeline-col`, `aria-hidden="true"`.
- **Refs:** First card: `setSectionFirstCardColRef(section.id, el)`. Last card: `setSectionLastCardColRef(section.id, el)` (for line mask).
- **Node:** `<span class="chapter-line-card__timeline-node chapter-line-card__timeline-node--v6">` with:
  - `chapter-line-card__timeline-node--completed` when completed (Learn) or ready/completed (Practice).
  - `chapter-line-card__timeline-node--next-to-learn` / `--next-to-practice` for highlight.
- **Check icon:** `<img>` when completed (Learn) or ready/completed (Practice): `baseUrl + 'icons/circle-fill-check.png'`, 13×13, class `chapter-line-card__timeline-node-icon` (and `--practice` for Practice aqua tint).

### 5.2 Body (second child)

- **Div:** `chapter-line-card__body chapter-line-card__body--no-click`, `:title="move.text"` (or item text).
- **Inner:** `opening-course-card__inner` > `opening-course-card__content-wrap`.
- **Cover:** `opening-course-card__cover-wrap` > `chapter-line-card__intro-cover chapter-line-card__intro-cover--v6` with:
  - Learn: `chapter-line-card__intro-cover--v6-incomplete` / `--v6-completed` by `move.completed`.
  - Practice: `chapter-line-card__intro-cover--v7-practice` and `--v7-practice-completed` by practice type.
- **Icon:** CcIcon (e.g. document-book-open for info, game-type-puzzle for quiz) or V8/V9 cover icon.
- **Content:** `opening-course-card__content`:
  - **Header row:** `chapter-line-card__header-row` (fixed **16px** height; title `line-height: 16px` in row):
    - **Title wrap:** `chapter-line-card__title-wrap` > `opening-course-card__title` (line title).
    - Chips: INFO, level (L1/L2), or Practice “Practice in” (Practice tab only).
  - **Indicators:** `chapter-line-card__header-indicators` (optional chips).
  - **Moves count:** `<p class="chapter-line-card__moves-count">` when `getLineMoveCount(section, move) > 0`.

---

## 6. CSS / layout details

- **Vertical line (no-chapter):** `top: 0`; no chapter row; line mask from first check to last check (via refs).
- **V6 timeline:** `--timeline-center-offset: calc(16px + var(--timeline-col-width, 24px) / 2)`; line aligned to left column of cards.
- **Line card:** `flex-direction: row` (timeline col left, body right); padding/gap from `.courses-content--v6 .opening-course-card.chapter-line-card--v6-timeline-right`.
- **Timeline node:** 13×13px; uncompleted: border + background; completed: transparent + check icon; next-to-learn/next-to-practice: 8×8 outline (green / aqua).

---

## 7. Practice tab: what to copy vs change

| Item | Learn | Practice (copy) |
|------|--------|------------------|
| Section wrapper | `v23-section-sticky-wrap` > `v23-section-timeline-wrap --v4 --v6` | Same |
| No chapter row | Use `--no-chapter` when opening course | **Always** use `--no-chapter` (no chapter row) |
| Vertical line | `v23-section-timeline-wrap__line` | Same (same color as Learn) |
| Expandable | `v23-expandable--open` | Same |
| Video block | Empty for OC | Empty |
| List wrapper | `move-list-wrap` > `chapter-line-cards-list-wrapper` > `chapter-line-cards-list` | Same |
| Line card order | Timeline col first, body second | Same |
| Line card classes | `chapter-line-card--v6-timeline-right` + state classes | Same + `chapter-line-card--v7-practice` |
| Data source | `getSectionMovesForDisplay(section)` | `section.practiceMoves` (same shape: move + type) |
| Check / node state | `move.completed` | `item.practiceType === 'ready' \|\| 'completed'` |
| Highlight | `nextToLearnRef` | `nextToPracticeRef` (aqua) |

Practice tab must **not** render a chapter row (no `chapter-v2--header`, no ProgressCircle, no section name row). Same as Learn in no-chapter mode: only vertical line + list of line cards.
