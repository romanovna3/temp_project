# Scroll-aware filter / search bar (Opening Courses V1)

## Overview

The Opening Courses V1 panel uses a **scroll-linked search bar**: one sticky bar that moves with the scroll (no overlay, no second DOM node). Its vertical offset is updated from the scroll delta so it feels like it scrolls with the content, then hides behind the fixed coach panel.

## DOM structure

1. **Fixed header** (“Courses”) — outside the scroll.
2. **Coach panel** — `opening-v1-coach-wrap` > `section.coach-new-opening.coach-new-opening--fixed`. Fixed at top of the content area; has vertical gradient and text gradient. z-index above the scroll area so the bar slides “behind” it when translated up.
3. **Scroll container** — `opening-v1-scroll-wrap` (`ref="openingV1ScrollWrapRef"`). `overflow-y: auto`; **only this element scrolls**.
   - **First child: search bar** — `opening-filter.opening-filter--sticky-under-coach`. `position: sticky; top: 0`. Transform: `translateY(var(--opening-search-y, 0))` with `transition: none`. Single DOM node; no overlay.
   - **Second child: cards list** — `opening-v1-scroll` > course cards.
4. **Fixed footer** — outside the scroll.

## Behavior

- **Scroll down:** `searchY -= delta` (clamped to `[-H, 0]`). Bar moves up with the content and is covered by the coach.
- **Scroll up:** Same rule; `searchY` increases toward 0, bar slides back down.
- **At top:** Bar is at `searchY === 0`, fully visible. No boolean; the bar is always the same node, just translated.

Bar height `H` is measured from the bar element (`openingSearchRef.value.offsetHeight`) when the Opening V1 view is shown, so the clamp stays correct.

## Implementation details

- **Scroll handler:** `onOpeningContentScroll`; attached with `@scroll.passive` on `opening-v1-scroll-wrap`. Reads `openingV1ScrollWrapRef.value.scrollTop`; no `ev.target` required (ref is used).
- **State:** `openingSearchY` (ref, px), `openingSearchH` (ref, px), `lastOpeningScrollTop` (module-level). No `filterShown` or direction thresholds; movement is purely scroll-linked.
- **CSS:** No transition on the bar’s transform so it stays in sync with scroll. Optional: `is-offscreen` when `searchY < 0` for `pointer-events: none`.

## Code locations

- **File:** `my-app/src/views/Courses.vue`
- **Template:** `opening-v1-layout` > `opening-v1-scroll-wrap` (one filter + cards).
- **Script:** `openingSearchY`, `openingSearchH`, `openingSearchRef`, `openingV1ScrollWrapRef`, `clamp`, `measureOpeningSearchH`, `onOpeningContentScroll`; watch on `isOpeningCoursesV1` to run `measureOpeningSearchH`.
- **Styles:** `.opening-filter`, `.opening-filter--sticky-under-coach`, `--opening-search-y`, `.opening-v1-scroll-wrap`.

See **docs/scroll-direction-filter-spec.md** for the full spec and copy-paste pattern for other projects.
