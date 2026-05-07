/**
 * Move Trainer 3 — panel state (course title, line header, move list, coach, board sync).
 *
 * **Turn-taking model**
 * - **White** = opponent/engine: performed in code (slide + sound on Start Learning for 1.d4, etc.).
 * - **Black** = user: coach shows `Play …` only when FEN side-to-move is Black (`coachPlayMoveLeadBold`).
 *
 * Flow after **Start Learning**: animate White’s first move → advance `currentPly` → route to Play Move →
 * **same** OpeningCoursesV3 instance keeps pieces on the board (see MoveTrainer3Shell nested routes).
 *
 * **`/play-move` reload**: store resets `currentPly` to 0; OpeningCoursesV3 bumps to ply **1** (after 1.d4)
 * so the coach shows Black’s reply (“Play …”) instead of an empty bubble + White-only silence.
 *
 * **Opponents Move** (`/opponents-move-N`): after Black’s Nth graded success on Play Move, route jumps here;
 * White’s scripted reply animates on entry; coach checkpoint copy keyed by **N** (see `MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS`).
 *
 * **Footer progress**: Black replies vs Black moves in the variation (`CcProgressBar`: `completed-steps` / `total-step-count`);
 * resets when **Start Learning** runs; increments only on graded Play Move successes (not footer prev/next).
 */
import { ref, computed } from 'vue'
import { Chess } from 'chess.js'
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

/**
 * Opponents Move checkpoints (`/opponents-move-N` after Black’s Nth successful reply).
 * Variant 1 UI: commentary bubble + second bubble with “Play …” for the **next** Black move.
 */
export const MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS = Object.freeze({
  1: {
    whiteCommentary: 'White immediately locks up the center, grabbing space.',
    nextBlackLeadBold: 'Play e5',
    nextBlackTurnStrip: 'Black to play',
  },
})

export function moveTrainer3PathIsOpponentsMove(path) {
  if (!path || typeof path !== 'string') return false
  try {
    const d = decodeURIComponent(path)
    return /\/move-trainer\/move-trainer-3\/opponents-move-\d+$/.test(d)
  } catch {
    return /\/move-trainer\/move-trainer-3\/opponents-move-\d+$/.test(path)
  }
}

/** Parses trailing `-N` from `/move-trainer/move-trainer-3/opponents-move-N`. */
export function moveTrainer3OpponentsMoveStepFromPath(path) {
  if (!path || typeof path !== 'string') return 0
  let p = path
  try {
    p = decodeURIComponent(path)
  } catch {
    /* keep raw */
  }
  const m = p.match(/\/opponents-move-(\d+)$/)
  return m ? parseInt(m[1], 10) : 0
}

export function getMoveTrainer3OpponentsMoveCheckpoint(step) {
  const n = typeof step === 'number' && step > 0 ? step : 0
  return MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS[n] ?? null
}

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
/** Intro starts at the initial position; Start Learning animates 1.d4 then advances to 1 for Play Move (…c5). */
export const currentPly = ref(0)

/** Incremented by footer Start Learning — OpeningCoursesV3 plays 1.d4 + routes to Play Move. */
export const moveTrainer3StartLearningNonce = ref(0)

/** While true, skip applying store FEN to the main board (Start Learning owns pieces during 1.d4 animation). */
export const moveTrainer3SkipBoardSyncFromStore = ref(false)

/** While true, Play Move URL must not auto-advance ply 0→1 (would fight the opening animation). */
export const moveTrainer3WhiteOpeningAnimationActive = ref(false)

/** Coach heading override: show “Play …” during 1.d4 slide before `currentPly` reaches Black’s checkpoint. */
export const moveTrainer3CoachPendingBlackSan = ref('')

export function setMoveTrainer3CoachPendingBlackSan(san) {
  moveTrainer3CoachPendingBlackSan.value = typeof san === 'string' ? san : ''
}

export function clearMoveTrainer3CoachPendingBlackSan() {
  moveTrainer3CoachPendingBlackSan.value = ''
}

export function getMoveTrainer3FirstBlackReplySan() {
  const m = MOVE_TRAINER_3_LINE_GAME.moves[0]?.black?.san
  return typeof m === 'string' ? m : ''
}

/**
 * Expected Black reply from the scripted line at `currentPly` (from/to for hint arrows & tap validation).
 * Returns null when it is not Black’s turn or the next scripted ply is not Black.
 */
export function getMoveTrainer3BlackHintSquares() {
  try {
    const fen = currentFen.value
    const chess = new Chess(fen)
    if (chess.turn() !== 'b') return null
    const next = allPlies.value[currentPly.value]
    if (!next?.san || next.color !== 'black') return null
    const copy = new Chess(fen)
    const mv = copy.move(next.san)
    if (!mv || typeof mv.from !== 'string' || typeof mv.to !== 'string') return null
    return { from: mv.from, to: mv.to }
  } catch {
    return null
  }
}

export function requestMoveTrainer3StartLearning() {
  moveTrainer3StartLearningNonce.value += 1
}

/** Successful graded Black replies on Play Move (one increment per correct main-line Black move). */
export const moveTrainer3BlackMovesCompleted = ref(0)

/** Black half-moves in the scripted variation — denominator for footer progress. */
export const moveTrainer3BlackMovesTotal = computed(() => {
  let n = 0
  for (const m of gameMoves.value) {
    if (m.black?.san) n++
  }
  return n
})

export function resetMoveTrainer3LearnProgress() {
  moveTrainer3BlackMovesCompleted.value = 0
}

export function recordMoveTrainer3BlackLearnSuccess() {
  const t = moveTrainer3BlackMovesTotal.value
  if (!t || moveTrainer3BlackMovesCompleted.value >= t) return
  moveTrainer3BlackMovesCompleted.value++
}

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

/** Play Move coach heading — only when Black is to move (user plays Black); never for opponent White SANs. */
export const coachPlayMoveLeadBold = computed(() => {
  const pending = moveTrainer3CoachPendingBlackSan.value
  if (pending) return `Play ${pending}`
  const side = currentFen.value.split(/\s+/)[1]
  if (side !== 'b') return ''
  const next = allPlies.value[currentPly.value]
  if (!next?.san || next.color !== 'black') return ''
  return `Play ${next.san}`
})

/** Pinned subtitle — only with Black to move (paired with `coachPlayMoveLeadBold`). Hidden during White/engine moves. */
export const coachPlayMoveTurnLabel = computed(() => {
  if (moveTrainer3CoachPendingBlackSan.value) return 'Black to play'
  const side = currentFen.value.split(/\s+/)[1]
  if (side !== 'b') return ''
  return 'Black to play'
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

export { gameMoves, gameResult, allPlies as moveTrainer3AllPlies }

/** Snapshot for main board sync — reuse wherever OpeningCoursesV3 applies MT3 FEN + last-move highlight. */
export function getMoveTrainer3BoardSyncPayload() {
  const fen = currentFen.value
  let lastMove = null
  if (currentPly.value > 0) {
    const ply = allPlies.value[currentPly.value - 1]
    if (ply?.from && ply?.to) lastMove = { from: ply.from, to: ply.to }
  }
  return { fen, lastMove }
}

