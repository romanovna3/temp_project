# Backup: Sticky + slide-on-scroll-direction filter (Opening V1)

**Current implementation is scroll-linked** (see **scroll-direction-filter-spec.md**). This file is a backup of the older boolean/headroom version (slide on scroll direction with accumulators). Use only to roll back if needed.

---

## 1. Script (state + handler)

Add/replace in `Courses.vue` with:

```js
// Opening V1: single sticky filter; dead zone, then accumulated scroll to hide/show (so slow scroll works)
const OPENING_TOP_PX = 8
const OPENING_HIDE_AFTER_PX = 64
const OPENING_HIDE_ACCUM_PX = 20
const OPENING_SHOW_ACCUM_PX = 6
const openingFilterShown = ref(true)
let lastOpeningScrollTop = 0
let openingDownAccum = 0
let openingUpAccum = 0

function onOpeningContentScroll(ev) {
  const el = ev?.target
  if (!el || !isOpeningCoursesV1.value) return
  const st = el.scrollTop
  const d = st - lastOpeningScrollTop
  if (st <= OPENING_TOP_PX) {
    openingFilterShown.value = true
    openingDownAccum = 0
    openingUpAccum = 0
  } else if (st < OPENING_HIDE_AFTER_PX) {
    openingDownAccum = 0
    openingUpAccum = 0
  } else {
    if (d > 0) {
      openingDownAccum += d
      openingUpAccum = 0
      if (openingDownAccum >= OPENING_HIDE_ACCUM_PX) {
        openingFilterShown.value = false
        openingDownAccum = 0
      }
    } else if (d < 0) {
      openingUpAccum += -d
      openingDownAccum = 0
      if (openingUpAccum >= OPENING_SHOW_ACCUM_PX) {
        openingFilterShown.value = true
        openingUpAccum = 0
      }
    }
  }
  lastOpeningScrollTop = st
}
```

---

## 2. Template (scroll container + filter)

Scroll container with handler; filter with sticky + is-shown/is-hidden:

```html
<!-- Scroll container: single sticky filter + cards -->
<div
  class="opening-v1-scroll-wrap"
  @scroll.passive="onOpeningContentScroll"
>
  <div
    class="opening-filter opening-filter--sticky"
    :class="{ 'is-shown': openingFilterShown, 'is-hidden': !openingFilterShown }"
    role="search"
    aria-label="Search and filter courses"
  >
    <!-- search panel + sort UI -->
  </div>
  <div class="opening-v1-scroll">
    <!-- course cards list -->
  </div>
</div>
```

---

## 3. CSS

```css
/* Opening V1: single filter, always sticky, slide only (no fade) */
.opening-filter {
  flex-shrink: 0;
  background: var(--color-bg-base, #1a1918);
}
.opening-filter--sticky {
  position: sticky;
  top: 0;
  z-index: 50;
  transition: transform 220ms ease;
  will-change: transform;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.opening-filter--sticky.is-hidden {
  transform: translateY(-100%);
  pointer-events: none;
}
.opening-filter--sticky.is-shown {
  transform: translateY(0);
  pointer-events: auto;
}
```

---

## Rollback steps

1. Restore the script block (constants, `openingFilterShown`, accumulators, `onOpeningContentScroll`).
2. On the scroll container div add `@scroll.passive="onOpeningContentScroll"`.
3. On the filter div add `opening-filter--sticky` and `:class="{ 'is-shown': openingFilterShown, 'is-hidden': !openingFilterShown }"`.
4. Restore the CSS block above (including `.opening-filter--sticky` and `.is-hidden` / `.is-shown`).
