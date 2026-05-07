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

/** Coach body copy (`white-space: pre-line` in CoachBubble). ~12 lines to stress-test vertical growth. */
const REVIEW_MESSAGE = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.',
  'Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.',
  'Integer in mauris eu nibh euismod gravida.',
  'Duis ac tellus et risus vulputate vehicula.',
  'Donec lobortis risus a elit. Etiam tempor.',
  'Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.',
  'Maecenas fermentum consequat mi.',
  'Fusce convallis laoreet urna. Pellentesque habitant morbi tristique senectus.',
].join('\n')

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

export const coachMessage = computed(() => REVIEW_MESSAGE)
export const coachTurnStripText = 'White to move'
export const bubbleStartPosition = computed(() => !coachHeaderText.value)
export const coachAvatarIconPx = 96

export const currentFen = computed(() => {
  if (currentPly.value === 0) return MOVE_TRAINER_3_LINE_GAME.initialFen
  const ply = allPlies.value[currentPly.value - 1]
  return ply?.fen ?? MOVE_TRAINER_3_LINE_GAME.initialFen
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
