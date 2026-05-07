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
 *
 * **Footer chevrons** (after Start Learning): on “Play …” (ply 1) both prev/next disabled until Black progresses the line.
 * Prev/next then scrub between unlocked plies only (`moveTrainer3FooterNavMaxPly`); routes stay aligned via OpeningCoursesV3.
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

const OM_CHECKPOINT_1_AFTER_E5_AUTHOR_NOTE =
  'This move allows us to also fight for the center. Next, we will go ...d7-d6, creating a sturdy pawn center. Now, the White players reach a crossroads — they have many possible move orders as well as setups they can try.' +
  '\n\n' +
  'To my mind, the most dangerous one is when they go Nc3 and e2-e4, keeping the c-pawn in its original position. However, we will investigate all the other possibilities as well, such as playing with c2-c4, fianchettoing the bishop on g2, and so on.'

/**
 * Opponents Move checkpoints (`/opponents-move-N` after Black’s Nth successful reply).
 * White narration + “next Black” chip come from main-line `coachText` / notation only (single source).
 * Optional `afterBlackMoveAuthorNote`: long author-only note after that Black reply → reading phase + Continue.
 */
export const MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS = Object.freeze({
  1: {
    afterBlackMoveAuthorNote: OM_CHECKPOINT_1_AFTER_E5_AUTHOR_NOTE,
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

/**
 * OM stacked-coach top bubble: White’s reply on this segment lives on `MOVE_TRAINER_3_LINE_GAME.moves[step].white`.
 * (`step` === opponents-move index after Black’s step-th successful reply.)
 */
export function getMoveTrainer3OmWhiteReplyCoachText(step) {
  const n = typeof step === 'number' && step > 0 ? step : 0
  if (!n) return ''
  const pair = MOVE_TRAINER_3_LINE_GAME.moves[n]
  const t = pair?.white?.coachText
  return typeof t === 'string' ? t : ''
}

/** Single-line coach chip when Black is on move, e.g. `2... e5` */
function formatMt3BlackHalfMoveLabel(ply) {
  if (!ply?.san || ply.color !== 'black') return ''
  const num = ply.moveNum
  if (typeof num !== 'number') return ply.san
  return `${num}... ${ply.san}`
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

/**
 * OM reading phase: user finished Black reply at `/opponents-move-{step}`; show author note + Continue.
 * Value is checkpoint step (e.g. `1`), or `0` when inactive.
 */
export const moveTrainer3OmAuthorNoteStep = ref(0)

export function resetMoveTrainer3OmAuthorNoteStep() {
  moveTrainer3OmAuthorNoteStep.value = 0
}

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

/**
 * After Start Learning, footer prev/next scrub between plies without undoing lesson progress counters.
 * Forward never exceeds the furthest ply reached via gameplay (Black success + scripted White on OM).
 * Back never goes before Black’s first checkpoint (after 1.d4 → ply 1).
 */
export const MOVE_TRAINER_3_FOOTER_NAV_MIN_PLY = 1

/** Max `currentPly` unlocked by gameplay; incremented explicitly from OpeningCoursesV3 (not by footer clicks). */
export const moveTrainer3FooterNavMaxPly = ref(0)

export function resetMoveTrainer3FooterNavMaxPly() {
  moveTrainer3FooterNavMaxPly.value = 0
}

export function bumpMoveTrainer3FooterNavMaxPly(ply) {
  const n = Math.max(0, Math.floor(Number(ply)))
  if (n > moveTrainer3FooterNavMaxPly.value) moveTrainer3FooterNavMaxPly.value = n
}

/** Black half-moves applied among `allPlies[0..ply-1]` — drives OM route vs `/play-move` when scrubbing. */
export function moveTrainer3BlackMovesThroughPly(ply) {
  const p = Math.max(0, Math.floor(Number(ply)))
  let c = 0
  const plies = allPlies.value
  for (let i = 0; i < p && i < plies.length; i++) {
    if (plies[i]?.color === 'black') c++
  }
  return c
}

export function resetMoveTrainer3LearnProgress() {
  moveTrainer3BlackMovesCompleted.value = 0
  resetMoveTrainer3FooterNavMaxPly()
  resetMoveTrainer3OmAuthorNoteStep()
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

/** Black-to-move coach chip — notation only (`1... c5`), no “Play” / second subtitle line. */
export const coachPlayMoveLeadBold = computed(() => {
  const pending = moveTrainer3CoachPendingBlackSan.value
  if (pending) {
    const p = allPlies.value.find((x) => x.color === 'black' && x.san === pending)
    return formatMt3BlackHalfMoveLabel(p) || pending
  }
  const side = currentFen.value.split(/\s+/)[1]
  if (side !== 'b') return ''
  const next = allPlies.value[currentPly.value]
  return formatMt3BlackHalfMoveLabel(next)
})

/** Deliberately empty — move notation stands alone (see `coachPlayMoveLeadBold`). */
export const coachPlayMoveTurnLabel = computed(() => '')

/**
 * Narration for the half-move selected via footer scrub (`currentPly - 1`) from main-line `coachText`.
 * MoveTrainer3LineCoach shows this only when `currentPly < footerNavMaxPly` so live-tip Play Move / OM checkpoint flow stays unchanged.
 */
export const coachSelectedPlyCommentary = computed(() => {
  const idx = currentPly.value - 1
  if (idx < 0) return ''
  const ply = allPlies.value[idx]
  const t = ply?.coachText
  return typeof t === 'string' ? t : ''
})

export function goBack() {
  if (moveTrainer3StartLearningNonce.value > 0) {
    const floor = MOVE_TRAINER_3_FOOTER_NAV_MIN_PLY
    if (currentPly.value <= floor) return
    currentPly.value -= 1
    return
  }
  currentPly.value = Math.max(0, currentPly.value - 1)
}

export function goForward() {
  if (moveTrainer3StartLearningNonce.value > 0) {
    const cap = Math.min(reviewMaxPly.value, moveTrainer3FooterNavMaxPly.value)
    const next = currentPly.value + 1
    if (next > cap) return
    currentPly.value = next
    return
  }
  currentPly.value = Math.min(reviewMaxPly.value, currentPly.value + 1)
}

/** One ply forward after graded Black / scripted White — extends footer max; do not use capped `goForward()`. */
export function advanceMoveTrainer3PlyFromGameplay() {
  const cap = reviewMaxPly.value
  const next = Math.min(cap, currentPly.value + 1)
  if (next <= currentPly.value) return
  currentPly.value = next
  bumpMoveTrainer3FooterNavMaxPly(next)
}

export function goToPly(index) {
  currentPly.value = Math.max(0, Math.min(reviewMaxPly.value, index))
}

export const footerNavBackDisabled = computed(() => {
  if (moveTrainer3StartLearningNonce.value > 0) {
    return currentPly.value <= MOVE_TRAINER_3_FOOTER_NAV_MIN_PLY
  }
  return atStart.value
})

export const footerNavForwardDisabled = computed(() => {
  if (moveTrainer3StartLearningNonce.value > 0) {
    const cap = Math.min(reviewMaxPly.value, moveTrainer3FooterNavMaxPly.value)
    return currentPly.value >= cap
  }
  return atReviewLineEnd.value
})

export function toggleVideoToolbar() {
  /* Placeholder — parity with Move Trainer 2 */
}

export { gameMoves, gameResult, allPlies as moveTrainer3AllPlies }

/**
 * Half-move at `plyIndex` (0-based in `allPlies`) may omit `from`/`to` in game JSON (Black plies often only have `san`).
 * Replay from start so board sync still gets last-move squares for the yellow highlight.
 */
function getMt3LastMoveSquaresAfterPly(plyIndex) {
  const plies = allPlies.value
  const ply = plies[plyIndex]
  if (!ply) return null
  if (ply.from && ply.to) return { from: ply.from, to: ply.to }
  if (!ply.san) return null
  try {
    const chess = new Chess(MOVE_TRAINER_3_LINE_GAME.initialFen)
    for (let i = 0; i < plyIndex; i++) {
      const p = plies[i]
      if (!p?.san) return null
      if (!chess.move(p.san)) return null
    }
    const mv = chess.move(ply.san)
    if (!mv || typeof mv.from !== 'string' || typeof mv.to !== 'string') return null
    return { from: mv.from, to: mv.to }
  } catch {
    return null
  }
}

/** Snapshot for main board sync — reuse wherever OpeningCoursesV3 applies MT3 FEN + last-move highlight. */
export function getMoveTrainer3BoardSyncPayload() {
  const fen = currentFen.value
  let lastMove = null
  if (currentPly.value > 0) {
    lastMove = getMt3LastMoveSquaresAfterPly(currentPly.value - 1)
  }
  return { fen, lastMove }
}

