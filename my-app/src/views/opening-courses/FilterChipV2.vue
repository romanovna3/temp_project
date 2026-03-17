<!--
  Opening Courses filter chips V2: single "Board position" chip for all moves + keyword tags. No Clear all.
-->
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  filterMoves: { type: Array, default: () => [] },
  keywordTags: { type: Array, default: () => [] },
})

const emit = defineEmits(['clear-board-position', 'remove-keyword-tag'])

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
    </div>
  </div>
</template>
