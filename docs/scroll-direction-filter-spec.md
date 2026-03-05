# Scroll-Linked Search Bar Spec (Opening Courses V1)

**Purpose:** One sticky search bar whose vertical offset is **scroll-linked**: it moves with the content (no boolean toggle, no overlay). Same DOM node for all states. Safe to reuse in other projects (Vue 3, Cursor).

---

## 1. Goal & behavior

- **Single search bar** — one DOM node; no overlay, no clone, no in-flow duplicate.
- **Scroll-linked movement** — bar offset is driven by scroll delta: `searchY -= delta`, clamped to `[-H, 0]`. Scroll down → bar moves up (hides behind coach); scroll up → bar moves down (reappears).
- **Feels like it scrolls with content** — no triggered animation; `transition: none` so movement is 1:1 with scroll.
- **Sticky under coach** — `position: sticky; top: 0` on the scroll container (which sits below the coach). Bar hides by translating up and is covered by the coach (higher z-index).
- **No spacer, no handoff, no observers** — no extra divs, no `getBoundingClientRect`, no IntersectionObserver.

---

## 2. What we avoid

- **No overlay / second bar** — do not render a second search bar that appears on scroll up.
- **No boolean show/hide animation** — no `filterShown` + CSS transition that “slides in” on scroll up; that caused the bar to not feel attached to the scroll.
- **No spacer** — no placeholder div; the filter is the first child of the scroll container.
- **No refs for scroll position in handler** other than the scroll container ref (we read `scrollRef.value.scrollTop`).

---

## 3. State & script

```js
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)) }

const searchY = ref(0)           // px, range [-H, 0]
const searchH = ref(92)          // measured height of the bar
const searchRef = ref(null)      // ref on the search bar (for measuring)
const scrollRef = ref(null)      // ref on the scroll container
let lastScrollTop = 0

function measureSearchH() {
  requestAnimationFrame(() => {
    const el = searchRef.value
    if (el) {
      searchH.value = el.offsetHeight || 92
      searchY.value = clamp(searchY.value, -searchH.value, 0)
    }
  })
}

function onScroll() {
  const el = scrollRef.value
  if (!el) return

  const st = el.scrollTop
  const delta = st - lastScrollTop

  // scroll-linked: move opposite to scroll direction
  searchY.value = clamp(searchY.value - delta, -searchH.value, 0)

  lastScrollTop = st
}
```

- **searchY**: reactive offset in px; `0` = fully visible, `-H` = fully hidden.
- **searchH**: height of the bar (measured so clamp is correct).
- **Scroll handler**: bind to the **real** element with `overflow-y: auto`; read `scrollRef.value.scrollTop`. Update `searchY` from delta only; no thresholds or boolean.

Measure the bar height when the view is shown (e.g. `watch(isOpeningV1, () => nextTick(measureSearchH))`).

---

## 4. Template

- **One** scroll container with `ref="scrollRef"` and `@scroll.passive="onScroll"`.
- **One** search bar with `ref="searchRef"`, `:style="{ '--search-y': searchY + 'px' }"`, and optional `:class="{ 'is-offscreen': searchY < 0 }"` for `pointer-events: none` when translated up.

```html
<div ref="scrollRef" class="opening-v1-scroll-wrap" @scroll.passive="onScroll">
  <div
    ref="searchRef"
    class="opening-filter opening-filter--sticky-under-coach"
    :class="{ 'is-offscreen': searchY < 0 }"
    :style="{ '--opening-search-y': `${searchY}px` }"
    role="search"
    aria-label="Search and filter courses"
  >
    <!-- Search panel + meta panel (count, sort) -->
  </div>
  <div class="opening-v1-scroll">
    <!-- List content -->
  </div>
</div>
```

---

## 5. CSS

- **Scroll container**: `overflow-y: auto`, `flex: 1`, `min-height: 0` (so it gets a real height in a flex layout).
- **Search bar**: `position: sticky; top: 0`; transform from CSS variable; **no transition** (or ultra-short e.g. 40ms linear if you want a tiny smoothing; `transition: none` is preferred for “attached” feel).

```css
.opening-filter {
  flex-shrink: 0;
  background-color: rgba(39, 37, 34, 1);
  box-shadow: none;
}

.opening-filter--sticky-under-coach {
  position: sticky;
  top: 0;
  z-index: 5;
  will-change: transform;
  transform: translateY(var(--opening-search-y, 0));
  transition: none;
}

.opening-filter--sticky-under-coach.is-offscreen {
  pointer-events: none;
}

.opening-v1-scroll-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
```

---

## 6. Reference implementation (this project)

- **File:** `my-app/src/views/Courses.vue`
- **Routes:** `/#/learn/opening-courses-v1`, `/#/courses/opening-courses-v1`
- **Names:** `openingSearchY`, `openingSearchH`, `openingSearchRef`, `openingV1ScrollWrapRef`, `lastOpeningScrollTop`, `clamp`, `measureOpeningSearchH`, `onOpeningContentScroll`; classes `opening-filter`, `opening-filter--sticky-under-coach`, `is-offscreen`; CSS var `--opening-search-y`.

If this feature regresses, restore from this spec: scroll-linked `searchY -= delta`, single sticky bar, no overlay, no boolean animation.

---

## 7. For Cursor / other projects

- Copy **§3 State & script**, **§4 Template**, and **§5 CSS**.
- Replace names with your own (e.g. `searchY` → `headerY`, `opening-v1-scroll-wrap` → `main-scroll`).
- Keep: one scroll container with ref + `@scroll.passive`, one sticky bar with ref, `searchY = clamp(searchY - delta, -H, 0)`, and `transition: none` on the bar’s transform.
