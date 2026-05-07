/**
 * Move Trainer 3 panel: course title, line header, move list, coach, board sync.
 */
import { ref, computed, watch } from 'vue'
import { MOVE_CLASSIFICATIONS } from '@move-trainer/data/classifications.js'
import { MOVE_TRAINER_3_LINE_GAME } from '@move-trainer/data/gameData.js'

/** Shown in OpeningCoursesV3 panel header (no icon beside title). */
export const MOVE_TRAINER_3_COURSE_TITLE = 'Black is Back: Old Benoni'

/** Move list header — main line label. */
export const MOVE_TRAINER_3_LINE_HEADER_TITLE = 'Main Line without c2-c4 – 4.f4'

/** Intro screen coach bubble — short copy only (don’t couple Play Move body here). */
export const MOVE_TRAINER_3_INTRO_COACH_MESSAGE = "Let's learn this line together"

/** Play Move layout — body copy under pinned heading (optional); empty = heading only. */
export const MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE = ''

const gameMoves = ref([...MOVE_TRAINER_3_LINE_GAME.moves])
const gameResult = ref(MOVE_TRAINER_3_LINE_GAME.result)

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

export const lineHeaderTitle = computed(() => MOVE_TRAINER_3_LINE_HEADER_TITLE)

/** Single demo line — no prev/next line in the catalog for this view. */
export const moveTrainerLineNav = computed(() => ({
  prevDisabled: true,
  nextDisabled: true,
}))

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
  const moveName = ply.san
  if (!cls) return moveName
  return `${moveName} is a ${cls.label.toLowerCase()} move`
})

export const coachEvalText = computed(() => coachPlyData.value?.eval ?? '')
export const coachWhiteAdvantage = computed(() => {
  const ev = coachEvalText.value
  if (!ev) return true
  return !ev.startsWith('-')
})

export const coachMessage = computed(() => MOVE_TRAINER_3_INTRO_COACH_MESSAGE)
export const coachTurnStripText = 'White to move'
export const bubbleStartPosition = computed(() => !coachHeaderText.value)
export const coachAvatarIconPx = 96

export const currentFen = computed(() => {
  if (currentPly.value === 0) return MOVE_TRAINER_3_LINE_GAME.initialFen
  const ply = allPlies.value[currentPly.value - 1]
  return ply?.fen ?? MOVE_TRAINER_3_LINE_GAME.initialFen
})

/** Play Move coach heading — next expected SAN from current board index (`currentPly`). */
export const coachPlayMoveLeadBold = computed(() => {
  const next = allPlies.value[currentPly.value]
  if (!next?.san) return ''
  return `Play ${next.san}`
})

/** Play Move second heading line — same typography as coach body; regular weight. */
export const coachPlayMoveTurnLabel = computed(() => {
  const token = currentFen.value.split(' ')[1]
  return token === 'b' ? 'Black to play' : 'White to play'
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
