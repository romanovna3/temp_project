<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { CcButton, CcIcon, CcSidebarHeader } from '@chesscom/design-system'
import CoachBubble from './components/CoachBubble.vue'
import MoveList from './components/MoveList.vue'
import { MOVE_CLASSIFICATIONS } from './data/classifications.js'
import { SAMPLE_GAME } from './data/gameData.js'

// #region agent log
fetch('http://127.0.0.1:7249/ingest/fd793dea-b233-4457-aa9c-fda6b0d9d190',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ee0b0a'},body:JSON.stringify({sessionId:'ee0b0a',location:'App.vue:setup',message:'App.vue setup reached',data:{hasCcSidebarHeader:typeof CcSidebarHeader,hasCcButton:typeof CcButton,hasMoveList:typeof MoveList,hasCoachBubble:typeof CoachBubble,hasSampleGame:!!SAMPLE_GAME,sampleGameMoves:SAMPLE_GAME?.moves?.length,hasMoveClassifications:!!MOVE_CLASSIFICATIONS},timestamp:Date.now(),hypothesisId:'H-A,H-B'})}).catch(()=>{});
// #endregion

// ============================================
// BOARD
// ============================================
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const pieces = ref([])

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

pieces.value = parseFEN(INITIAL_FEN)

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

const getPieceOnSquare = (square) => {
  return pieces.value.find(p => p.square === square)
}

const getPieceImage = (piece) => {
  return `https://www.chess.com/chess-themes/pieces/neo/300/${piece.type}.png`
}

// ============================================
// RESIZABLE PANEL
// ============================================
const MIN_PANEL_WIDTH = 300
const MAX_PANEL_WIDTH = 500

const panelWidth = ref(400)

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
// COACH STATE (Skills-style API)
// ============================================
const coachHeaderIcon = ref(MOVE_CLASSIFICATIONS.great.icon)
const coachHeaderText = ref('xf7# is a great move')
const coachEvalText = ref('1-0')
const coachWhiteAdvantage = ref(true)
const coachMessage = ref('Checkmate is always the best move! Lorem ipsum dolor Lorem ipsum dolor')

const showCoachBubble = ref(true)
function onCoachBubbleLeave() {
  showCoachBubble.value = true
}

// ============================================
// GAME DATA
// ============================================
const gameMoves = ref(SAMPLE_GAME.moves)
const gameResult = ref(SAMPLE_GAME.result)
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
          title="Game Review"
          feature-icon="magnifier-star"
          :has-back-button="true"
          :end-icon="{ name: 'media-audio-speaker-noise' }"
          :end-icon-secondary="{ name: 'tool-magnifier-checker-1' }"
        />

        <!-- 2. Coach section -->
        <div class="coach-section">
          <CoachBubble
            :header-icon="coachHeaderIcon"
            :header-text="coachHeaderText"
            :eval-text="coachEvalText"
            :white-advantage="coachWhiteAdvantage"
            :message="coachMessage"
            :show-tip="true"
            :visible="showCoachBubble"
            @after-leave="onCoachBubbleLeave"
          />
        </div>

        <!-- 3. Share / Next buttons -->
        <div class="button-pair top-buttons">
          <CcButton variant="secondary" :icon="{ name: 'graph-nodes-share' }">Share</CcButton>
          <CcButton variant="primary" :icon="{ name: 'arrow-line-right' }">Next</CcButton>
        </div>

        <!-- 4. Scrollable move list area -->
        <div class="move-list-scroll">
          <MoveList :moves="gameMoves" :result="gameResult" />

          <!-- Highlights / Time buttons at bottom of scroll -->
          <div class="button-pair bottom-buttons">
            <CcButton variant="secondary" :icon="{ name: 'arrow-line-left' }">Highlights</CcButton>
            <CcButton variant="secondary" :icon="{ name: 'game-time-rapid' }">10 min</CcButton>
          </div>
        </div>

        <!-- 5. Evaluation graph placeholder -->
        <div class="eval-graph-section">
          <div class="eval-graph-placeholder"></div>
        </div>

        <!-- 6. Move navigation controls -->
        <div class="controls-bar">
          <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-start' }" />
          <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-left' }" />
          <CcButton variant="secondary" size="large" :icon="{ name: 'media-control-play' }" />
          <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-right' }" :disabled="true" />
          <CcButton variant="secondary" size="large" :icon="{ name: 'arrow-chevron-end' }" :disabled="true" />
        </div>

        <!-- Resize handle (right edge) -->
        <div class="resize-handle" @mousedown="onResizeStart"></div>
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
  padding: var(--space-16, 16px) var(--space-24, 24px) 0;
  flex-shrink: 0;
}

.panel-lg .coach-section {
  padding: var(--space-16, 16px) var(--space-16, 16px) 0;
}

/* Button pairs */
.button-pair {
  display: flex;
  gap: var(--space-8, 8px);
  padding: 0 var(--space-24, 24px);
  flex-shrink: 0;
}

.panel-lg .button-pair {
  padding: 0 var(--space-16, 16px);
}

.button-pair > :deep(*) {
  flex: 1;
  min-width: 0;
}

.top-buttons {
  padding-top: var(--space-8, 8px);
  padding-bottom: 0;
}

.bottom-buttons {
  padding-top: 0;
  padding-bottom: 0;
  flex-shrink: 0;
}

/* Scrollable move list area */
.move-list-scroll {
  flex: 1;
  overflow-x: clip;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: var(--space-24, 24px) 0;
}

/* Eval graph */
.eval-graph-section {
  background: #272522;
  padding: var(--space-8, 8px) var(--space-24, 24px) var(--space-4, 4px);
  flex-shrink: 0;
}

.panel-lg .eval-graph-section {
  padding: var(--space-8, 8px) var(--space-16, 16px) var(--space-4, 4px);
}

.eval-graph-placeholder {
  height: 80px;
  border-radius: var(--radius-lg, 8px);
  overflow: clip;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.03) 30%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.03) 70%,
    rgba(255, 255, 255, 0.06) 100%
  );
}

/* Move navigation controls */
.controls-bar {
  display: flex;
  gap: var(--space-8, 8px);
  padding: var(--space-16, 16px) var(--space-24, 24px);
  background: #21201d;
  flex-shrink: 0;
  border-radius: 0 0 var(--radius-md, 5px) var(--radius-md, 5px);
}

.panel-lg .controls-bar {
  padding: var(--space-16, 16px);
}

.controls-bar > :deep(*) {
  flex: 1;
  min-width: 0;
}
</style>
