<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { CcButton, CcIcon, CcSidebarHeader } from '@chesscom/design-system'
import CoachBubble from './components/CoachBubble.vue'
import MoveList from './components/MoveList.vue'
import EvalGraph from './components/EvalGraph.vue'
import OverviewPanel from './components/OverviewPanel.vue'
import { MOVE_CLASSIFICATIONS } from './data/classifications.js'
import { SAMPLE_GAME } from './data/gameData.js'

// ============================================
// FEATURE FLAGS
// ============================================
function readFlagsFromURL() {
  const params = new URLSearchParams(window.location.search)
  return {
    tooltipAppears: params.get('ff_tooltip') === '1',
    highlightBestAndWorst: params.get('ff_highlight') === '1',
  }
}

const featureFlags = ref(readFlagsFromURL())
const flagDrawerOpen = ref(false)

watch(featureFlags, (flags) => {
  const params = new URLSearchParams(window.location.search)
  for (const [key, param] of [['tooltipAppears', 'ff_tooltip'], ['highlightBestAndWorst', 'ff_highlight']]) {
    if (flags[key]) params.set(param, '1')
    else params.delete(param)
  }
  const qs = params.toString()
  const url = window.location.pathname + (qs ? `?${qs}` : '')
  window.history.replaceState(null, '', url)
}, { deep: true })

// ============================================
// SCREEN STATE
// ============================================
const currentScreen = ref('overview')
const isOverview = computed(() => currentScreen.value === 'overview')
const isReview = computed(() => currentScreen.value === 'review')

function startReview() {
  currentScreen.value = 'review'
  currentPly.value = 1
}

function goToReviewPly(ply) {
  currentScreen.value = 'review'
  currentPly.value = ply
}

function goBackToOverview() {
  currentScreen.value = 'overview'
  currentPly.value = 0
}


// ============================================
// BOARD
// ============================================
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

const parseFEN = (fen) => {
  const pieceMap = {
    'r': 'br', 'n': 'bn', 'b': 'bb', 'q': 'bq', 'k': 'bk', 'p': 'bp',
    'R': 'wr', 'N': 'wn', 'B': 'wb', 'Q': 'wq', 'K': 'wk', 'P': 'wp',
  }
  const result = []
  const [position] = fen.split(' ')
  const rows = position.split('/')

  rows.forEach((row, rowIndex) => {
    let colIndex = 0
    for (const char of row) {
      if (/\d/.test(char)) {
        colIndex += parseInt(char, 10)
      } else if (pieceMap[char]) {
        const file = files[colIndex]
        const rank = 8 - rowIndex
        result.push({ type: pieceMap[char], square: `${file}${rank}` })
        colIndex++
      }
    }
  })

  return result
}

const squares = computed(() => {
  const result = []
  for (let rank of ranks) {
    for (let file of files) {
      result.push(`${file}${rank}`)
    }
  }
  return result
})

const isLightSquare = (square) => {
  const fileIndex = files.indexOf(square[0])
  const rankIndex = parseInt(square[1], 10) - 1
  return (fileIndex + rankIndex) % 2 === 1
}

const getPieceImage = (piece) => {
  return `https://www.chess.com/chess-themes/pieces/neo/300/${piece.type}.png`
}

// ============================================
// GAME DATA & NAVIGATION
// ============================================
const gameMoves = ref(SAMPLE_GAME.moves)
const gameResult = ref(SAMPLE_GAME.result)

const allPlies = computed(() => {
  const plies = []
  for (const move of gameMoves.value) {
    if (move.white) plies.push({ ...move.white, moveNum: move.num, color: 'white' })
    if (move.black) plies.push({ ...move.black, moveNum: move.num, color: 'black' })
  }
  return plies
})

const totalPlies = computed(() => allPlies.value.length)
const currentPly = ref(0)

const classificationCounts = computed(() => {
  const white = {}
  const black = {}
  for (const move of gameMoves.value) {
    if (move.white?.classification) white[move.white.classification] = (white[move.white.classification] || 0) + 1
    if (move.black?.classification) black[move.black.classification] = (black[move.black.classification] || 0) + 1
  }
  return { white, black }
})

function goToStart() { currentPly.value = 0 }
function goBack() { currentPly.value = Math.max(0, currentPly.value - 1) }
function goForward() { currentPly.value = Math.min(totalPlies.value, currentPly.value + 1) }
function goToEnd() { currentPly.value = totalPlies.value }
function goToPly(index) { currentPly.value = Math.max(0, Math.min(totalPlies.value, index)) }

const atStart = computed(() => currentPly.value === 0)
const atEnd = computed(() => currentPly.value === totalPlies.value)

// ============================================
// BOARD ← driven by current ply
// ============================================
const currentFen = computed(() => {
  if (currentPly.value === 0) return SAMPLE_GAME.initialFen
  return allPlies.value[currentPly.value - 1].fen
})

const pieces = computed(() => parseFEN(currentFen.value))

const getPieceOnSquare = (square) => {
  return pieces.value.find(p => p.square === square)
}

// ============================================
// RESIZABLE PANEL
// ============================================
const MIN_PANEL_WIDTH = 300
const MAX_PANEL_WIDTH = 500

const panelWidth = ref(460)

const panelBreakpoint = computed(() => {
  if (panelWidth.value < 360) return 'sm'
  if (panelWidth.value < 480) return 'md'
  return 'lg'
})

const panelClass = computed(() => `panel-${panelBreakpoint.value}`)

const panelStyle = computed(() => ({
  width: `${panelWidth.value}px`,
  '--coach-avatar-size': panelBreakpoint.value === 'sm' ? '64px'
    : panelBreakpoint.value === 'md' ? '80px' : '96px',
  '--coach-container-height': panelBreakpoint.value === 'sm' ? '156px'
    : panelBreakpoint.value === 'md' ? '136px' : '116px',
  '--coach-tip-top': panelBreakpoint.value === 'sm' ? '30px'
    : panelBreakpoint.value === 'md' ? '36px' : '50px',
  '--coach-tip-bottom': panelBreakpoint.value === 'sm' ? '12px'
    : panelBreakpoint.value === 'md' ? '22px' : '24px',
  '--bubble-max-height': panelBreakpoint.value === 'sm' ? '156px'
    : panelBreakpoint.value === 'md' ? '136px' : '116px',
}))

let isResizing = false
let resizeStartX = 0
let resizeStartWidth = 0

function onResizeStart(e) {
  e.preventDefault()
  isResizing = true
  resizeStartX = e.clientX
  resizeStartWidth = panelWidth.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onResizeMove(e) {
  if (!isResizing) return
  const delta = e.clientX - resizeStartX
  panelWidth.value = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, resizeStartWidth + delta))
}

function onResizeEnd() {
  isResizing = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})

// ============================================
// COACH STATE ← driven by current ply
// ============================================
const currentPlyData = computed(() =>
  currentPly.value === 0 ? null : allPlies.value[currentPly.value - 1]
)

const coachHeaderIcon = computed(() => {
  const ply = currentPlyData.value
  if (!ply) return ''
  return MOVE_CLASSIFICATIONS[ply.classification]?.icon || ''
})

const coachHeaderText = computed(() => {
  const ply = currentPlyData.value
  if (!ply) return ''
  const cls = MOVE_CLASSIFICATIONS[ply.classification]
  const moveName = `${ply.piece || ''}${ply.san}`
  if (!cls) return moveName
  if (panelBreakpoint.value === 'lg') {
    return `${moveName} is a ${cls.label.toLowerCase()} move`
  }
  return cls.label
})

const coachEvalText = computed(() => {
  const ply = currentPlyData.value
  return ply?.eval || ''
})

const coachWhiteAdvantage = computed(() => {
  const ev = coachEvalText.value
  if (!ev) return true
  return !ev.startsWith('-')
})

const coachMessage = computed(() => {
  if (isOverview.value) return 'Welcome to Game Review!'
  const ply = currentPlyData.value
  return ply?.coachText || 'Review any move to see coach analysis.'
})

const bubbleStartPosition = computed(() => !coachHeaderText.value)

const moveListScrolled = ref(false)
function onMoveListScroll(e) {
  moveListScrolled.value = e.target.scrollTop > 0
}
</script>

<template>
  <div class="app dark-mode">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="board-wrapper">
          <div class="chessboard">
            <div
              v-for="square in squares"
              :key="square"
              class="square"
              :class="[isLightSquare(square) ? 'light' : 'dark']"
              :data-square="square"
            >
              <img
                v-if="getPieceOnSquare(square)"
                class="piece"
                :src="getPieceImage(getPieceOnSquare(square))"
                :alt="getPieceOnSquare(square).type"
                draggable="false"
              />
              <span v-if="square[1] === '1'" class="coord file-coord">{{ square[0] }}</span>
              <span v-if="square[0] === 'a'" class="coord rank-coord">{{ square[1] }}</span>
            </div>
          </div>
        </div>

        <div class="board-settings">
          <CcIcon name="utility-cogwheel" :size="20" />
        </div>
      </div>

      <!-- Right: Panel -->
      <div
        class="review-panel"
        :class="[panelClass]"
        :style="panelStyle"
      >
        <!-- 1. Sidebar Header -->
        <CcSidebarHeader
          variant="secondary"
          title="Game Review"
          feature-icon="magnifier-star"
          :has-back-button="true"
          :end-icon="{ icon: { name: 'media-audio-speaker-noise' } }"
          :end-icon-secondary="{ icon: { name: 'tool-magnifier-checker-1' } }"
          @click-start="goBackToOverview"
        />

        <div class="coach-section" :class="{ 'overview-coach': isOverview }">
          <CoachBubble
            :header-icon="coachHeaderIcon"
            :header-text="coachHeaderText"
            :eval-text="coachEvalText"
            :white-advantage="coachWhiteAdvantage"
            :message="coachMessage"
            :show-tip="true"
            :start-position="bubbleStartPosition"
            :typewriter="isOverview"
          />
        </div>

        <div class="screen-content">
          <div v-if="isReview" class="button-pair top-buttons" :class="{ 'has-scroll-shadow': moveListScrolled }">
            <CcButton variant="secondary" :icon="{ name: 'graph-nodes-share' }">Share</CcButton>
            <CcButton variant="primary" :icon="{ name: 'arrow-line-right' }">Next</CcButton>
          </div>
          <!-- OVERVIEW SCREEN -->
          <OverviewPanel
            v-if="isOverview"
            :players="SAMPLE_GAME.players"
            :time-control="SAMPLE_GAME.timeControl"
            :advanced-stats="SAMPLE_GAME.advancedStats"
            :classification-counts="classificationCounts"
            :plies="allPlies"
            :highlight-best-worst="featureFlags.highlightBestAndWorst"
            @start-review="startReview"
            @go-to-ply="goToReviewPly"
          />

          <!-- REVIEW SCREEN -->
          <template v-if="isReview">
            <!-- Scrollable move list area -->
            <div class="move-list-scroll" @scroll="onMoveListScroll">
              <MoveList
                :moves="gameMoves"
                :result="gameResult"
                :active-ply="currentPly"
                :auto-tooltip="featureFlags.tooltipAppears"
                @select-ply="goToPly"
              />

              <!-- Highlights / Time buttons at bottom of scroll -->
              <div class="button-pair bottom-buttons">
                <CcButton variant="secondary" :icon="{ name: 'arrow-line-left' }">Highlights</CcButton>
                <CcButton variant="secondary" :icon="{ name: 'game-time-rapid' }">10 min</CcButton>
              </div>
            </div>

            <!-- Evaluation graph -->
            <div class="eval-graph-section">
              <EvalGraph
                :plies="allPlies"
                :active-ply="currentPly"
                :highlight-best-worst="featureFlags.highlightBestAndWorst"
                :limit-one-per-type="true"
                @select-ply="goToPly"
              />
            </div>

            <!-- Move navigation controls -->
            <div class="controls-bar">
              <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-start' }" :disabled="atStart" @click="goToStart" />
              <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-left' }" :disabled="atStart" @click="goBack" />
              <CcButton variant="secondary" size="large" :icon="{ name: 'media-control-play' }" />
              <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-right' }" :disabled="atEnd" @click="goForward" />
              <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-end' }" :disabled="atEnd" @click="goToEnd" />
            </div>
          </template>
        </div>

        <!-- Resize handle (right edge) -->
        <div class="resize-handle" @mousedown="onResizeStart"></div>
      </div>
    </div>

    <!-- Feature flag configurator (prototype-awards style) -->
    <div class="feature-flags" :class="{ 'is-open': flagDrawerOpen }">
      <div class="feature-flags-panel">
        <div class="feature-flag-group">
          <div class="feature-flag-row is-toggle-row" @click="featureFlags.tooltipAppears = !featureFlags.tooltipAppears">
            <div class="feature-flag-label">Tooltip Appears</div>
            <label class="feature-switch" @click.stop>
              <input type="checkbox" v-model="featureFlags.tooltipAppears">
              <span class="feature-switch-ui"></span>
            </label>
          </div>
          <div class="feature-flag-row is-toggle-row" @click="featureFlags.highlightBestAndWorst = !featureFlags.highlightBestAndWorst">
            <div class="feature-flag-label">Highlight Best &amp; Worst</div>
            <label class="feature-switch" @click.stop>
              <input type="checkbox" v-model="featureFlags.highlightBestAndWorst">
              <span class="feature-switch-ui"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="feature-flags-footer">
        <button class="feature-flags-toggle" type="button" @click="flagDrawerOpen = !flagDrawerOpen">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-flags-cog">
            <path d="M14 17H5" /><path d="M19 7h-9" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
html {
  box-sizing: border-box;
  font-size: 62.5%;
}
*, *::before, *::after {
  box-sizing: inherit;
}
body {
  margin: 0;
  background: var(--color-bg-primary, #312e2b);
  color: var(--color-text-boldest, white);
  font-family: 'Chess Sans', system-ui, sans-serif;
  user-select: none;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.4rem;
}

.layout {
  display: flex;
  gap: 3.2rem;
  height: 68rem;
}

/* Board */
.board-section {
  position: relative;
  display: flex;
  overflow: visible;
}

.board-wrapper {
  display: inline-block;
  position: relative;
  border-radius: 3px;
  overflow: visible;
}

.chessboard {
  position: relative;
  width: 68rem;
  height: 68rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border-radius: 3px;
  overflow: hidden;
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.square.light { background: #ebecd0; }
.square.dark { background: #779556; }

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  user-select: none;
}

.coord {
  position: absolute;
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  pointer-events: none;
}

.file-coord {
  bottom: 0.2rem;
  right: 0.3rem;
}

.rank-coord {
  top: 0.2rem;
  left: 0.3rem;
}

.square.dark .coord {
  color: #ebecd0;
}

.square.light .coord {
  color: #779556;
}

.board-settings {
  position: absolute;
  top: 0.6rem;
  right: -2.6rem;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

/* ============================================
   PANEL (resizable 300-500px)
   ============================================ */
.review-panel {
  position: relative;
  height: 68rem;
  background: var(--color-bg-secondary, rgba(0, 0, 0, 0.2));
  border-radius: var(--radius-md, 5px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Resize handle on right edge */
.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 32px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.2);
  transition: background 150ms ease;
}

.resize-handle:hover::after {
  background: rgba(255, 255, 255, 0.5);
}

/* Coach section */
.coach-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  padding: var(--space-24, 24px) var(--space-24, 24px) 0;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: box-shadow 150ms ease;
}

.coach-section.overview-coach {
  padding-bottom: var(--space-8, 8px);
}

.coach-section.overview-coach :deep(.coach-container) {
  height: auto;
}

.panel-sm .coach-section {
  padding: var(--space-16, 16px) var(--space-16, 16px) 0;
}

.panel-sm .coach-section.overview-coach {
  padding-bottom: var(--space-8, 8px);
}

/* Button pairs */
.button-pair {
  display: flex;
  gap: var(--space-8, 8px);
  padding: 0 var(--space-24, 24px);
  flex-shrink: 0;
}

.panel-sm .button-pair {
  padding: 0 var(--space-16, 16px);
}

.button-pair > :deep(*) {
  flex: 1;
  min-width: 0;
}

.top-buttons {
  padding: var(--space-8, 8px) var(--space-24, 24px) 0 !important;
  position: relative;
}

.panel-sm .top-buttons {
  padding: var(--space-8, 8px) var(--space-16, 16px) 0 !important;
}

.top-buttons::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  right: 0;
  height: 12px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
  z-index: 2;
}

.top-buttons.has-scroll-shadow::after {
  opacity: 1;
}

.bottom-buttons {
  padding: 0 !important;
  flex-shrink: 0;
}

/* Scrollable move list area */
.move-list-scroll {
  flex: 1;
  overflow-x: clip;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: var(--space-8, 8px) var(--space-24, 24px) var(--space-24, 24px);
}

.panel-sm .move-list-scroll {
  padding: var(--space-8, 8px) var(--space-16, 16px) var(--space-24, 24px);
}

/* Eval graph */
.eval-graph-section {
  background: #272522;
  padding: var(--space-8, 8px) var(--space-24, 24px) var(--space-8, 8px);
  flex-shrink: 0;
}

.panel-sm .eval-graph-section {
  padding: var(--space-8, 8px) var(--space-16, 16px) var(--space-8, 8px);
}


/* Move navigation controls */
.controls-bar {
  display: flex;
  gap: var(--space-8, 8px);
  padding: var(--space-8, 8px) var(--space-24, 24px) var(--space-16, 16px);
  background: #21201d;
  flex-shrink: 0;
  border-radius: 0 0 var(--radius-md, 5px) var(--radius-md, 5px);
}

.panel-sm .controls-bar {
  padding: var(--space-8, 8px) var(--space-16, 16px) var(--space-16, 16px);
}

.controls-bar > :deep(*) {
  flex: 1;
  min-width: 0;
}

/* Remove move-row horizontal padding — container handles it */
:deep(.move-row) {
  padding-left: 0;
  padding-right: 0;
}

/* Overview responsive overrides */
.panel-sm :deep(.overview-scroll) {
  padding-left: var(--space-16, 16px);
  padding-right: var(--space-16, 16px);
}

.panel-sm :deep(.overview-bottom) {
  padding-left: var(--space-16, 16px);
  padding-right: var(--space-16, 16px);
}

.screen-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* Feature flag configurator (prototype-awards style) */
.feature-flags {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 9998;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  overflow: hidden;
  transform-origin: bottom right;
  user-select: none;
  -webkit-user-select: none;
  transition: width 0.22s ease, height 0.22s ease, border-radius 0.22s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
}

.feature-flags.is-open {
  width: 220px;
  height: 145px;
}

.feature-flags-toggle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 52px;
  height: 52px;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.feature-flags-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  min-height: 52px;
  background: rgba(255, 255, 255, 0.04);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.feature-flags:not(.is-open) .feature-flags-footer {
  background: transparent;
  border-top-color: transparent;
}

.feature-flags-cog {
  width: 20px;
  height: 20px;
}

.feature-flags-panel {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  width: 220px;
  padding: 12px 0 64px;
  opacity: 0;
  transform: scale(0.96);
  transform-origin: bottom right;
  pointer-events: none;
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.feature-flags.is-open .feature-flags-panel {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}

.feature-flag-group {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-flag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.feature-flag-row.is-toggle-row {
  cursor: pointer;
}

.feature-flag-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-switch {
  position: relative;
  width: 34px;
  height: 18px;
  flex: 0 0 auto;
}

.feature-switch input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.feature-switch-ui {
  position: absolute;
  top: 2px;
  right: 0;
  width: 30px;
  height: 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  transition: background 0.18s ease;
}

.feature-switch-ui::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.18s ease;
}

.feature-switch input:checked + .feature-switch-ui {
  background: rgba(129, 182, 76, 0.8);
}

.feature-switch input:checked + .feature-switch-ui::after {
  transform: translateX(16px);
}
</style>
