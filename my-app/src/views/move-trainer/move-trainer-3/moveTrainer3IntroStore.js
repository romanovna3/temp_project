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

/**
 * Play Move layout — long instructional body (`white-space: pre-line` in CoachBubble).
 * Scroll + gradient fades are handled inside CoachBubble when fill-available-height is on.
 */
export const MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE = [
  'In this Old Benoni-style structure Black often reinforces early with …d7–d6 before committing the king, keeping tension while kingside ideas brew.',
  'White’s Nc3 is multipurpose: it props d5, eyes e4, and buys time to decide whether to clarify the center or invite sharper middlegames.',
  'Classic White tries include e2–e4 and schemes against …Bg7; delaying c2–c4 can change the pawn skeleton entirely — worth comparing plans side by side.',
  'After short casting, watch for …a6 and queenside expansion motifs — the semi-open files hint where counterplay usually lands.',
  'Fianchettoing the bishop on g2, and coordinating it with a knight hopping toward e3 or f4, is one of the clean recipes on this flank.',
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

/** Side to move from current position FEN (field 2). */
export const coachPlayMoveTurnSide = computed(() => {
  const token = currentFen.value.split(' ')[1]
  return token === 'b' ? 'black' : 'white'
})

/** Play Move second heading line — regular weight, paired with turn indicator square. */
export const coachPlayMoveTurnLabel = computed(() =>
  coachPlayMoveTurnSide.value === 'white' ? 'White to play' : 'Black to play',
)

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
