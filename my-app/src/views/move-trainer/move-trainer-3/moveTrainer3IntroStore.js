/**
 * Shared intro-1 state for Move Trainer 3 split UI (line/coach, moves, footer).
 */
import { ref, computed, watch } from 'vue'
import { MOVE_CLASSIFICATIONS } from '@move-trainer/data/classifications.js'
import { INTRO_1_GAME } from '@move-trainer/data/gameData.js'
import { MOVE_TRAINER_LINE_ORDER } from '@move-trainer/data/moveTrainerLineOrder.js'

const INTRO_COACH_MESSAGE =
  "Take a moment to review the moves, then start learning whenever you're ready."

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
export const currentPly = ref(1)
const reviewMaxPly = computed(() => totalPlies.value)
const atStart = computed(() => currentPly.value === 0)
const atReviewLineEnd = computed(() => currentPly.value >= reviewMaxPly.value)

export const intro1Line = computed(() => MOVE_TRAINER_LINE_ORDER.find((e) => e.name === 'move-trainer-intro-1'))

export const lineHeaderTitle = computed(() => intro1Line.value?.lineHeader ?? 'Leave the Queen at Home!')

export const moveTrainerLineNav = computed(() => {
  const line = intro1Line.value
  if (!line) return { prevDisabled: true, nextDisabled: true }
  const last = MOVE_TRAINER_LINE_ORDER.length - 1
  const idx = MOVE_TRAINER_LINE_ORDER.findIndex((e) => e.path === line.path)
  return {
    prevDisabled: idx <= 0,
    nextDisabled: idx < 0 || idx >= last,
  }
})

const coachPlyData = computed(() => allPlies.value[0] ?? null)

export const coachHeaderIcon = computed(() => {
  const ply = coachPlyData.value
  if (!ply) return ''
  return MOVE_CLASSIFICATIONS[ply.classification]?.icon || ''
})

export const coachHeaderText = computed(() => {
  const ply = coachPlyData.value
  if (!ply) return ''
  const cls = MOVE_CLASSIFICATIONS[ply.classification]
  const moveName = `${ply.piece || ''}${ply.san}`
  if (!cls) return moveName
  return `${moveName} is a ${cls.label.toLowerCase()} move`
})

export const coachEvalText = computed(() => coachPlyData.value?.eval ?? '')
export const coachWhiteAdvantage = computed(() => {
  const ev = coachEvalText.value
  if (!ev) return true
  return !ev.startsWith('-')
})

export const coachMessage = computed(() => INTRO_COACH_MESSAGE)
export const coachTurnStripText = 'White to move'
export const bubbleStartPosition = computed(() => !coachHeaderText.value)
export const coachAvatarIconPx = 96

export const currentFen = computed(() => {
  if (currentPly.value === 0) return INTRO_1_GAME.initialFen
  const ply = allPlies.value[currentPly.value - 1]
  return ply?.fen ?? INTRO_1_GAME.initialFen
})

export function goBack() {
  currentPly.value = Math.max(0, currentPly.value - 1)
}
export function goForward() {
  currentPly.value = Math.min(reviewMaxPly.value, currentPly.value + 1)
}
export function goToPly(index) {
  currentPly.value = Math.max(0, Math.min(reviewMaxPly.value, index))
}

export const footerNavBackDisabled = computed(() => atStart.value)
export const footerNavForwardDisabled = computed(() => atReviewLineEnd.value)

export function toggleVideoToolbar() {
  /* Placeholder — parity with Move Trainer 2 */
}

export { gameMoves, gameResult }

/** @param {(payload: { fen: string, lastMove: { from: string, to: string } | null }) => void} cb */
export function watchMoveTrainer3BoardSync(cb) {
  watch(
    currentFen,
    () => {
      const fen = currentFen.value
      let lastMove = null
      if (currentPly.value > 0) {
        const ply = allPlies.value[currentPly.value - 1]
        if (ply?.from && ply?.to) lastMove = { from: ply.from, to: ply.to }
      }
      cb({ fen, lastMove })
    },
    { immediate: true },
  )
}
