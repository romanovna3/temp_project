# Scroll & sticky behavior – review and simplification plan

## Your target behavior (main idea)

1. **Scroll down:** When the chapter row reaches the header, it becomes sticky. Order: **header → chapter item**.
2. **Scroll up:** When the tabs slide back in, they sit under the header and push the chapter item down. Order: **header → tabs → chapter item**.

You want it to work reliably and not lag. Push animations and small details are optional.

---

## What the current code does (summary)

- **Two modes:** “Tabs in flow” vs “sticky unit”.
  - **In flow:** Tabs and content are normal document flow. The **list chapter row** uses `position: sticky` and `--course-chapter-sticky-top: courseTabsStickyTopPx` (header height). So the real chapter row sticks under the header.
  - **Sticky unit:** A wrapper (tabs + chapter bar) is `position: sticky; top: 0`. Tabs are translated up with `translateY(courseTabsY)` (0 to -48px). A **separate chapter bar** shows the current chapter and is pushed down by `marginTop: courseTabsY`. The matching list chapter row is **hidden** (collapsed + negative margin) to avoid a duplicate.

- **Mode switching:** Scroll-up accumulation (8px) → leave in-flow, enter sticky; scroll-down accumulation (28px) + min time (220ms) → leave sticky, back to in-flow. At scroll top ≤ 2px → force in-flow and optionally snap `scrollTop = 0`.

- **RAF loop:** In sticky mode, `syncTabsYFromScroll` runs every frame via `requestAnimationFrame`, reads `scrollTop`, sets `courseTabsY` and `--course-tabs-y`, and re-schedules itself. So one continuous loop while sticky.

- **Current chapter:** `updateCurrentChapterNameForFooter()` (throttled 120ms) runs on scroll; it does `getBoundingClientRect()` on every section, picks the “current” section, updates footer name and:
  - **Bar:** `stickyBarDisplaySection` (immediate) for what the sticky bar shows.
  - **Layout:** `currentStickySection` (immediate on first load, **280ms delayed** when changing) so the list row collapse/expand happens after the bar transition.

- **Push transition:** Bar content is wrapped in `<Transition :name="'sticky-chapter-push-' + stickyChapterDirection">` with enter/leave transforms so the next/prev chapter “pushes” the current one.

- **Header height:** `courseTabsStickyTopPx` comes from `coursesContentCoachWrapRef`, which is on a `v-if="false"` node, so it’s always 0 unless something else sets it.

---

## What makes it complex and prone to lag

| Area | Issue |
|------|--------|
| **RAF every frame** | `syncTabsYFromScroll` runs in a tight loop while sticky. Every frame: read scroll, set refs, set CSS var, schedule next RAF. That can keep the main thread busy and contribute to lag. |
| **Two refs for “current”** | `stickyBarDisplaySection` (bar) and `currentStickySection` (collapse) with a 280ms delay between them. Logic is harder to follow and the delayed layout change can cause reflow/jump. |
| **Scroll-up/down accumulation** | Multiple globals: `scrollUpAccumulatedPx`, `scrollDownAccumulatedPx`, `scrollTopWhenSticky`, `lastTimeWentSticky`, thresholds (8px, 28px), STICKY_MIN_MS (220ms). Mode switch depends on deltas and time, not a single clear rule. |
| **Binary in-flow vs sticky** | Big DOM/layout change when switching: chapter bar appears/disappears, wrapper becomes sticky or not, list row collapses. Easy to get jumps or wrong scroll position. |
| **Scroll position fixes** | Saving/restoring `scrollTop` in the 280ms timeout and snapping to 0 at top adds more moving parts and can feel like “fighting” the browser. |
| **Push transition + track** | Extra DOM (track, absolute inner), two refs for bar vs layout, and direction-based transition names. Nice for polish but not required for “just work, no lag”. |

---

## Simplified approach (how I’d do it)

### 1. One sticky block, no mode switch

- **Always** render the same block: **tabs + chapter bar** in one wrapper.
- Wrapper is **always** `position: sticky; top: 0` (or under header if you have a fixed header above the scroll area).
- No “tabs in flow” vs “sticky unit”: the same DOM is always there. So no switch, no sudden appearance of the chapter bar.

Implications:

- From the top of the page you already see: header (if any) → tabs → chapter bar → content. So the “chapter bar” is always visible, not only after scrolling. If that’s not desired, we can keep a **single** switch: “sticky block visible only after user has scrolled past the tabs once” (see option below).

### 2. Derive tabs offset from scroll only (no RAF)

- Single source of truth: **scroll position**.
- In the **scroll handler only** (throttled if needed, e.g. 16ms or 32ms), compute:
  - `scrollTop` = current scroll.
  - “Tabs fully visible” when `scrollTop` is below a threshold (e.g. `scrollTop < 80`).
  - “Tabs fully hidden” when `scrollTop` is above a threshold (e.g. `scrollTop > 400`).
  - In between: `tabsOffsetY = lerp(0, -48, scrollTop)` or a simple formula like `clamp(-48, -scrollTop * 0.12, 0)` so tabs slide as you scroll.

- Set **one reactive value** (e.g. `courseTabsY`) in that scroll handler. No `requestAnimationFrame` loop. No `scrollTopWhenSticky`, no accumulated deltas, no “when we went sticky” time.

Result: **header → (tabs at offset) → chapter bar**. Tabs and chapter bar positions are purely a function of `scrollTop`. Smooth and predictable.

### 3. When to show the sticky block (if you don’t want it at the very top)

If the design is “chapter bar only appears when the chapter row would have hit the header” (current idea), then:

- Keep **one** simple condition: e.g. “sticky block (tabs + chapter bar) is **sticky** only when `scrollTop > tabsHeight` (e.g. 48)”. So until you’ve scrolled 48px, the block is in flow; after that, it sticks. No “in flow” vs “sticky” for tabs vs chapter: the **whole** block is either in flow or sticky.
- When sticky, `courseTabsY` is still derived from `scrollTop` only (no RAF). So: one boolean or one “sticky top” value, plus `courseTabsY` from scroll. No accumulation, no min time.

### 4. One “current chapter” ref, no delay

- **Single ref:** e.g. `currentStickySection`. Use it for:
  - What the chapter bar shows.
  - Which list row to collapse (hide) so there’s no duplicate.
- Update it in the same throttled scroll handler that computes `courseTabsY`: one `getBoundingClientRect` pass over sections, pick current section, set `currentStickySection`. No second ref, no 280ms delay. If a single update causes a visible reflow, throttle the scroll handler (e.g. 80–120ms) instead of delaying the layout update.

### 5. No push transition (or keep it trivial)

- Drop `stickyBarDisplaySection` and `stickyChapterDirection` and the `<Transition>` on the bar (or use a trivial fade). Bar content: just the current chapter by key. Reduces state and DOM.

### 6. Header height

- `courseTabsStickyTopPx` is from a ref that’s on a `v-if="false"` node, so it’s 0. If the header is actually the app header above the scroll container, get its height from a real element (e.g. a ref on the visible header) or a constant, and use that for “chapter sticks under header” (e.g. for `top` of the sticky block or for the bar’s position).

---

## Concrete list of changes I’d make

1. **Remove the RAF loop:** Do not use `requestAnimationFrame(syncTabsYFromScroll)`. In the scroll handler, compute `courseTabsY` from `scrollTop` (with a simple formula or two thresholds) and set it once per scroll.
2. **Simplify mode switch (or remove it):** Either:
   - **Option A:** One sticky block always visible; no in-flow mode. Tabs offset = f(scrollTop).  
   - **Option B:** One condition: “wrapper is sticky when scrollTop > X”. When in flow, `courseTabsY = 0`. When sticky, `courseTabsY = f(scrollTop)`. No 8px/28px accumulation, no 220ms timer.
3. **Single current-section ref:** Use only `currentStickySection` for both the bar and the collapsed row. Remove `stickyBarDisplaySection` and the 280ms delayed update. Update in the same throttled scroll pass that updates `courseTabsY`.
4. **Remove push transition:** Remove `stickyChapterDirection`, the Transition wrapper, and the push CSS classes (or replace with a simple opacity transition). Bar content updates by key only.
5. **Fix header height:** Source `courseTabsStickyTopPx` from a visible element (or constant) so “chapter under header” is correct.
6. **Throttle scroll work:** One throttled (e.g. 80–120ms) function on scroll that: (a) computes `courseTabsY` from `scrollTop`, (b) runs one getBoundingClientRect loop and sets `currentStickySection`. No RAF, no multiple timers.
7. **Optional: preserve scrollTop** only when doing one known layout change (e.g. when collapsing/expanding the current section), and only if you measure a jump. Don’t add multiple save/restore points.

---

## Resulting mental model

- **One sticky block:** header (if any) → [tabs + chapter bar] with `top` = header height (or 0).
- **Tabs offset:** `courseTabsY = f(scrollTop)` in scroll handler (e.g. 0 when scroll &lt; 80, -48 when scroll &gt; 400, linear in between). So on scroll up, tabs slide down and push the chapter bar.
- **Current chapter:** One ref, updated in the same throttled scroll handler; bar shows it, one list row is hidden.
- No RAF, no dual refs, no delay timer, no accumulation. That should be easier to maintain and less likely to lag.

If you want, next step can be a patch that implements this simplified approach in `Courses.vue` (scroll handler + one ref + no RAF, with or without keeping a single “sticky only after scroll past tabs” rule).
