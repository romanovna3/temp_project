<script setup>
/**
 * Move Trainer 3 center column — cloned from Move Trainer 2 / intro-1:
 * MoveListHeader, CoachBubble, MoveList, Panel footer (Video + Start learning).
 */
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CcButton, CcIcon } from '@chesscom/design-system'
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import MoveList from '@move-trainer/components/MoveList.vue'
import MoveListHeader from '@move-trainer/components/MoveListHeader.vue'
import PanelFooterV10 from '@move-trainer/components/PanelFooterV10.vue'
import { MOVE_CLASSIFICATIONS } from '@move-trainer/data/classifications.js'
import { INTRO_1_GAME } from '@move-trainer/data/gameData.js'
import {
  MOVE_TRAINER_LINE_ORDER,
  firstIntroAssistedPath,
  moveTrainerNextPath,
  moveTrainerPrevPath,
} from '@move-trainer/data/moveTrainerLineOrder.js'

const INTRO_COACH_MESSAGE =
  "Take a moment to review the moves, then start learning whenever you're ready."

const emit = defineEmits(['board-sync'])

const router = useRouter()

const gameMoves = ref([...INTRO_1_GAME.moves])
const gameResult = ref(INTRO_1_GAME.result)

const allPlies = computed(() => {
  const plies = []
  for (const move of gameMoves.value) {
    if (move.white) plies.push({ ...move.white, moveNum: move.num, color: 'white' })
    if (move.black) plies.push({ ...move.black, moveNum: move.num, color: 'black' })
  }
  return plies
})

const totalPlies = computed(() => allPlies.value.length)
const currentPly = ref(1)
const reviewMaxPly = computed(() => totalPlies.value)
const atStart = computed(() => currentPly.value === 0)
const atReviewLineEnd = computed(() => currentPly.value >= reviewMaxPly.value)

const intro1Line = computed(() => MOVE_TRAINER_LINE_ORDER.find((e) => e.name === 'move-trainer-intro-1'))

const lineHeaderTitle = computed(() => intro1Line.value?.lineHeader ?? 'Leave the Queen at Home!')

const moveTrainerLineNav = computed(() => {
  const line = intro1Line.value
  if (!line) return { prevDisabled: true, nextDisabled: true }
  const last = MOVE_TRAINER_LINE_ORDER.length - 1
  const idx = MOVE_TRAINER_LINE_ORDER.findIndex((e) => e.path === line.path)
  return {
    prevDisabled: idx <= 0,
    nextDisabled: idx < 0 || idx >= last,
  }
})

/** Intro: coach anchored to first played ply (matches MoveTrainerView). */
const coachPlyData = computed(() => allPlies.value[0] ?? null)

const coachHeaderIcon = computed(() => {
  const ply = coachPlyData.value
  if (!ply) return ''
  return MOVE_CLASSIFICATIONS[ply.classification]?.icon || ''
})

const coachHeaderText = computed(() => {
  const ply = coachPlyData.value
  if (!ply) return ''
  const cls = MOVE_CLASSIFICATIONS[ply.classification]
  const moveName = `${ply.piece || ''}${ply.san}`
  if (!cls) return moveName
  return `${moveName} is a ${cls.label.toLowerCase()} move`
})

const coachEvalText = computed(() => coachPlyData.value?.eval ?? '')
const coachWhiteAdvantage = computed(() => {
  const ev = coachEvalText.value
  if (!ev) return true
  return !ev.startsWith('-')
})

const coachMessage = computed(() => INTRO_COACH_MESSAGE)
const coachTurnStripText = 'White to move'
const bubbleStartPosition = computed(() => !coachHeaderText.value)
const coachAvatarIconPx = 96

const currentFen = computed(() => {
  if (currentPly.value === 0) return INTRO_1_GAME.initialFen
  const ply = allPlies.value[currentPly.value - 1]
  return ply?.fen ?? INTRO_1_GAME.initialFen
})

function emitBoardSync() {
  const fen = currentFen.value
  let lastMove = null
  if (currentPly.value > 0) {
    const ply = allPlies.value[currentPly.value - 1]
    if (ply?.from && ply?.to) {
      lastMove = { from: ply.from, to: ply.to }
    }
  }
  emit('board-sync', { fen, lastMove })
}

watch(currentPly, () => emitBoardSync(), { immediate: true })

function goBack() {
  currentPly.value = Math.max(0, currentPly.value - 1)
}
function goForward() {
  currentPly.value = Math.min(reviewMaxPly.value, currentPly.value + 1)
}
function goToPly(index) {
  currentPly.value = Math.max(0, Math.min(reviewMaxPly.value, index))
}

const footerNavBackDisabled = computed(() => atStart.value)
const footerNavForwardDisabled = computed(() => atReviewLineEnd.value)

function toggleVideoToolbar() {
  /* Placeholder — video toolbar parity with Move Trainer 2 can be wired later. */
}

function onOpeningLinePrev() {
  const base = intro1Line.value?.path
  if (!base) return
  const prev = moveTrainerPrevPath(base)
  if (prev) router.push(prev)
}

function onOpeningLineNext() {
  const base = intro1Line.value?.path
  if (!base) return
  const next = moveTrainerNextPath(base)
  if (next) router.push(next)
}

function onStartLearning() {
  const next = firstIntroAssistedPath('intro-1')
  if (next) router.push(next)
}

</script>

<template>
  <div class="move-trainer-3-panel-content panel-lg">
    <div class="line-header-row">
      <MoveListHeader
        :title="lineHeaderTitle"
        :prev-disabled="moveTrainerLineNav.prevDisabled"
        :next-disabled="moveTrainerLineNav.nextDisabled"
        @next="onOpeningLineNext"
        @prev="onOpeningLinePrev"
      />
    </div>

    <div class="coach-section">
      <CoachBubble
        :header-icon="coachHeaderIcon"
        :header-text="coachHeaderText"
        :eval-text="coachEvalText"
        :white-advantage="coachWhiteAdvantage"
        :message="coachMessage"
        :coach-avatar-icon-px="coachAvatarIconPx"
        :turn-strip-text="coachTurnStripText"
        :show-tip="true"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        :fill-available-height="false"
        :start-position="bubbleStartPosition"
      />
    </div>

    <div class="screen-content">
      <div class="screen-content-main">
        <div class="move-list-scroll">
          <MoveList
            :moves="gameMoves"
            :result="gameResult"
            :show-game-result="false"
            :active-ply="currentPly"
            :auto-tooltip="false"
            @select-ply="goToPly"
          />
        </div>
      </div>

      <PanelFooterV10 class="review-panel-footer">
        <template #actions>
          <div class="footer-buttons-row footer-buttons-row-split">
            <CcButton
              variant="secondary"
              size="large"
              class="footer-btn-equal"
              :icon="{ name: 'media-camera-video-on' }"
              @click="toggleVideoToolbar"
            >
              Video
            </CcButton>
            <CcButton
              variant="primary"
              size="large"
              class="footer-btn-equal"
              :disabled="moveTrainerLineNav.nextDisabled"
              @click="onStartLearning"
            >
              Start Learning
            </CcButton>
          </div>
        </template>
        <template #toolbar>
          <div class="footer-icon-group">
            <button type="button" class="footer-icon-btn" aria-label="More options">
              <CcIcon name="mark-ellipsis-horizontal" variant="glyph" :size="20" class="footer-icon" />
            </button>
            <button type="button" class="footer-icon-btn" aria-label="Open line notes">
              <CcIcon name="document-book-open" variant="glyph" :size="20" class="footer-icon" />
            </button>
            <button type="button" class="footer-icon-btn" aria-label="Line information">
              <CcIcon name="circle-fill-info" variant="glyph" :size="20" class="footer-icon" />
            </button>
          </div>
          <div class="footer-icon-group">
            <button
              type="button"
              class="footer-icon-btn"
              aria-label="Previous move"
              :disabled="footerNavBackDisabled"
              @click="goBack"
            >
              <CcIcon name="arrow-chevron-left" variant="glyph" :size="20" class="footer-icon" />
            </button>
            <button
              type="button"
              class="footer-icon-btn"
              aria-label="Next move"
              :disabled="footerNavForwardDisabled"
              @click="goForward"
            >
              <CcIcon name="arrow-chevron-right" variant="glyph" :size="20" class="footer-icon" />
            </button>
          </div>
        </template>
      </PanelFooterV10>
    </div>
  </div>
</template>

<style scoped>
.move-trainer-3-panel-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  --coach-avatar-size: 96px;
  --coach-container-height: 116px;
  --coach-tip-top: 50px;
  --coach-tip-bottom: 24px;
  --bubble-max-height: 116px;
}

.line-header-row {
  flex-shrink: 0;
  width: 100%;
}

.coach-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  padding: 8px 16px 16px 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.screen-content {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
}

.screen-content-main {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.move-list-scroll {
  flex: 1;
  overflow-x: clip;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--space-24, 24px);
}

.review-panel-footer {
  flex-shrink: 0;
  width: 100%;
}
</style>
