<script setup>
import { ref, watch, nextTick } from 'vue'
import { CcIcon } from '@chesscom/design-system'
import { MOVE_CLASSIFICATIONS } from '../data/classifications.js'
import BookTooltip from './BookTooltip.vue'

const hoveredBook = ref(null)
const tooltipPos = ref({ top: 0, left: 0 })
let hideTimeout = null

function onBookEnter(event, opening) {
  clearTimeout(hideTimeout)
  const rect = event.currentTarget.getBoundingClientRect()
  tooltipPos.value = {
    top: rect.top + rect.height / 2,
    left: rect.right + 10,
  }
  hoveredBook.value = opening
}

function onBookLeave() {
  hideTimeout = setTimeout(() => { hoveredBook.value = null }, 120)
}

function onTooltipEnter() {
  clearTimeout(hideTimeout)
}

function onTooltipLeave() {
  hoveredBook.value = null
}

const props = defineProps({
  moves: { type: Array, required: true },
  result: { type: String, default: '' },
  activePly: { type: Number, default: 0 },
  autoTooltip: { type: Boolean, default: false },
})

const emit = defineEmits(['select-ply'])

function classificationIcon(key) {
  const cls = MOVE_CLASSIFICATIONS[key]
  return cls ? cls.icon : null
}

function classificationColor(key) {
  if (!key) return null
  return `var(--color-classification-${key})`
}

function plyIndex(moveNum, color) {
  let idx = 0
  for (const move of props.moves) {
    if (move.white) {
      idx++
      if (move.num === moveNum && color === 'white') return idx
    }
    if (move.black) {
      idx++
      if (move.num === moveNum && color === 'black') return idx
    }
  }
  return -1
}

function isActivePly(moveNum, color) {
  return plyIndex(moveNum, color) === props.activePly
}

function onPlyClick(moveNum, color) {
  emit('select-ply', plyIndex(moveNum, color))
}

const plyRefs = ref({})
function setPlyRef(key, el) {
  if (el) plyRefs.value[key] = el
}

const bookIconRefs = ref({})
function setBookIconRef(key, el) {
  if (el) bookIconRefs.value[key] = el
}

const autoTooltipShown = ref(false)

function getActivePlyData() {
  let idx = 0
  for (const move of props.moves) {
    if (move.white) {
      idx++
      if (idx === props.activePly) return { move, color: 'white', data: move.white }
    }
    if (move.black) {
      idx++
      if (idx === props.activePly) return { move, color: 'black', data: move.black }
    }
  }
  return null
}

watch([() => props.activePly, () => props.autoTooltip], async () => {
  await nextTick()
  let targetKey = null
  let idx = 0
  for (const move of props.moves) {
    if (move.white) { idx++; if (idx === props.activePly) { targetKey = `${move.num}-white`; break } }
    if (move.black) { idx++; if (idx === props.activePly) { targetKey = `${move.num}-black`; break } }
  }
  if (targetKey && plyRefs.value[targetKey]) {
    plyRefs.value[targetKey].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }

  if (!props.autoTooltip) {
    if (autoTooltipShown.value) {
      hoveredBook.value = null
    }
    autoTooltipShown.value = false
    return
  }

  const plyInfo = getActivePlyData()
  if (plyInfo && plyInfo.data.lastBook) {
    const key = `${plyInfo.move.num}-${plyInfo.color}`
    await nextTick()
    const el = bookIconRefs.value[key]
    if (el) {
      const rect = el.getBoundingClientRect()
      tooltipPos.value = {
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      }
      hoveredBook.value = plyInfo.data.opening
      autoTooltipShown.value = true
    }
  } else {
    if (autoTooltipShown.value) {
      hoveredBook.value = null
      autoTooltipShown.value = false
    }
  }
})
</script>

<template>
  <div class="move-list">
    <div
      v-for="(move, idx) in moves"
      :key="move.num"
      class="move-row"
      :class="{ 'alt-row': idx % 2 === 1 }"
    >
      <div class="plys">
        <span class="move-number">{{ move.num }}.</span>

        <!-- White ply -->
        <div
          v-if="move.white"
          class="ply-cell"
          :ref="(el) => setPlyRef(`${move.num}-white`, el)"
          @click="onPlyClick(move.num, 'white')"
        >
          <div class="classification-slot">
            <CcIcon
              v-if="move.white.highlighted"
              :name="classificationIcon(move.white.classification)"
              variant="color"
              :size="16"
            />
          </div>
          <div
            class="ply"
            :class="{ 'ply-selected': isActivePly(move.num, 'white') }"
          >
            <div class="piece-notation">
              <span
                v-if="move.white.piece"
                class="piece-glyph"
                :style="move.white.highlighted ? { color: classificationColor(move.white.classification) } : {}"
              >{{ move.white.piece }}</span>
              <span
                class="notation"
                :style="move.white.highlighted ? { color: classificationColor(move.white.classification) } : {}"
              >{{ move.white.san }}</span>
            </div>
          </div>
          <div
            v-if="move.white.lastBook && autoTooltip"
            :ref="(el) => setBookIconRef(`${move.num}-white`, el)"
            class="last-book-wrapper"
            @mouseenter="(e) => onBookEnter(e, move.white.opening)"
            @mouseleave="onBookLeave"
          >
            <CcIcon name="circle-fill-info" :size="16" class="last-book-icon" />
          </div>
        </div>

        <!-- Black ply -->
        <div
          v-if="move.black"
          class="ply-cell"
          :ref="(el) => setPlyRef(`${move.num}-black`, el)"
          @click="onPlyClick(move.num, 'black')"
        >
          <div class="classification-slot">
            <CcIcon
              v-if="move.black.highlighted"
              :name="classificationIcon(move.black.classification)"
              variant="color"
              :size="16"
            />
          </div>
          <div
            class="ply"
            :class="{ 'ply-selected': isActivePly(move.num, 'black') }"
          >
            <div class="piece-notation">
              <span
                v-if="move.black.piece"
                class="piece-glyph"
                :style="move.black.highlighted ? { color: classificationColor(move.black.classification) } : {}"
              >{{ move.black.piece }}</span>
              <span
                class="notation"
                :style="move.black.highlighted ? { color: classificationColor(move.black.classification) } : {}"
              >{{ move.black.san }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game result -->
    <div v-if="result" class="move-row">
      <div class="plys">
        <span class="move-number result-text">{{ result }}</span>
      </div>
    </div>

    <!-- Teleported tooltip escapes all overflow:clip ancestors -->
    <Teleport to="body">
      <div
        v-if="hoveredBook"
        class="book-tooltip-portal"
        :style="{ top: tooltipPos.top + 'px', left: tooltipPos.left + 'px' }"
        @mouseenter="onTooltipEnter"
        @mouseleave="onTooltipLeave"
      >
        <BookTooltip :opening="hoveredBook" />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.move-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: clip;
}

.move-row {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 var(--space-24, 24px);
  overflow: clip;
  flex-shrink: 0;
}

.move-row.alt-row {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
}

.plys {
  display: flex;
  align-items: center;
}

.move-number {
  width: 24px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.result-text {
  width: auto;
}

.ply-cell {
  display: flex;
  align-items: center;
  gap: var(--space-4, 4px);
  width: 100px;
  flex-shrink: 0;
  cursor: pointer;
}

.ply-cell:hover .ply {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.04));
  border-radius: var(--radius-xs, 2px);
}

.classification-slot {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ply {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2, 2px) var(--space-4, 4px);
  border-radius: var(--radius-xs, 2px);
  overflow: clip;
}

.ply-selected {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.05));
  box-shadow: 0 2px 0 0 var(--color-icon-default, rgba(255, 255, 255, 0.5));
}

.piece-notation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 18px;
}

.piece-glyph {
  font-family: 'ChessNote', sans-serif;
  font-size: 14px;
  line-height: 16px;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  width: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 18px;
}

.notation {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  height: 18px;
  white-space: nowrap;
}

.last-book-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.last-book-icon {
  flex-shrink: 0;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

</style>

<style>
.book-tooltip-portal {
  position: fixed;
  transform: translateY(-50%);
  z-index: 10000;
}
</style>
