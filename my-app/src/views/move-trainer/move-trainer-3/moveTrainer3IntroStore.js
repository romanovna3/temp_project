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
 * **Reload**: `sessionStorage` (`MOVE_TRAINER_3_SESSION_STORAGE_KEY`) restores ply/progress when Play Move /
 * Opponents Move URLs reload after **Start Learning** has run.
 *
 * **Opponents Move** (`/opponents-move-N`): after Black’s Nth graded success on Play Move, route jumps here;
 * White’s scripted reply animates on entry; coach checkpoint copy keyed by **N** (see `MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS`).
 *
 * **Footer progress**: Black replies vs Black moves in the variation (`CcProgressBar`: `completed-steps` / `total-step-count`);
 * resets when **Start Learning** runs; increments only on graded Play Move successes (not footer prev/next).
 *
 * **Footer chevrons** (after Start Learning): scrub includes **ply 0** (starting board before 1.d4); prev disabled only at 0.
 * Forward stays capped at `moveTrainer3FooterNavMaxPly`; routes stay aligned via OpeningCoursesV3.
 */
import { ref, computed, watch } from 'vue'
import { Chess } from 'chess.js'
import { MOVE_CLASSIFICATIONS } from '@move-trainer/data/classifications.js'
import { MOVE_TRAINER_3_LINE_GAME } from '@move-trainer/data/gameData.js'

/** Persist ply/progress across reload while URL stays on Play Move / Opponents Move. */
export const MOVE_TRAINER_3_SESSION_STORAGE_KEY = 'chesscom.moveTrainer3.learnSession.v1'

/** Shown in OpeningCoursesV3 panel header (no icon beside title). */
export const MOVE_TRAINER_3_COURSE_TITLE = 'Black is Back: Old Benoni'

/** Move list header — main line label. */
export const MOVE_TRAINER_3_LINE_HEADER_TITLE = 'Main Line without c2-c4 – 4.f4'

/** Intro screen coach bubble — short copy only (don’t couple Play Move body here). */
export const MOVE_TRAINER_3_INTRO_COACH_MESSAGE = "Let's learn this line together"

/** Play Move layout — body copy under pinned heading (optional); empty = heading only. */
export const MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE = ''

/** FEN after main-line `2...e5` — branch previews for the clickable “Nc3 … e4” alt (OM reading step 2). */
export const MOVE_TRAINER_3_AFTER_E5_FEN = MOVE_TRAINER_3_LINE_GAME.moves[1].black.fen

/** Plain author-reading copy after Black plays …e5 (OM step 1). */
const OM_CHECKPOINT_1_AFTER_E5_AUTHOR_NOTE =
  'This move allows us to also fight for the center. Next, we will go ...d7-d6, creating a sturdy pawn center. Now, the White players reach a crossroads — they have many possible move orders as well as setups they can try.' +
  '\n\n' +
  'To my mind, the most dangerous one is when they go Nc3 and e2-e4, keeping the c-pawn in its original position. However, we will investigate all the other possibilities as well, such as playing with c2-c4, fianchettoing the bishop on g2, and so on.'

const MOVE_TRAINER_3_OM_READING_SIDE_LINE_SANS = Object.freeze(['Nc3', 'd6', 'Nf3', 'Be7', 'e4'])

function mt3BuildBranchPreviewPayloads(startFen, sans) {
  const out = []
  try {
    const chess = new Chess(startFen)
    for (const san of sans) {
      const mv = chess.move(san)
      if (!mv) break
      out.push({ fen: chess.fen(), lastMove: { from: mv.from, to: mv.to } })
    }
  } catch {
    /* invalid branch */
  }
  return Object.freeze(out)
}

/**
 * Full chapter lead above subvariation rails — OM step **2** (after White’s **3.e4**, Black to …d6).
 */
export const MOVE_TRAINER_3_OM_READING_CHAPTER_E4_LEAD =
  'In this chapter, we will be discussing the most dangerous setup available to White against our Old Benoni. Namely, our opponent will try to take advantage of the fact the move c2-c4 has not been played yet by foregoing it altogether. But wait, why is that advantageous? Doesn\'t almost every 1.d4 player try to place the pawn on c4 as soon as possible, to take more space? Well, the thing is that White already controls the center. By delaying the move c2-c4, White gets the following benefits:' +
  '\n\n' +
  'The c4-square is available for the knight. This is valuable because it can come there to put pressure on the d6-pawn.' +
  '\n\n' +
  'The f1-bishop is not nearly as restricted. For example, White can give a check on b5 in many positions, to disrupt our development a bit. We often like going ...Bg4 to eliminate the f3-knight, but blocking the check with ...Nbd7 or ...Bd7 makes that impossible.' +
  '\n\n' +
  'The bad news is that objectively speaking, White is better in this line. I do believe it is very interesting to play the Old Benoni, of course − that\'s why I am writing the course! But, to be fair, White is better. The good news is that at the club level, you won\'t have problems.\n' +
  'For example, the setups with c2-c4 are 4 times(!) more popular in Lichess games of players rated 1600-2000 than the \'correct\' setup without c2-c4. And then, even within the most testing line, White played the best way in just about 1% of the games, or 50 games out of 5000! Of course, I will also suggest a few ways for us to tackle this principled setup, so you can choose, depending on your opponent and your mood. Let\'s go.'

/** First subvariation: main alt order → transposes to 3.e4 lines. Chip `ply` 1…5 → branch previews on step 2. */
const MOVE_TRAINER_3_OM_READING_RAIL_TRANSPOSE_TO_E4 = Object.freeze([
  { type: 'text', text: '3.' },
  { type: 'move', ply: 1, san: 'Nc3' },
  { type: 'text', text: ' ' },
  { type: 'move', ply: 2, san: 'd6' },
  { type: 'text', text: ' 4.' },
  { type: 'move', ply: 3, san: 'Nf3' },
  { type: 'text', text: ' ' },
  { type: 'move', ply: 4, san: 'Be7' },
  { type: 'text', text: ' 5.' },
  { type: 'move', ply: 5, san: 'e4' },
  { type: 'text', text: ' transposes to the 3.e4 lines.' },
])

/** Second subvariation: **3.dxe6** in prose; clickable **…fxe6** after White’s EP (`ply` 6 → position after **dxe6** + **fxe6**). */
const MOVE_TRAINER_3_OM_READING_RAIL_DXE6_NOTE = Object.freeze([
  {
    type: 'text',
    text: 'Some White players, especially at the club level, can also play 3.dxe6. However, after 3... ',
  },
  { type: 'move', ply: 6, san: 'fxe6', ariaLabel: 'Go to position after 3… fxe6' },
  {
    type: 'text',
    text: ', Black wants to play ...d7-d5 and occupy the entire center, and it is easy for White to be worse in no time.',
  },
])

function mt3OmReadingStep2BranchPreviews() {
  const start = MOVE_TRAINER_3_AFTER_E5_FEN
  const alt = mt3BuildBranchPreviewPayloads(start, MOVE_TRAINER_3_OM_READING_SIDE_LINE_SANS)
  const ep = []
  try {
    const chess = new Chess(start)
    const w = chess.move('dxe6')
    if (w) {
      const b = chess.move('fxe6')
      if (b) ep.push({ fen: chess.fen(), lastMove: { from: b.from, to: b.to } })
    }
  } catch {
    /* ignore */
  }
  return Object.freeze([...alt, ...ep])
}

const MOVE_TRAINER_3_OM_READING_BRANCH_PREVIEWS_BY_STEP = Object.freeze({
  2: mt3OmReadingStep2BranchPreviews(),
})

/**
 * Opponents Move checkpoints (`/opponents-move-N` after Black’s Nth successful reply).
 * Live progression coach uses `whiteCommentary` + `nextBlack*`; replay uses line `coachText` / `readingLead` when tied to OM.
 * **Reading phase:** `readingLead` + optional `readingSegments` / `readingSegmentRails` + optional `readingChapterLongForm`.
 * **`afterBlackMoveAuthorNote`** alone gates the post–graded-move **Continue** author-reading overlay.
 * Live OM chapter fields (`readingLead`, rails, etc.) do **not** — they run **before** Black’s reply on that step.
 */
export const MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS = Object.freeze({
  1: {
    whiteCommentary: 'White immediately locks up the center, grabbing space.',
    nextBlackLeadBold: 'Play e5',
    nextBlackTurnStrip: 'Black to play',
    afterBlackMoveAuthorNote: OM_CHECKPOINT_1_AFTER_E5_AUTHOR_NOTE,
  },
  2: {
    nextBlackLeadBold: 'Play d6',
    nextBlackTurnStrip: 'Black to play',
    readingLead: MOVE_TRAINER_3_OM_READING_CHAPTER_E4_LEAD,
    readingChapterLongForm: true,
    readingSegmentRails: Object.freeze([
      MOVE_TRAINER_3_OM_READING_RAIL_TRANSPOSE_TO_E4,
      MOVE_TRAINER_3_OM_READING_RAIL_DXE6_NOTE,
    ]),
  },
  /** After …d6 — no post-move linger; flow jumps here with scripted **4.f4** and variant-1 coach. */
  3: {
    whiteCommentary: 'Direct play like this does not threaten Black at all.',
    nextBlackLeadBold: 'Play exf4',
    nextBlackTurnStrip: 'Black to play',
  },
  /** After …exf4 — scripted **Bxf4**; commentary on White’s development vs …Nf6 ideas. */
  4: {
    whiteCommentary:
      "Now, White's pieces seem to be coming out pretty rapidly. However, the e5-square becomes a great outpost for a black knight, and the e4-pawn could become rather weak as well.",
    nextBlackLeadBold: 'Play Nf6',
    nextBlackTurnStrip: 'Black to play',
    /** Post–…Nf6: author overlay only (no OM instruction strip); Continue → scripted **Nc3** → `/play-move` (**…a6**). */
    afterBlackMoveAuthorNote: 'For now, we just develop.',
    afterAuthorContinuePlayWhiteSan: 'Nc3',
    afterAuthorContinueToPlayMove: true,
  },
})

/** Post–graded-move author overlay: plain `afterBlackMoveAuthorNote` only (not live-chapter `readingLead`). */
export function moveTrainer3CheckpointHasPostBlackAuthorNote(cp) {
  if (!cp) return false
  return typeof cp.afterBlackMoveAuthorNote === 'string' && cp.afterBlackMoveAuthorNote.trim().length > 0
}

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
 * `/play-move` vs `/opponents-move-N` from frontier ply — OM route only when checkpoint **N** is defined.
 */
export function moveTrainer3LearnShellTargetFromFrontier() {
  const ply = moveTrainer3FooterNavMaxPly.value
  const nBlack = moveTrainer3BlackMovesThroughPly(ply)
  if (nBlack === 0) return '/move-trainer/move-trainer-3/play-move'
  const cp = getMoveTrainer3OpponentsMoveCheckpoint(nBlack)
  return cp ? `/move-trainer/move-trainer-3/opponents-move-${nBlack}` : '/move-trainer/move-trainer-3/play-move'
}

/**
 * Learn-shell URL after a graded Black success (`blackMovesCompleted` **after** increment), when not entering author-reading overlay.
 */
export function moveTrainer3LearnShellPathAfterBlackSuccessCount(completedBlackMoves) {
  const n = Math.floor(Number(completedBlackMoves))
  if (!Number.isFinite(n) || n <= 0) return '/move-trainer/move-trainer-3/play-move'
  const cp = getMoveTrainer3OpponentsMoveCheckpoint(n)
  return cp ? `/move-trainer/move-trainer-3/opponents-move-${n}` : '/move-trainer/move-trainer-3/play-move'
}

/**
 * OM author **Continue**: optional scripted White half-move then `/play-move` (see checkpoint `afterAuthorContinue*`).
 * Returns **true** if OpeningCourses should run the chain (footer skips immediate `router.replace`).
 */
export function tryStartMoveTrainer3OmAuthorContinueChain() {
  const step = moveTrainer3OmAuthorNoteStep.value
  const cp = step ? getMoveTrainer3OpponentsMoveCheckpoint(step) : null
  const raw = cp?.afterAuthorContinuePlayWhiteSan
  const san = typeof raw === 'string' ? raw.trim() : ''
  if (!san || cp?.afterAuthorContinueToPlayMove !== true) return false
  resetMoveTrainer3OmAuthorNoteStep()
  moveTrainer3SuppressLearnShellRouteAlign.value = true
  moveTrainer3OmPostAuthorChain.value = { playWhiteSan: san }
  return true
}

/** Parses SAN from OM `nextBlackLeadBold` (e.g. `Play e5` → `e5`). */
function mt3SanFromOmPlayLeadBold(lead) {
  if (typeof lead !== 'string') return ''
  const m = /^Play\s+(.+)$/i.exec(lead.trim())
  return m ? m[1].trim() : ''
}

/** Single-line coach chip when Black is on move, e.g. `2... e5` (replay scrub only). */
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

/** Skip learn-shell route alignment while author **Continue** runs a scripted White reply chain. */
export const moveTrainer3SuppressLearnShellRouteAlign = ref(false)

/** `{ playWhiteSan }` — OpeningCourses plays this from current FEN, advances ply, then routes `/play-move`. */
export const moveTrainer3OmPostAuthorChain = ref(null)

/**
 * Long OM chapter split (read → instruction) — only when `CoachBubble` reports informational overflow.
 * `inactive`: chapter fits one screen with Play strip, or not measuring / short checkpoint.
 * `read`: overflow — chapter + rails only; footer Continue → `instruction`.
 * `instruction`: Play … strip only until Black moves.
 */
export const moveTrainer3OmChapterOverflows = ref(null)
export const moveTrainer3OmChapterPhase = ref('inactive')
/** User clicked Continue on overflowed chapter once — footer forward can return to instruction after back-to-read without a second Continue. */
export const moveTrainer3OmChapterContinueUsed = ref(false)

export function resetMoveTrainer3OmChapterPhase() {
  moveTrainer3OmChapterOverflows.value = null
  moveTrainer3OmChapterPhase.value = 'inactive'
  moveTrainer3OmChapterContinueUsed.value = false
}

export function applyMoveTrainer3OmChapterOverflowMeasure(overflows) {
  moveTrainer3OmChapterOverflows.value = overflows
  moveTrainer3OmChapterPhase.value = overflows ? 'read' : 'inactive'
}

export function advanceMoveTrainer3OmChapterToInstruction() {
  clearMoveTrainer3OmReadingBoardBranch()
  moveTrainer3OmChapterPhase.value = 'instruction'
  moveTrainer3OmChapterContinueUsed.value = true
}

/**
 * Footer forward while on overflow **read** after back-from-instruction: reopen Play strip without ply scrub.
 * Skipped when reviewing behind max ply or when Black’s expected move is already played (no hint).
 */
export function advanceOmChapterReadToInstructionViaFooterForward() {
  if (moveTrainer3OmChapterPhase.value !== 'read') return false
  if (moveTrainer3OmChapterOverflows.value !== true) return false
  if (!moveTrainer3OmChapterContinueUsed.value) return false
  if (moveTrainer3StartLearningNonce.value <= 0) return false
  if (currentPly.value !== moveTrainer3FooterNavMaxPly.value) return false
  if (!getMoveTrainer3BlackHintSquares()) return false
  clearMoveTrainer3OmReadingBoardBranch()
  moveTrainer3OmChapterPhase.value = 'instruction'
  return true
}

/** Footer back from overflow OM instruction step → chapter read UI without scrubbing `currentPly`. */
export function retreatMoveTrainer3OmChapterFromInstructionToRead() {
  if (
    moveTrainer3OmChapterPhase.value === 'instruction'
    && moveTrainer3OmChapterOverflows.value === true
  ) {
    moveTrainer3OmChapterPhase.value = 'read'
    return true
  }
  return false
}

/**
 * OM live (`moveTrainer3OmAuthorNoteStep === 0`): Black hint arrow + draggable board when the Play … strip is actionable.
 * Suppresses arrow/interaction during overflow **read** (chapter-only) and until overflow is measured (`overflows === null`).
 */
export function moveTrainer3OmBlackPlayUiActive(cp) {
  if (!cp) return false
  if (typeof cp.whiteCommentary === 'string' && cp.whiteCommentary.trim()) return true
  const nb = typeof cp.nextBlackLeadBold === 'string' ? cp.nextBlackLeadBold.trim() : ''
  if (!nb) return false
  if (!cp.readingChapterLongForm) return true
  if (moveTrainer3OmChapterOverflows.value === null) return false
  if (moveTrainer3OmChapterOverflows.value === false) return true
  return moveTrainer3OmChapterPhase.value !== 'read'
}

/** While OM reading shows clickable branch moves — overrides main-line `currentPly` FEN on the panel board. */
export const moveTrainer3OmReadingBoardOverride = ref(null)

/** Highlights matching move chip in `CoachMessageRichNotationsLine` (branch-local ply index 1…n). */
export const moveTrainer3OmReadingSelectedChipPly = ref(0)

export function clearMoveTrainer3OmReadingBoardBranch() {
  moveTrainer3OmReadingBoardOverride.value = null
  moveTrainer3OmReadingSelectedChipPly.value = 0
}

/**
 * `omRouteStep` — OM checkpoint index from the route (e.g. `2` on `/opponents-move-2`).
 * Required while **live** on an OM step (`moveTrainer3OmAuthorNoteStep === 0`) so branch previews resolve.
 */
export function setMoveTrainer3OmReadingChipPly(ply, omRouteStep = 0) {
  const n = Math.floor(Number(ply))
  const authorStep = moveTrainer3OmAuthorNoteStep.value
  const routeStep = Math.floor(Number(omRouteStep))
  const step =
    authorStep > 0 ? authorStep : routeStep > 0 ? routeStep : 0
  const previews = MOVE_TRAINER_3_OM_READING_BRANCH_PREVIEWS_BY_STEP[step]
  if (!previews?.length || !Number.isFinite(n) || n < 1 || n > previews.length) return
  moveTrainer3OmReadingSelectedChipPly.value = n
  moveTrainer3OmReadingBoardOverride.value = previews[n - 1]
}

watch(moveTrainer3OmAuthorNoteStep, () => {
  clearMoveTrainer3OmReadingBoardBranch()
})

/** Movelist / footer scrub: drop branch preview whenever the main-line ply cursor moves after chip exploration. */
watch(currentPly, () => {
  if (moveTrainer3OmReadingBoardOverride.value) {
    clearMoveTrainer3OmReadingBoardBranch()
  }
})

export function resetMoveTrainer3OmAuthorNoteStep() {
  moveTrainer3OmAuthorNoteStep.value = 0
  clearMoveTrainer3OmReadingBoardBranch()
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
 * Back may reach **ply 0** (initial FEN) — users can review the default position before 1.d4.
 */
export const MOVE_TRAINER_3_FOOTER_NAV_MIN_PLY = 0

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
  resetMoveTrainer3OmChapterPhase()
  moveTrainer3SuppressLearnShellRouteAlign.value = false
  moveTrainer3OmPostAuthorChain.value = null
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

/** True while footer scrubbed before furthest unlocked ply — replay coach vs live progression copy. */
export const moveTrainer3CoachReplayScrubbing = computed(
  () =>
    moveTrainer3StartLearningNonce.value > 0 &&
    currentPly.value < moveTrainer3FooterNavMaxPly.value,
)

/** Live progression: “Play …”; replay scrub: notation-only (`1... c5`). */
export const coachPlayMoveLeadBold = computed(() => {
  const replay = moveTrainer3CoachReplayScrubbing.value
  const pending = moveTrainer3CoachPendingBlackSan.value
  if (pending) {
    if (replay) {
      const p = allPlies.value.find((x) => x.color === 'black' && x.san === pending)
      return formatMt3BlackHalfMoveLabel(p) || pending
    }
    return `Play ${pending}`
  }
  const side = currentFen.value.split(/\s+/)[1]
  if (side !== 'b') return ''
  const next = allPlies.value[currentPly.value]
  if (!next?.san || next.color !== 'black') return ''
  if (replay) return formatMt3BlackHalfMoveLabel(next)
  return `Play ${next.san}`
})

/** Hidden during replay scrub; “Black to play” during live progression when Black is on move. */
export const coachPlayMoveTurnLabel = computed(() => {
  if (moveTrainer3CoachReplayScrubbing.value) return ''
  if (moveTrainer3CoachPendingBlackSan.value) return 'Black to play'
  const side = currentFen.value.split(/\s+/)[1]
  if (side !== 'b') return ''
  return 'Black to play'
})

/**
 * Line `coachText` for the half-move at `currentPly - 1` (reference / tooling).
 */
export const coachSelectedPlyCommentary = computed(() => {
  const idx = currentPly.value - 1
  if (idx < 0) return ''
  const ply = allPlies.value[idx]
  const t = ply?.coachText
  return typeof t === 'string' ? t : ''
})

/**
 * Replay scrub bubble body for the half-move at `currentPly - 1`:
 * - **Black:** checkpoint **`afterBlackMoveAuthorNote`** when SAN matches that OM step’s **`Play …`** lead.
 * - **White:** **`whiteCommentary`** from checkpoints **3** (**4.f4**) and **4** (**5.Bxf4**) when set — same copy as live OM variant 1.
 * - **Fallback:** line JSON **`coachText`** for that half-move (heading-only **1.d4** / **1...c5** stay empty in UI).
 * No OM **`readingLead`** / chapter in replay.
 */
export const coachReplayHalfMoveBody = computed(() => {
  const idx = currentPly.value - 1
  if (idx < 0) return ''
  const ply = allPlies.value[idx]
  if (!ply?.san) return ''
  if (ply.color === 'white' && ply.moveNum === 1 && ply.san === 'd4') return ''
  if (ply.color === 'black' && ply.moveNum === 1 && ply.san === 'c5') return ''

  if (ply.color === 'white') {
    const cpF4 = MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS[3]
    const cpBxf4 = MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS[4]
    if (ply.moveNum === 4 && ply.san === 'f4') {
      const t = typeof cpF4?.whiteCommentary === 'string' ? cpF4.whiteCommentary.trim() : ''
      if (t) return t
    }
    if (ply.moveNum === 5 && ply.san === 'Bxf4') {
      const t = typeof cpBxf4?.whiteCommentary === 'string' ? cpBxf4.whiteCommentary.trim() : ''
      if (t) return t
    }
  }

  if (ply.color === 'black') {
    for (const cp of Object.values(MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS)) {
      const expected = mt3SanFromOmPlayLeadBold(cp?.nextBlackLeadBold)
      if (!expected || ply.san !== expected) continue
      if (typeof cp.afterBlackMoveAuthorNote === 'string' && cp.afterBlackMoveAuthorNote.trim()) {
        return cp.afterBlackMoveAuthorNote
      }
    }
  }

  const lineBody = ply.coachText
  return typeof lineBody === 'string' ? lineBody.trim() : ''
})

export function goBack() {
  if (retreatMoveTrainer3OmChapterFromInstructionToRead()) {
    return
  }
  if (moveTrainer3StartLearningNonce.value > 0) {
    const floor = MOVE_TRAINER_3_FOOTER_NAV_MIN_PLY
    if (currentPly.value <= floor) return
    currentPly.value -= 1
    return
  }
  currentPly.value = Math.max(0, currentPly.value - 1)
}

export function goForward() {
  if (advanceOmChapterReadToInstructionViaFooterForward()) {
    return
  }
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
  if (
    moveTrainer3OmChapterPhase.value === 'instruction'
    && moveTrainer3OmChapterOverflows.value === true
  ) {
    return false
  }
  if (moveTrainer3StartLearningNonce.value > 0) {
    return currentPly.value <= MOVE_TRAINER_3_FOOTER_NAV_MIN_PLY
  }
  return atStart.value
})

export const footerNavForwardDisabled = computed(() => {
  if (moveTrainer3StartLearningNonce.value > 0) {
    const cap = Math.min(reviewMaxPly.value, moveTrainer3FooterNavMaxPly.value)
    if (
      moveTrainer3OmChapterPhase.value === 'read'
      && moveTrainer3OmChapterOverflows.value === true
      && moveTrainer3OmChapterContinueUsed.value
      && currentPly.value === moveTrainer3FooterNavMaxPly.value
      && getMoveTrainer3BlackHintSquares()
    ) {
      return false
    }
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
  const replayScrub =
    moveTrainer3StartLearningNonce.value > 0 && currentPly.value < moveTrainer3FooterNavMaxPly.value
  const ov = moveTrainer3OmReadingBoardOverride.value
  if (!replayScrub && ov?.fen) {
    return { fen: ov.fen, lastMove: ov.lastMove ?? null }
  }
  const fen = currentFen.value
  let lastMove = null
  if (currentPly.value > 0) {
    lastMove = getMt3LastMoveSquaresAfterPly(currentPly.value - 1)
  }
  return { fen, lastMove }
}

function readMoveTrainer3LearnSessionFromStorage() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(MOVE_TRAINER_3_SESSION_STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    return o && typeof o === 'object' ? o : null
  } catch {
    return null
  }
}

export function persistMoveTrainer3LearnSession() {
  if (typeof sessionStorage === 'undefined') return
  try {
    if (moveTrainer3StartLearningNonce.value <= 0) {
      sessionStorage.removeItem(MOVE_TRAINER_3_SESSION_STORAGE_KEY)
      return
    }
    sessionStorage.setItem(
      MOVE_TRAINER_3_SESSION_STORAGE_KEY,
      JSON.stringify({
        v: 1,
        nonce: moveTrainer3StartLearningNonce.value,
        currentPly: currentPly.value,
        footerNavMaxPly: moveTrainer3FooterNavMaxPly.value,
        blackMovesCompleted: moveTrainer3BlackMovesCompleted.value,
        omAuthorNoteStep: moveTrainer3OmAuthorNoteStep.value,
        omChapterPhase: moveTrainer3OmChapterPhase.value,
        omChapterOverflows: moveTrainer3OmChapterOverflows.value,
        omChapterContinueUsed: moveTrainer3OmChapterContinueUsed.value,
      }),
    )
  } catch {
    /* quota / private mode */
  }
}

/**
 * Restore lesson refs after reload when URL is Play Move / OM shell and memory nonce is still zero.
 */
export function hydrateMoveTrainer3LearnSessionFromStorage(routePath) {
  if (typeof sessionStorage === 'undefined') return false
  if (!routePath || typeof routePath !== 'string') return false
  let p = routePath
  try {
    p = decodeURIComponent(routePath)
  } catch {
    /* keep raw */
  }
  const onLearnShell =
    /\/move-trainer\/move-trainer-3\/play-move$/.test(p)
    || /\/move-trainer\/move-trainer-3\/opponents-move-\d+$/.test(p)
  if (!onLearnShell) return false
  if (moveTrainer3StartLearningNonce.value > 0) return false

  const data = readMoveTrainer3LearnSessionFromStorage()
  if (!data || data.v !== 1) return false
  const nonceNum = Number(data.nonce)
  if (!Number.isFinite(nonceNum) || nonceNum <= 0) return false

  const cap = allPlies.value.length
  const bmCap = moveTrainer3BlackMovesTotal.value
  const plyIn = Math.floor(Number(data.currentPly))
  const ply = Number.isFinite(plyIn) ? Math.max(0, Math.min(cap, plyIn)) : 0
  const maxIn = Math.floor(Number(data.footerNavMaxPly))
  let maxPly = Number.isFinite(maxIn) ? Math.max(0, Math.min(cap, maxIn)) : 0
  maxPly = Math.max(maxPly, ply)
  const bmIn = Math.floor(Number(data.blackMovesCompleted))
  const bm = Number.isFinite(bmIn) ? Math.max(0, Math.min(bmCap, bmIn)) : 0

  moveTrainer3StartLearningNonce.value = Math.max(1, Math.floor(nonceNum))
  currentPly.value = ply
  moveTrainer3FooterNavMaxPly.value = maxPly
  moveTrainer3BlackMovesCompleted.value = bm

  const oans = Math.floor(Number(data.omAuthorNoteStep))
  moveTrainer3OmAuthorNoteStep.value = Number.isFinite(oans) && oans >= 0 ? oans : 0

  const ocp = typeof data.omChapterPhase === 'string' ? data.omChapterPhase : 'inactive'
  moveTrainer3OmChapterPhase.value = ['inactive', 'read', 'instruction'].includes(ocp) ? ocp : 'inactive'

  if (data.omChapterOverflows === true || data.omChapterOverflows === false)
    moveTrainer3OmChapterOverflows.value = data.omChapterOverflows
  else moveTrainer3OmChapterOverflows.value = null

  moveTrainer3OmChapterContinueUsed.value = !!data.omChapterContinueUsed

  clearMoveTrainer3OmReadingBoardBranch()
  moveTrainer3SuppressLearnShellRouteAlign.value = false
  moveTrainer3OmPostAuthorChain.value = null

  return true
}

watch(
  [
    moveTrainer3StartLearningNonce,
    currentPly,
    moveTrainer3FooterNavMaxPly,
    moveTrainer3BlackMovesCompleted,
    moveTrainer3OmAuthorNoteStep,
    moveTrainer3OmChapterPhase,
    moveTrainer3OmChapterOverflows,
    moveTrainer3OmChapterContinueUsed,
  ],
  () => persistMoveTrainer3LearnSession(),
  { flush: 'post' },
)

