# Scroll behaviour summary: tabs, course card, chapters

How tabs, course card, and chapters behave when you **scroll up** vs **scroll down** in the course panel (V4/V5/V6/V9 and related variants).

---

## 1. Overview

- **Scroll-linked tabs** (V4/V5/V6, including V9): One sticky tabs bar. Its vertical offset is driven by **scroll delta** (no separate “scroll up / scroll down” logic). Same rule both directions.
- **Course card (V9 only):** Sits in a **fixed-height stack** above the scroll area. Stack height includes the “visible” part of the tabs, so when tabs hide, the stack shrinks and the card moves up visually.
- **Chapters:** Use `position: sticky` so the chapter header sticks under the header (and under the visible tabs when scroll-linked). Sticky `top` is either `0` (V9 scroll viewport) or `calc(header + tabs-visible)` (V4/V5/V6 in the main content scroll).

---

## 2. Tabs (Learn / Practice)

**Mechanism:** Scroll-linked. One CSS variable: `--tabs-y` (px). Tabs have `transform: translateY(var(--tabs-y, 0))` and `transition: none`.

**State:**

- `tabsY`: 0 = fully visible, -H = fully hidden (H = tabs height, e.g. 48px).
- Updated in the scroll handler: `delta = scrollTop - lastScrollTop`, then `tabsY = clamp(tabsY - delta, -H, 0)`.

**Scroll down:**

- `delta > 0` → `tabsY` becomes more negative.
- Tabs move **up** (translateY negative), so they hide (e.g. behind the header or out of the stack).

**Scroll up:**

- `delta < 0` → `tabsY` moves toward 0.
- Tabs move **down** and become visible again.

**Gate:** When `scrollTop < tabsStickyStartScrollTop`, the code forces `tabsY = 0` so tabs are fully visible. For **V9**, `tabsStickyStartScrollTop = 0`, so as soon as you’re at the top, tabs are full height.

**Summary:** Behaviour is **symmetric**: scroll down → tabs hide; scroll up → tabs show. No extra “scroll up only” or “scroll down only” rules.

---

## 3. Course card (V9 only)

**Layout:** V9 has a fixed **stack** above the scrollable area:

- Stack height = `calc(var(--header-h) + var(--tabs-visible) + var(--course-h))`.
- Stack contains: spacer (header), tabs bar, course card.
- **Only the content below the stack scrolls** (`v9ScrollRef`).

**Scroll down:**

- User scrolls inside `v9ScrollRef` → `tabsY` decreases → `--tabs-visible` = `tabsY + H` decreases.
- Stack height shrinks → course card (and tabs) move **up** visually; more space for chapter list.

**Scroll up:**

- `tabsY` increases → `--tabs-visible` increases → stack height grows.
- Course card (and tabs) move **down**; stack is taller again.

So the **course card** doesn’t have its own scroll rule; it’s positioned in the stack and the stack height is tied to **tabs-visible**. Same symmetry as tabs: scroll down → stack shorter (card up), scroll up → stack taller (card down).

---

## 4. Chapters (chapter headers / section titles)

**V4/V5/V6 (non-V9, single scroll container):**

- Chapter row uses `position: sticky` with `top: calc(var(--header-h) + var(--tabs-visible))`.
- So the chapter header sticks **under** the header and under the visible part of the tabs.
- When tabs hide (`--tabs-visible` smaller), the sticky top moves up, so the chapter sits higher.
- When tabs show again, sticky top increases, chapter sits lower. Again **symmetric** with scroll direction.

**V9 (separate scroll container for chapters):**

- The scroll container is **below** the fixed stack (header + tabs + course card).
- Chapter sticky is `top: 0` inside that scroll viewport (no header/tabs in that viewport).
- So chapter headers stick to the **top of the scroll area** as you scroll. No direct tie to `--tabs-visible` in that viewport; the stack is fixed above it.

**Scroll down:** Next chapter row reaches the top of the viewport and its header sticks there until the next one replaces it.

**Scroll up:** Previous chapter header comes back into view and sticks when it hits the top. Same logic, no special “scroll up” vs “scroll down” behaviour.

---

## 5. Quick reference table

| Element        | Scroll down                    | Scroll up                       | Symmetric? |
|----------------|---------------------------------|----------------------------------|------------|
| **Tabs**       | `tabsY` more negative → hide   | `tabsY` toward 0 → show          | Yes        |
| **Course card (V9)** | Stack height ↓ → card moves up | Stack height ↑ → card moves down | Yes        |
| **Chapters**   | Next header sticks at top       | Previous header sticks at top    | Yes        |

---

## 6. Implementation notes

- **Scroll handler:** `onCoursesContentScroll` (RAF-throttled). Reads `scrollTop` from `v9ScrollRef` (V9) or `coursesContentRef` (V4/V5/V6), computes `delta`, updates `tabsY` and `--tabs-y` / `--tabs-visible` on `coursesContentRef`.
- **V9 stack height:** `v9StackHeightStyle` = `height: calc(var(--header-h) + var(--tabs-visible) + var(--course-h))`.
- **Opening Courses V1** (course list page) uses a similar scroll-linked pattern for the **search bar** (see `docs/scroll-direction-filter-spec.md` and `docs/scroll-aware-filter.md`); that bar is not tabs/course card/chapters but the same “scroll-linked offset from delta” idea.

---

## 7. Related files and docs

- **CoursesV9.vue:** `onCoursesContentScroll`, `computeTabsStickyStart`, `v9StackHeightStyle`, `v9ScrollRef`, `courseCardV9Ref`, `--tabs-y`, `--tabs-visible`, `--course-h`.
- **docs/scroll-direction-filter-spec.md** – scroll-linked search bar spec (Opening Courses V1).
- **docs/scroll-aware-filter.md** – scroll-linked filter overview.
- **docs/scroll-sticky-simplification-plan.md** – older plan for simplifying sticky/tabs logic (some variants may differ).
