<!--
  Opening Courses filter chips V2: single "Board position" chip + keyword tags. Clear all when > 1 chip; horizontal scroll when overflow.
-->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  filterMoves: { type: Array, default: () => [] },
  keywordTags: { type: Array, default: () => [] },
})

const emit = defineEmits(['clear-board-position', 'remove-keyword-tag', 'clear-all'])

const totalChipCount = computed(() => (props.filterMoves.length > 0 ? 1 : 0) + props.keywordTags.length)
const showClearAll = computed(() => totalChipCount.value > 1)

const chipsScrollRef = ref(null)
const chipsOverflowRight = ref(false)
const CHIPS_SCROLL_PERCENT = 0.7

function updateChipsOverflow() {
  const el = chipsScrollRef.value
  if (!el) {
    chipsOverflowRight.value = false
    return
  }
  const canScrollRight = el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 1
  chipsOverflowRight.value = canScrollRight
}

function onScroll() {
  updateChipsOverflow()
}

function scrollChipsRight() {
  const el = chipsScrollRef.value
  if (!el || !chipsOverflowRight.value) return
  const delta = Math.max(1, Math.floor(el.clientWidth * CHIPS_SCROLL_PERCENT))
  el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
}

const hasBoardPosition = () => props.filterMoves.length > 0

let chipsResizeObserver = null
watch(
  chipsScrollRef,
  (el) => {
    if (chipsResizeObserver) {
      chipsResizeObserver.disconnect()
      chipsResizeObserver = null
    }
    if (el && typeof ResizeObserver !== 'undefined') {
      chipsResizeObserver = new ResizeObserver(() => updateChipsOverflow())
      chipsResizeObserver.observe(el)
    }
  },
  { flush: 'post' }
)
watch(
  () => [props.filterMoves.length, props.keywordTags.length],
  () => nextTick(updateChipsOverflow)
)
onUnmounted(() => {
  if (chipsResizeObserver && chipsScrollRef.value) {
    chipsResizeObserver.disconnect()
  }
})
onMounted(() => nextTick(updateChipsOverflow))
</script>

<template>
  <div class="opening-chips-row" role="list" aria-label="Filter chips">
    <div class="opening-chips-scroll-wrap">
      <div
        ref="chipsScrollRef"
        class="opening-move-chips-scroll"
        role="list"
        tabindex="-1"
        @scroll="onScroll"
      >
        <div class="opening-move-chips">
          <button
            v-if="hasBoardPosition()"
            type="button"
            class="opening-move-chip"
            role="listitem"
            aria-label="Remove board position filter"
            @click="emit('clear-board-position')"
          >
            <span class="opening-move-chip__label">Board position</span>
            <span class="opening-move-chip__x" aria-hidden="true">×</span>
          </button>
          <button
            v-for="(tag, idx) in keywordTags"
            :key="'tag-' + idx"
            type="button"
            class="opening-move-chip opening-move-chip--keyword"
            role="listitem"
            :aria-label="`Remove tag ${tag}`"
            @click="emit('remove-keyword-tag', idx)"
          >
            <span class="opening-move-chip__label">{{ tag }}</span>
            <span class="opening-move-chip__x" aria-hidden="true">×</span>
          </button>
        </div>
      </div>
      <div v-if="chipsOverflowRight" class="opening-chips-fade" aria-hidden="true" />
    </div>
    <div class="opening-chips-actions">
      <button
        v-if="chipsOverflowRight"
        type="button"
        class="opening-chips-chevron-btn"
        aria-label="Scroll chips right"
        @click="scrollChipsRight"
      >
        <CcIcon name="arrow-chevron-right" variant="glyph" :size="16" aria-hidden="true" />
      </button>
      <button
        v-if="showClearAll"
        type="button"
        class="opening-chips-clear-all"
        @click="emit('clear-all')"
      >
        Clear all
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Chips row + chip styling – match OpeningCoursesV2.vue (same as before extraction) */
.opening-chips-row {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  min-height: 28px;
  height: auto;
  flex-shrink: 0;
}
.opening-chips-scroll-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}
.opening-move-chips-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}
.opening-move-chips-scroll::-webkit-scrollbar {
  display: none;
}
.opening-move-chips-scroll:focus {
  outline: none;
}
.opening-chips-fade {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  background: linear-gradient(to right, transparent, rgba(39, 37, 34, 1));
}
.opening-chips-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-4, 4px);
  padding-left: var(--space-8, 8px);
  background: rgba(39, 37, 34, 1);
}
.opening-chips-chevron-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-2, 4px);
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
}
.opening-chips-chevron-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}
.opening-chips-clear-all {
  padding: 4px 0;
  border: none;
  background: none;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 13px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  white-space: nowrap;
}
.opening-chips-clear-all:hover {
  color: rgba(255, 255, 255, 0.95);
}
.opening-move-chips {
  display: flex;
  flex-wrap: nowrap;
  gap: var(--space-8, 8px);
  padding: 0;
  min-width: min-content;
}
.opening-move-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: var(--radius-2, 4px);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
  border: none;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 13px;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
}
.opening-move-chip:hover {
  background: rgba(255, 255, 255, 0.18);
}
.opening-move-chip__label {
  color: rgba(255, 255, 255, 0.7);
}
.opening-move-chip__x {
  font-size: 16px;
  line-height: 1;
  opacity: 0.85;
}
</style>
