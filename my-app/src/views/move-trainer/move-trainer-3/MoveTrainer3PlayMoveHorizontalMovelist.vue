<script setup>
/**
 * Play Move + OM shell — inline PG notation for all plies unlocked so far (`footerNavMaxPly`).
 * `activePlyIndex` tracks the scrub cursor (`currentPly`), not how many pills are shown.
 * Clicking a SAN jumps `currentPly` in the parent (main line); pass `-1` to suppress highlight (e.g. OM branch chips active).
 *
 * Overflow: scrollbar hidden; left/right dissolve masks follow scroll position; selection scrolls into view.
 */
import { computed, ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  /** Flattened main-line plies with moveNum, color, san, piece (optional). */
  plies: { type: Array, required: true },
  /** Index (0-based in `plies`) of the position being viewed; highlight that SAN pill. */
  activePlyIndex: { type: Number, default: -1 },
  /** When false, SAN pills are not clickable (e.g. static previews). */
  clickable: { type: Boolean, default: true },
})

const emit = defineEmits(['select-ply'])

const scrollEl = ref(null)
const fadeLeft = ref(false)
const fadeRight = ref(false)

let resizeObserver = null

function updateFadeEdges() {
  const el = scrollEl.value
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  fadeLeft.value = scrollLeft > 2
  fadeRight.value = scrollLeft + clientWidth < scrollWidth - 2
}

function teardownResizeObserver() {
  resizeObserver?.disconnect()
  resizeObserver = null
}

function setupResizeObserver() {
  teardownResizeObserver()
  const el = scrollEl.value
  if (!el) return
  resizeObserver = new ResizeObserver(() => {
    updateFadeEdges()
  })
  resizeObserver.observe(el)
  updateFadeEdges()
}

watch(scrollEl, (el) => {
  if (el) {
    nextTick(() => {
      setupResizeObserver()
      updateFadeEdges()
    })
  } else {
    teardownResizeObserver()
  }
})

watch(
  () => props.plies.length,
  () => nextTick(() => updateFadeEdges()),
)

watch(
  () => props.activePlyIndex,
  async (idx) => {
    if (typeof idx !== 'number' || idx < 0) return
    await nextTick()
    const root = scrollEl.value
    if (!root) return
    const target = root.querySelector(`[data-hml-idx="${idx}"]`)
    target?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  },
)

onUnmounted(() => {
  teardownResizeObserver()
})

const PIECE_GLYPH_TO_SAN_LETTER = Object.freeze({
  k: 'K',
  K: 'K',
  q: 'Q',
  Q: 'Q',
  r: 'R',
  R: 'R',
  b: 'B',
  B: 'B',
  n: 'N',
  N: 'N',
})

function sanDisplayForPieceIcon(san, pieceGlyph) {
  if (!pieceGlyph || !san) return san
  const letter = PIECE_GLYPH_TO_SAN_LETTER[pieceGlyph]
  if (!letter || !san.startsWith(letter)) return san
  return san.slice(1)
}

const hasMoves = computed(() => props.plies.length > 0)

function onSelectPly(idx) {
  if (!props.clickable) return
  emit('select-ply', idx)
}
</script>

<template>
  <div v-if="hasMoves" class="mt3-hml-viewport">
    <div
      ref="scrollEl"
      class="mt3-hml-scroll"
      aria-label="Moves played in this line"
      @scroll.passive="updateFadeEdges"
    >
      <template v-for="(ply, idx) in plies" :key="idx">
        <span v-if="ply.color === 'white'" class="mt3-hml-move-num cc-paragraph-medium">{{ ply.moveNum }}.</span>
        <button
          v-if="clickable"
          type="button"
          class="mt3-hml-san"
          :class="{ 'mt3-hml-san--selected': idx === activePlyIndex }"
          :data-hml-idx="idx"
          :aria-current="idx === activePlyIndex ? 'true' : undefined"
          :aria-label="`Go to position after ${ply.san}`"
          @click="onSelectPly(idx)"
        >
          <span v-if="ply.piece" class="mt3-hml-piece">{{ ply.piece }}</span>
          <span class="mt3-hml-san-text">{{ sanDisplayForPieceIcon(ply.san, ply.piece) }}</span>
        </button>
        <span
          v-else
          class="mt3-hml-san"
          :class="{ 'mt3-hml-san--selected': idx === activePlyIndex }"
          :data-hml-idx="idx"
        >
          <span v-if="ply.piece" class="mt3-hml-piece">{{ ply.piece }}</span>
          <span class="mt3-hml-san-text">{{ sanDisplayForPieceIcon(ply.san, ply.piece) }}</span>
        </span>
      </template>
    </div>
    <div
      class="mt3-hml-fade mt3-hml-fade--left"
      :class="{ 'mt3-hml-fade--active': fadeLeft }"
      aria-hidden="true"
    />
    <div
      class="mt3-hml-fade mt3-hml-fade--right"
      :class="{ 'mt3-hml-fade--active': fadeRight }"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.mt3-hml-viewport {
  position: relative;
  width: 100%;
  min-height: 32px;
  padding: 0 0 10px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.mt3-hml-scroll {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0 6px;
  width: 100%;
  min-height: 32px;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  /* Reduce browser scroll anchoring jumps when selection styling updates during scrub. */
  overflow-anchor: none;
}

.mt3-hml-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* Dissolve scrim — matches dark footer chrome behind movelist */
.mt3-hml-fade {
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 10px;
  width: 28px;
  opacity: 0;
  transition: opacity 160ms ease-out;
}

.mt3-hml-fade--active {
  opacity: 1;
}

.mt3-hml-fade--left {
  left: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.55), transparent);
}

.mt3-hml-fade--right {
  right: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.55), transparent);
}

.mt3-hml-move-num {
  flex-shrink: 0;
  font-family: var(--font-family-system, system-ui, sans-serif);
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.mt3-hml-san {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  padding: var(--space-2, 2px) var(--space-4, 4px);
  border-radius: 3px;
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
  white-space: nowrap;
}

button.mt3-hml-san {
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  box-sizing: border-box;
}

button.mt3-hml-san:focus-visible {
  outline: 2px solid var(--color-icon-default, rgba(255, 255, 255, 0.5));
  outline-offset: 2px;
}

.mt3-hml-san--selected {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.05));
  box-shadow: 0 2px 0 0 var(--color-icon-default, rgba(255, 255, 255, 0.5));
  color: var(--color-text-default, rgba(255, 255, 255, 0.92));
}

.mt3-hml-piece {
  font-family: 'ChessNote', sans-serif;
  font-size: 14px;
  line-height: 16px;
  width: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mt3-hml-san-text {
  white-space: nowrap;
}
</style>
