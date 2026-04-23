<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Chess } from 'chess.js'
import { playSound } from '../../shared/chess-components/sounds/index.js'
import { CcButton, CcIcon, CcSidebarHeader, CcProgressBar } from '@chesscom/design-system'
import CoachBubble from '../components/CoachBubble.vue'
import MoveList from '../components/MoveList.vue'
import MoveListHeader from '../components/MoveListHeader.vue'
import PanelFooterV10 from '../components/PanelFooterV10.vue'
import { MOVE_CLASSIFICATIONS } from '../data/classifications.js'
import { INTRO_1_GAME, INTRO_2_GAME, INTRO_3_GAME, SAMPLE_GAME } from '../data/gameData.js'
import {
  INFORMATIONAL_DREAM_OPENING,
  hasInteractiveMoveSegments,
  maxPlyFromMoveSegments,
} from '../data/informationalDreamOpening.js'
import { INFORMATIONAL_DANNY_TEN_RULES } from '../data/informationalDannyTenRules.js'
import { notationsStringToRichSegments } from '../lib/coachRichNotationsLine.js'
import {
  ASSISTED_INTRO_ROUTES,
  MOVE_TRAINER_LINE_ORDER,
  firstIntroAssistedPath,
  moveTrainerCurrentLine,
  moveTrainerNextPath,
  moveTrainerPrevPath,
  normalizeAppPath,
  parseIntroAssistedPath,
} from '../data/moveTrainerLineOrder.js'
import { getUnassistedQuizStep, UNASSISTED_QUIZZES } from '../data/unassistedQuizzes.js'

const QUIZ_1_COACH_MESSAGE = `Now let's test your memory. Make the best developing moves possible in the same order you just saw in the previous variation.

Hint:

- Control the center with pawns.

- Knights before bishops.

- Bring in the queen to prepare to castle queenside.`

/** Second-bubble copy for `quiz-2` … `quiz-4` (Review #1–#3). `quiz-1` / unassisted steps use `unassistedQuizzes.js` or the default above. */
const QUIZ_COACH_MESSAGES_BY_LINE = {
  'move-trainer-quiz-2': `Regardless of the first moves, you should always castle early to get your king to safety. Which move simultaneously prepares castling and develops a piece to control the center?`,
  'move-trainer-quiz-3': `Let's say we have this opening position when Black has boldly attacked the d4-pawn with the queen. What is the best course of action?`,
  'move-trainer-quiz-4': `White has managed to seize the center with both central pawns - a great achievement in the opening. How should we continue our development?`,
}

/** Intro review: single coach bubble body (paragraph style); CTA is “Start learning”. */
const INTRO_COACH_MESSAGE =
  "Take a moment to review the moves, then start learning whenever you're ready."

/** Video line (`kind: 'video'`) — single light bubble, no two-bubble strip. */
const VIDEO_PAGE_COACH_MESSAGE =
  "Watch the video, then continue when you're ready for the next step."

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

/** Corner settings (feature-flag) UI — set `true` to show again; markup stays mounted. */
const SHOW_CORNER_FEATURE_FLAGS_UI = false

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
/** Overview pane removed; right column is always the line / review layout. */
const isReview = computed(() => true)

function onSidebarHeaderBackClick() {
  /* Back stays enabled in UI; no navigation (overview route removed). */
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
const gameMoves = ref([...SAMPLE_GAME.moves])
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
const currentPly = ref(1)

const route = useRoute()
const router = useRouter()

function applyGameMovesForRoute() {
  const path = normalizeAppPath(route.path)
  const parts = path.split('/').filter(Boolean)
  if (parts.includes('intro-1')) {
    gameMoves.value = INTRO_1_GAME.moves
    gameResult.value = INTRO_1_GAME.result
  }
  else if (parts.includes('intro-2')) {
    gameMoves.value = INTRO_2_GAME.moves
    gameResult.value = INTRO_2_GAME.result
  }
  else if (parts.includes('intro-3')) {
    gameMoves.value = INTRO_3_GAME.moves
    gameResult.value = INTRO_3_GAME.result
  }
  else {
    gameMoves.value = [...SAMPLE_GAME.moves]
    gameResult.value = SAMPLE_GAME.result
  }
}

const moveTrainerLine = computed(() => moveTrainerCurrentLine(route))

/** FEN after 1...d5 — white to move (intro-1 quiz `aq-1`). */
const INTRO_1_QUIZ_DECISION_FEN = INTRO_1_GAME.moves[0].black.fen
/** FEN after the only graded correct reply exd5 (used on `aq-1-correct` and for drag target checks). */
const INTRO_1_AFTER_EXD5_FEN = (() => {
  const c = new Chess(INTRO_1_QUIZ_DECISION_FEN)
  c.move({ from: 'e4', to: 'd5', promotion: 'q' })
  return c.fen()
})()

const isInformationalPage = computed(() => moveTrainerLine.value?.kind === 'informational')

/** Dream Opening vs Danny's Ten Opening Rules (and future informational lines). */
const informationalLineSegments = computed(() => {
  if (moveTrainerLine.value?.name === 'move-trainer-informational-2') {
    return INFORMATIONAL_DANNY_TEN_RULES.segments
  }
  return INFORMATIONAL_DREAM_OPENING.segments
})

const isVideoPage = computed(() => moveTrainerLine.value?.kind === 'video')

const isIntroPage = computed(() => moveTrainerLine.value?.kind === 'intro')

const isQuizPage = computed(() => moveTrainerLine.value?.kind === 'quiz')

/** Intro-1 assisted sequence after “Start learning” — quiz-like panel (no move list, two-bubble coach). */
const isAssistedLearningPage = computed(() => moveTrainerLine.value?.kind === 'assisted-learning')

const assistedLessonStep = computed(() => {
  const line = moveTrainerLine.value
  if (!line || line.kind !== 'assisted-learning') return null
  const slug = line.assistedIntroSlug
  const id = line.assistedStepId
  const steps = slug ? ASSISTED_INTRO_ROUTES[slug]?.steps ?? [] : []
  return steps.find(s => s.id === id) ?? null
})

const assistedLearningSegments = computed(() => assistedLessonStep.value?.segments ?? null)

const assistedCoachInformational = computed(
  () => isAssistedLearningPage.value && (assistedLearningSegments.value?.length ?? 0) > 0,
)

const assistedProgressPercent = computed(() => {
  /** Quiz step: bar stays at 0% until the player commits a move (then route changes). */
  if (moveTrainerLine.value?.assistedStepId === 'aq-1') return 0
  const step = assistedLessonStep.value
  const total = step?.progressTotal
  if (!total) return 0
  const stepN = step.progressStep ?? 1
  return Math.min(100, Math.round((stepN / total) * 100))
})

/**
 * CcProgressBar `variant` (Chess.com design system): `'default' | 'success' | 'warning' | 'error'` — no separate "empty" variant.
 * Before a graded answer on `aq-1`, use `default` at 0% for a neutral empty track.
 */
const assistedProgressBarVariant = computed(() => {
  const id = moveTrainerLine.value?.assistedStepId
  if (id === 'aq-1') return 'default'
  if (id === 'aq-1-correct') return 'success'
  if (id === 'aq-1-incorrect') return 'error'
  return 'default'
})

function assistedRouteStepId() {
  const raw = route.params.assistedStep
  if (raw == null) return ''
  return Array.isArray(raw) ? String(raw[0] ?? '') : String(raw)
}

/** True on intro-1 quiz step (path, route name, or parsed line — any one can win). */
const isIntro1Aq1QuizBoard = computed(() => {
  if (route.name === 'move-trainer-intro-1-assisted' && assistedRouteStepId() === 'aq-1') return true
  const path = normalizeAppPath(route.path).replace(/\/$/, '')
  if (/\/intro-1\/aq-1$/.test(path)) return true
  return (
    isAssistedLearningPage.value
    && moveTrainerLine.value?.assistedIntroSlug === 'intro-1'
    && moveTrainerLine.value?.assistedStepId === 'aq-1'
  )
})

// --- Unassisted interactive quiz (e.g. /page-3/quiz-1, /page-3/quiz-1/2) — see unassistedQuizzes.js
/** `play` | `wrong_incorrect` | `wrong_continue` | `wrong_after_e4` — `quiz-1` step 1 wrong-sequence only */
const uQuiz1Phase = ref('play')
const uQuizBoardFenOverride = ref(null)
const uWrongSequenceTimers = []

function clearWrongSequenceTimers() {
  while (uWrongSequenceTimers.length) {
    clearTimeout(uWrongSequenceTimers.pop())
  }
}

const unassistedSlug = computed(() => {
  const n = moveTrainerLine.value?.name
  if (!n || !n.startsWith('move-trainer-')) return null
  return n.replace(/^move-trainer-/, '')
})

const unassistedStepNumber = computed(() => moveTrainerLine.value?.unassistedStep ?? 1)

const isUnassistedConfiguredQuiz = computed(
  () => isQuizPage.value && !!unassistedSlug.value && Object.prototype.hasOwnProperty.call(UNASSISTED_QUIZZES, unassistedSlug.value),
)

const unassistedStepConfig = computed(() => {
  if (!isUnassistedConfiguredQuiz.value || !unassistedSlug.value) return null
  return getUnassistedQuizStep(unassistedSlug.value, unassistedStepNumber.value)
})

const isUnassistedQuiz1Step1 = computed(
  () => isUnassistedConfiguredQuiz.value
    && unassistedSlug.value === 'quiz-1'
    && unassistedStepNumber.value === 1,
)

const isUnassistedDraggable = computed(
  () => isUnassistedQuiz1Step1.value && uQuiz1Phase.value === 'play' && !!unassistedStepConfig.value?.correct,
)

const isBoardQuizDragLayout = computed(() => isIntro1Aq1QuizBoard.value || isUnassistedDraggable.value)

const isBoardQuizModeVisual = computed(
  () => isIntro1Aq1QuizBoard.value
    || (isUnassistedQuiz1Step1.value
      && (uQuiz1Phase.value === 'play'
        || uQuiz1Phase.value === 'wrong_incorrect'
        || uQuiz1Phase.value === 'wrong_continue'
        || uQuiz1Phase.value === 'wrong_after_e4')),
)

const coachQuizStripState = computed(() => {
  if (!isUnassistedQuiz1Step1.value) return 'play'
  if (uQuiz1Phase.value === 'wrong_incorrect') return 'wrong_incorrect'
  /** "Let's continue!" until Next: same header for post–piece-back and after auto 1. e4 (notation shown below). */
  if (uQuiz1Phase.value === 'wrong_continue' || uQuiz1Phase.value === 'wrong_after_e4') return 'wrong_continue'
  return 'play'
})

/** Unassisted wrong path: same rich segments as Dream Opening (`1. ` text + `e4` chip from `notation`). */
const coachMessageNotationSegments = computed(() => {
  if (!isUnassistedQuiz1Step1.value || uQuiz1Phase.value !== 'wrong_after_e4') return null
  return notationsStringToRichSegments(unassistedStepConfig.value?.notation || '1. e4')
})

const coachMessageNotationActivePly = computed(() => {
  const segs = coachMessageNotationSegments.value
  if (!segs?.length) return 0
  const m = segs.find((s) => s.type === 'move')
  return m?.ply ?? 0
})

const showUnassistedPostWrongNext = computed(
  () => isUnassistedQuiz1Step1.value && uQuiz1Phase.value === 'wrong_after_e4',
)

const quizMoveFromSquare = ref(null)

/** Persisted FEN after a wrong white try — `/aq-1-incorrect` reads this so the board matches what you played. */
const INTRO1_AQ1_INCORRECT_RESULT_FEN_KEY = 'moveTrainerIntro1Aq1IncorrectResultFen'

function clearIntro1Aq1IncorrectResultFen() {
  try {
    sessionStorage.removeItem(INTRO1_AQ1_INCORRECT_RESULT_FEN_KEY)
  } catch {
    /* private mode / SSR */
  }
}

function persistIntro1Aq1IncorrectResultFen(fen) {
  if (typeof fen !== 'string' || !fen.includes('/')) return
  try {
    new Chess(fen)
    sessionStorage.setItem(INTRO1_AQ1_INCORRECT_RESULT_FEN_KEY, fen)
  } catch {
    /* invalid FEN */
  }
}

function readIntro1Aq1IncorrectResultFen() {
  try {
    const raw = sessionStorage.getItem(INTRO1_AQ1_INCORRECT_RESULT_FEN_KEY)
    if (!raw || !raw.includes('/')) return null
    new Chess(raw)
    return raw
  } catch {
    return null
  }
}

/** Place `from` onto `to` ignoring rules — preview only when `chess.move` is illegal. */
function fenAfterNaivePlacement(baseFen, from, to) {
  try {
    const c = new Chess(baseFen)
    const piece = c.remove(from)
    if (!piece) return null
    if (c.get(to)) c.remove(to)
    if (!c.put(piece, to)) return null
    return c.fen()
  } catch {
    return null
  }
}

const isQuizLayoutPage = computed(() => isQuizPage.value || isAssistedLearningPage.value)

/**
 * Long single-bubble copy (The Dream Opening, or assisted w/ `segments`): coach fills the panel and scrolls inside the bubble.
 * Two-bubble quiz / practice (e.g. Review #1–#3, Dream Opening – Practice) do **not** use this — second bubble hugs copy until it hits `--bubble-max-height`, then scrolls (`secondaryBubbleFitContent`).
 */
const coachFillsContentWindow = computed(
  () => isReview.value && (isInformationalPage.value || assistedCoachInformational.value),
)

/** Two-bubble only: secondary bubble height follows message (capped, scrolls if longer). True for all standalone quiz lines + non–informational-segment assisted steps. */
const coachSecondBubbleHugContent = computed(
  () => isReview.value
    && (isQuizPage.value
      || (isAssistedLearningPage.value && !assistedCoachInformational.value)),
)

/** `quiz-1` (The Dream Opening – Practice): second bubble grows with wrapped copy instead of scrolling inside 116px cap. */
const coachQuiz1SecondaryBubbleExpand = computed(
  () => isReview.value && moveTrainerLine.value?.name === 'move-trainer-quiz-1',
)

/** Same review shell as intro lines: move list (except quiz / informational), full-game ply cap, coach frozen on first move on intro. */
const isIntroLikeReviewPage = computed(
  () => isIntroPage.value || isQuizPage.value || isAssistedLearningPage.value,
)

/** Base intro-1 review URL only (not intro-2 / intro-3). */
const isIntro1LinePage = computed(
  () => isIntroPage.value && normalizeAppPath(route.path).split('/').filter(Boolean).pop() === 'intro-1',
)

const isIntro2LinePage = computed(
  () => isIntroPage.value && normalizeAppPath(route.path).split('/').filter(Boolean).pop() === 'intro-2',
)

const moveTrainerLineNav = computed(() => {
  const line = moveTrainerLine.value
  if (!line) {
    return { prevDisabled: true, nextDisabled: true }
  }
  const last = MOVE_TRAINER_LINE_ORDER.length - 1
  return {
    prevDisabled: line.index <= 0,
    nextDisabled: line.index >= last,
  }
})

/**
 * Max ply the user can reach on this screen: full game on intro, last inline move on informational.
 */
const reviewMaxPly = computed(() => {
  if (isInformationalPage.value) {
    const segs = informationalLineSegments.value
    if (segs && hasInteractiveMoveSegments(segs)) {
      const lineCap = maxPlyFromMoveSegments(segs)
      return Math.min(lineCap, totalPlies.value)
    }
    return totalPlies.value
  }
  if (
    isAssistedLearningPage.value
    && assistedLearningSegments.value
    && hasInteractiveMoveSegments(assistedLearningSegments.value)
  ) {
    const lineCap = maxPlyFromMoveSegments(assistedLearningSegments.value)
    return Math.min(lineCap, totalPlies.value)
  }
  return totalPlies.value
})

function goToStart() { currentPly.value = 0 }
function goBack() { currentPly.value = Math.max(0, currentPly.value - 1) }
function goForward() {
  currentPly.value = Math.min(reviewMaxPly.value, currentPly.value + 1)
}
function goToEnd() { currentPly.value = reviewMaxPly.value }
function goToPly(index) {
  currentPly.value = Math.max(0, Math.min(reviewMaxPly.value, index))
}

// Intro-1 quiz (`aq-1`): copy OpeningCoursesV3 drag & drop — mousedown/touchstart on piece img,
// document mousemove/mouseup/touchmove/touchend (mounted once), rect math for drop square, floating ghost.
const boardRef = ref(null)
const isQuizDragging = ref(false)
const quizDraggedPiece = ref(null)
const quizDraggedFrom = ref(null)
const quizDragPosition = ref({ x: 0, y: 0 })

const QUIZ_TOUCH_MOVE_OPTS = { passive: false }

function resetQuizDragUi() {
  isQuizDragging.value = false
  quizDraggedPiece.value = null
  quizDraggedFrom.value = null
}

/** Ignore synthetic click after drag (same issue class boards hit with @click on the grid). */
let quizIgnoreBoardClicksUntil = 0

/** OpeningCoursesV3 `handleDragStart` — only on `aq-1`; any piece may be picked up. */
function handleQuizDragStart(event, square) {
  if (isUnassistedDraggable.value) {
    const piece = getPieceOnSquare(square)
    if (!piece) return
    const chess = new Chess(piecesBoardFen.value)
    if (!chess.get(square)) return
    event.preventDefault()
    isQuizDragging.value = true
    quizDraggedPiece.value = piece
    quizDraggedFrom.value = square
    quizMoveFromSquare.value = square
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    quizDragPosition.value = { x: clientX, y: clientY }
    return
  }
  if (!isIntro1Aq1QuizBoard.value) return

  const piece = getPieceOnSquare(square)
  if (!piece) return

  const chess = new Chess(piecesBoardFen.value)
  const onBoard = chess.get(square)
  if (!onBoard) return

  event.preventDefault()

  isQuizDragging.value = true
  quizDraggedPiece.value = piece
  quizDraggedFrom.value = square
  quizMoveFromSquare.value = square

  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  quizDragPosition.value = { x: clientX, y: clientY }
}

/** OpeningCoursesV3 `handleDragMove`. */
function handleQuizDragMove(event) {
  if (!isQuizDragging.value) return
  event.preventDefault()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  quizDragPosition.value = { x: clientX, y: clientY }
}

/**
 * Drop square: prefer DOM under cursor (Opening-style reliability), then rect math on clamped coords.
 */
function getQuizSquareFromPosition(x, y) {
  if (!boardRef.value) return null
  const board = boardRef.value
  const rect = board.getBoundingClientRect()
  const xC = Math.min(rect.right - 1e-3, Math.max(rect.left + 1e-3, x))
  const yC = Math.min(rect.bottom - 1e-3, Math.max(rect.top + 1e-3, y))
  const el = document.elementFromPoint(xC, yC)
  const cell = el?.closest?.('[data-square]')
  if (cell instanceof HTMLElement && board.contains(cell)) {
    const ds = cell.dataset.square
    if (typeof ds === 'string' && /^[a-h][1-8]$/.test(ds)) return ds
  }
  const w = rect.width / 8
  const h = rect.height / 8
  const col = Math.floor((xC - rect.left) / w)
  const row = Math.floor((yC - rect.top) / h)
  if (col < 0 || col > 7 || row < 0 || row > 7) return null
  const file = files[col]
  const rank = 8 - row
  return `${file}${rank}`
}

/** OpeningCoursesV3 `handleDragEnd` — graded move only on active `aq-1`. */
function handleQuizDragEnd(event) {
  if (!isQuizDragging.value) return
  const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX
  const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY
  const targetSquare = getQuizSquareFromPosition(clientX, clientY)
  const fromSq = quizDraggedFrom.value
  if (targetSquare && fromSq && targetSquare !== fromSq) {
    if (isUnassistedDraggable.value) {
      attemptUnassistedQuizMove(fromSq, targetSquare)
    }
    else if (isIntro1Aq1QuizBoard.value) {
      attemptQuizMove(fromSq, targetSquare)
    }
  }
  isQuizDragging.value = false
  quizDraggedPiece.value = null
  quizDraggedFrom.value = null
  quizMoveFromSquare.value = null
  quizIgnoreBoardClicksUntil = performance.now() + 350
}

function isQuizPieceDragged(square) {
  return isQuizDragging.value && quizDraggedFrom.value === square
}

/** Wire piece img like OpeningCoursesV3. */
function onQuizPieceMouseOrTouch(event, square) {
  if (isUnassistedDraggable.value) {
    if (isSquareDraggableOnUnassistedBoard(square)) handleQuizDragStart(event, square)
    return
  }
  if (!isIntro1Aq1QuizBoard.value || !isSquareDraggableOnIntro1Aq1Board(square)) return
  handleQuizDragStart(event, square)
}

/** Any committed move on `aq-1` that is not exd5 → incorrect (includes illegal attempts). Wrong result FEN is shown on `/aq-1-incorrect`. */
function attemptQuizMove(from, to) {
  if (!from || !to || from === to) return
  const path = normalizeAppPath(route.path)
  const assisted = parseIntroAssistedPath(path)
  if (!assisted) return
  if (moveTrainerLine.value?.assistedStepId !== 'aq-1') return

  const chess = new Chess(INTRO_1_QUIZ_DECISION_FEN)
  const move = chess.move({ from, to, promotion: 'q' })
  const isCorrect = !!(move && move.from === 'e4' && move.to === 'd5' && move.captured)
  if (isCorrect) {
    clearIntro1Aq1IncorrectResultFen()
    playSound('capture')
    router.push(`${assisted.basePath}/aq-1-correct`)
    return
  }

  if (move?.captured) {
    playSound('capture')
  } else {
    playSound('move')
  }

  const wrongFen = move
    ? chess.fen()
    : (fenAfterNaivePlacement(INTRO_1_QUIZ_DECISION_FEN, from, to) ?? INTRO_1_QUIZ_DECISION_FEN)
  persistIntro1Aq1IncorrectResultFen(wrongFen)
  router.push(`${assisted.basePath}/aq-1-incorrect`)
}

/** Unassisted `quiz-1` step 1: only e2–e4 is correct. Wrong → timed sequence: incorrect header + sound, ~1s “piece back” + “Let’s continue!”, then auto 1. e4 + notation + Next. */
function attemptUnassistedQuizMove(from, to) {
  if (!from || !to || from === to) return
  if (!isUnassistedDraggable.value) return
  const cfg = unassistedStepConfig.value
  if (!cfg?.correct) return
  const baseFen = cfg.fen
  const chess = new Chess(baseFen)
  const move = chess.move({ from, to, promotion: 'q' })
  const c = cfg.correct
  const isCorrect = !!(move && move.from === c.from && move.to === c.to)
  if (isCorrect) {
    clearWrongSequenceTimers()
    uQuiz1Phase.value = 'play'
    uQuizBoardFenOverride.value = null
    playSound('move')
    const line = moveTrainerLine.value
    const base = line ? MOVE_TRAINER_LINE_ORDER.find(e => e.name === line.name)?.path : null
    if (base) router.push(`${base}/2`)
    return
  }
  const wrongFen = move
    ? chess.fen()
    : (fenAfterNaivePlacement(baseFen, from, to) ?? baseFen)
  clearWrongSequenceTimers()
  playSound('incorrect')
  uQuizBoardFenOverride.value = wrongFen
  uQuiz1Phase.value = 'wrong_incorrect'
  uWrongSequenceTimers.push(
    setTimeout(() => {
      uQuiz1Phase.value = 'wrong_continue'
      uQuizBoardFenOverride.value = baseFen
      playSound('move')
      uWrongSequenceTimers.push(
        setTimeout(() => {
          const fix = new Chess(baseFen)
          fix.move({ from: c.from, to: c.to, promotion: 'q' })
          uQuiz1Phase.value = 'wrong_after_e4'
          uQuizBoardFenOverride.value = fix.fen()
          playSound('move')
        }, 400),
      )
    }, 1000),
  )
}

function onChessboardClick(event) {
  if (performance.now() < quizIgnoreBoardClicksUntil) return
  const cell = event.target?.closest?.('[data-square]')
  if (!cell || !(cell instanceof HTMLElement)) return
  const square = cell.dataset.square
  if (!square) return
  onBoardSquareClick(square)
}

function onBoardSquareClick(square) {
  if (isUnassistedDraggable.value) {
    const chess = new Chess(piecesBoardFen.value)
    const from = quizMoveFromSquare.value
    if (!from) {
      const piece = chess.get(square)
      if (piece) quizMoveFromSquare.value = square
      return
    }
    if (from === square) {
      quizMoveFromSquare.value = null
      return
    }
    quizMoveFromSquare.value = null
    attemptUnassistedQuizMove(from, square)
    return
  }
  if (!isIntro1Aq1QuizBoard.value) return
  const chess = new Chess(INTRO_1_QUIZ_DECISION_FEN)
  const from = quizMoveFromSquare.value
  if (!from) {
    const piece = chess.get(square)
    if (piece) quizMoveFromSquare.value = square
    return
  }
  if (from === square) {
    quizMoveFromSquare.value = null
    return
  }
  quizMoveFromSquare.value = null
  attemptQuizMove(from, square)
}

const atStart = computed(() => currentPly.value === 0)
/** Forward chevron / end of line for the current page (informational stops at last chip move). */
const atReviewLineEnd = computed(() => currentPly.value >= reviewMaxPly.value)

// ============================================
// BOARD ← driven by current ply
// ============================================
const isIntro1GameRoute = computed(() => normalizeAppPath(route.path).split('/').filter(Boolean).includes('intro-1'))
const isIntro2GameRoute = computed(() => normalizeAppPath(route.path).split('/').filter(Boolean).includes('intro-2'))
const isIntro3GameRoute = computed(() => normalizeAppPath(route.path).split('/').filter(Boolean).includes('intro-3'))

const currentFen = computed(() => {
  if (currentPly.value === 0) {
    if (isIntro2GameRoute.value) return INTRO_2_GAME.initialFen
    if (isIntro1GameRoute.value) return INTRO_1_GAME.initialFen
    if (isIntro3GameRoute.value) return INTRO_3_GAME.initialFen
    return SAMPLE_GAME.initialFen
  }
  const ply = allPlies.value[currentPly.value - 1]
  if (ply?.fen) return ply.fen
  if (isIntro2GameRoute.value) return INTRO_2_GAME.initialFen
  if (isIntro1GameRoute.value) return INTRO_1_GAME.initialFen
  if (isIntro3GameRoute.value) return INTRO_3_GAME.initialFen
  return SAMPLE_GAME.initialFen
})

/** Board FEN: stored wrong result on `aq-1-incorrect`, after exd5 on `aq-1-correct`, else review ply. */
const piecesBoardFen = computed(() => {
  if (uQuizBoardFenOverride.value) {
    return uQuizBoardFenOverride.value
  }
  if (isUnassistedConfiguredQuiz.value && unassistedStepConfig.value?.fen) {
    return unassistedStepConfig.value.fen
  }
  const line = moveTrainerLine.value
  if (
    isAssistedLearningPage.value
    && line?.assistedIntroSlug === 'intro-1'
    && line?.assistedStepId === 'aq-1-incorrect'
  ) {
    const stored = readIntro1Aq1IncorrectResultFen()
    if (stored) return stored
  }
  if (
    isAssistedLearningPage.value
    && line?.assistedIntroSlug === 'intro-1'
    && line?.assistedStepId === 'aq-1-correct'
  ) {
    return INTRO_1_AFTER_EXD5_FEN
  }
  return currentFen.value
})

const pieces = computed(() => {
  const fen = piecesBoardFen.value
  if (!fen) return []
  return parseFEN(fen)
})

function isSquareDraggableOnUnassistedBoard(square) {
  if (!isUnassistedDraggable.value) return false
  try {
    return !!new Chess(piecesBoardFen.value).get(square)
  } catch {
    return false
  }
}

/** Only `aq-1`: any occupied square is draggable (feedback screens are view-only). */
function isSquareDraggableOnIntro1Aq1Board(square) {
  if (!isIntro1Aq1QuizBoard.value) return false
  try {
    return !!new Chess(piecesBoardFen.value).get(square)
  } catch {
    return false
  }
}

function isSquareDraggableOnActiveQuizBoard(square) {
  if (isUnassistedDraggable.value) return isSquareDraggableOnUnassistedBoard(square)
  return isSquareDraggableOnIntro1Aq1Board(square)
}

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

/** Matches `--coach-avatar-size` (64 / 80 / 96px); portrait is square at this size. */
const coachAvatarIconPx = computed(() =>
  panelBreakpoint.value === 'sm' ? 64 : panelBreakpoint.value === 'md' ? 80 : 96,
)

const panelClass = computed(() => `panel-${panelBreakpoint.value}`)

const panelStyle = computed(() => ({
  width: `${panelWidth.value}px`,
  '--coach-avatar-size': panelBreakpoint.value === 'sm' ? '64px'
    : panelBreakpoint.value === 'md' ? '80px' : '96px',
  '--coach-container-height': panelBreakpoint.value === 'sm' ? '156px'
    : panelBreakpoint.value === 'md' ? '136px' : '116px',
  '--coach-tip-top': panelBreakpoint.value === 'sm' ? '30px'
    : panelBreakpoint.value === 'md' ? '25px' : '50px',
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

onMounted(() => {
  document.addEventListener('mousemove', handleQuizDragMove)
  document.addEventListener('mouseup', handleQuizDragEnd)
  document.addEventListener('touchmove', handleQuizDragMove, QUIZ_TOUCH_MOVE_OPTS)
  document.addEventListener('touchend', handleQuizDragEnd)
})

onUnmounted(() => {
  clearWrongSequenceTimers()
  document.removeEventListener('mousemove', handleQuizDragMove)
  document.removeEventListener('mouseup', handleQuizDragEnd)
  document.removeEventListener('touchmove', handleQuizDragMove, QUIZ_TOUCH_MOVE_OPTS)
  document.removeEventListener('touchend', handleQuizDragEnd)
  resetQuizDragUi()
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})

// ============================================
// COACH STATE
// Intro-1: coach stays on the first move (1. d4) while the board/footer follow `currentPly`.
// Elsewhere: coach follows the selected ply.
// ============================================
const coachPlyData = computed(() => {
  if (isIntroPage.value) {
    return allPlies.value[0] ?? null
  }
  if (currentPly.value === 0) return null
  return allPlies.value[currentPly.value - 1]
})

const coachHeaderIcon = computed(() => {
  if (isQuizLayoutPage.value) return ''
  const ply = coachPlyData.value
  if (!ply) return ''
  return MOVE_CLASSIFICATIONS[ply.classification]?.icon || ''
})

const coachHeaderText = computed(() => {
  if (isQuizLayoutPage.value) {
    /* Truthy placeholder so two-bubble layout stays active; strip label comes from `turnStripText`. */
    return '\u00a0'
  }
  const ply = coachPlyData.value
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
  if (isQuizLayoutPage.value) return ''
  const ply = coachPlyData.value
  return ply?.eval || ''
})

const coachWhiteAdvantage = computed(() => {
  const ev = coachEvalText.value
  if (!ev) return true
  return !ev.startsWith('-')
})

const coachMessage = computed(() => {
  if (isInformationalPage.value) {
    /* Segmented body with inline move chips is provided via `informationalSegments`. */
    return ''
  }
  if (isAssistedLearningPage.value) {
    if (assistedLearningSegments.value?.length) return ''
    const slug = moveTrainerLine.value?.assistedIntroSlug
    const id = moveTrainerLine.value?.assistedStepId
    const steps = slug ? ASSISTED_INTRO_ROUTES[slug]?.steps ?? [] : []
    const step = steps.find(s => s.id === id)
    return step?.coachMessage ?? ''
  }
  if (isVideoPage.value) return VIDEO_PAGE_COACH_MESSAGE
  if (isIntroPage.value) return INTRO_COACH_MESSAGE
  if (isQuizPage.value) {
    if (isUnassistedConfiguredQuiz.value && unassistedStepConfig.value?.coachMessage) {
      return unassistedStepConfig.value.coachMessage
    }
    const name = moveTrainerLine.value?.name
    if (name && QUIZ_COACH_MESSAGES_BY_LINE[name]) {
      return QUIZ_COACH_MESSAGES_BY_LINE[name]
    }
    return QUIZ_1_COACH_MESSAGE
  }
  const ply = coachPlyData.value
  return ply?.coachText || 'Review any move to see coach analysis.'
})

const coachTurnStripText = computed(() => (isQuizLayoutPage.value ? 'White to play' : 'White to move'))

const lineHeaderTitle = computed(() => {
  if (isAssistedLearningPage.value) {
    const base = moveTrainerLine.value?.lineHeader ?? ''
    const step = assistedLessonStep.value
    const label = step?.progressTotal
      ? `${step.progressStep ?? 1}/${step.progressTotal}`
      : '1/3'
    return base ? `${base} · ${label}` : label
  }
  if (moveTrainerLine.value?.lineHeader) return moveTrainerLine.value.lineHeader
  return SAMPLE_GAME.openingDisplayTitle
})

const bubbleStartPosition = computed(() => {
  if (isInformationalPage.value) return false
  if (assistedCoachInformational.value) return false
  if (isQuizLayoutPage.value) return false
  if (isVideoPage.value) return false
  return !coachHeaderText.value
})

/** Video toolbar toggle (Courses V10 chapter icon footer). */
const showVideoSection = ref(true)
function toggleVideoToolbar() {
  showVideoSection.value = !showVideoSection.value
}

const moveListScrolled = ref(false)
function onMoveListScroll(e) {
  moveListScrolled.value = e.target.scrollTop > 0
}

/** Set to true to show Share + Next above the move list again. */
const showTopShareNextButtons = ref(false)

/**
 * Footer chevrons step through plies when: intro (move list), or informational pages that include
 * inline move chips (`hasInteractiveMoveSegments`). Otherwise both disabled. Back at ply 0; forward
 * at the page line end (informational: last chip move, e.g. Bc4; intro: last game ply).
 */
const footerMoveNavEnabled = computed(() => {
  if (!isReview.value) return false
  if (isVideoPage.value) {
    return false
  }
  if (isInformationalPage.value) {
    return true
  }
  if (isAssistedLearningPage.value && assistedLearningSegments.value) {
    return hasInteractiveMoveSegments(assistedLearningSegments.value)
  }
  return true
})

const footerNavBackDisabled = computed(() => !footerMoveNavEnabled.value || atStart.value)
const footerNavForwardDisabled = computed(() => !footerMoveNavEnabled.value || atReviewLineEnd.value)

/**
 * Route changes: load the correct game first, then set ply (avoids reading plies before INTRO_* moves are applied).
 */
watch(
  () => route.path,
  (pathRaw) => {
    clearWrongSequenceTimers()
    uQuiz1Phase.value = 'play'
    uQuizBoardFenOverride.value = null
    quizMoveFromSquare.value = null
    resetQuizDragUi()
    applyGameMovesForRoute()
    const path = normalizeAppPath(pathRaw)
    const line = MOVE_TRAINER_LINE_ORDER.find(e => e.path === path)
    if (line && (line.kind === 'intro' || line.kind === 'quiz' || line.kind === 'video')) {
      currentPly.value = 1
    }
    const assisted = parseIntroAssistedPath(path)
    if (assisted) {
      if (assisted.introSlug === 'intro-1') {
        if (assisted.stepId !== 'aq-1-incorrect') {
          clearIntro1Aq1IncorrectResultFen()
        }
        const sid = assisted.stepId
        if (sid === 'aq-1' || sid === 'aq-1-correct' || sid === 'aq-1-incorrect') currentPly.value = 2
        else currentPly.value = 1
      }
      else {
        currentPly.value = 1
      }
    }
  },
  { immediate: true },
)

/** Stay within this page’s line cap (e.g. informational last chip = Bc4 / ply 5). */
watch(
  [reviewMaxPly, () => route.path],
  () => {
    if (currentPly.value > reviewMaxPly.value) {
      currentPly.value = reviewMaxPly.value
    }
  },
  { immediate: true },
)

function onOpeningLineNext() {
  const next = moveTrainerNextPath(route.path)
  if (next) router.push(next)
}

function onOpeningLinePrev() {
  const prev = moveTrainerPrevPath(route.path)
  if (prev) router.push(prev)
}

function onStartLearningAssisted(introSlug) {
  const next = firstIntroAssistedPath(introSlug)
  if (next) router.push(next)
}

function onIntroStartLearningOrNext() {
  if (isIntro1LinePage.value) onStartLearningAssisted('intro-1')
  else if (isIntro2LinePage.value) onStartLearningAssisted('intro-2')
  else onOpeningLineNext()
}

function goToUnassistedAfterWrong() {
  const line = moveTrainerLine.value
  if (!line?.name) return
  const base = MOVE_TRAINER_LINE_ORDER.find(e => e.name === line.name)?.path
  if (base) router.push(`${base}/2`)
}
</script>

<template>
  <div class="app dark-mode">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="board-wrapper">
          <div
            ref="boardRef"
            class="chessboard"
            :class="{ 'chessboard--quiz-active': isBoardQuizModeVisual }"
            @click="onChessboardClick"
          >
            <div
              v-for="square in squares"
              :key="square"
              class="square"
              :class="[
                isLightSquare(square) ? 'light' : 'dark',
                { 'square--quiz-from': isBoardQuizModeVisual && quizMoveFromSquare === square },
                { 'square--quiz-white': isBoardQuizModeVisual && isSquareDraggableOnActiveQuizBoard(square) },
              ]"
              :data-square="square"
            >
              <img
                v-if="getPieceOnSquare(square) && (!isBoardQuizModeVisual || !isQuizPieceDragged(square))"
                class="piece"
                :class="{ draggable: isBoardQuizModeVisual && isSquareDraggableOnActiveQuizBoard(square) }"
                :src="getPieceImage(getPieceOnSquare(square))"
                :alt="getPieceOnSquare(square).type"
                draggable="false"
                @mousedown="onQuizPieceMouseOrTouch($event, square)"
                @touchstart="onQuizPieceMouseOrTouch($event, square)"
              />
              <span v-if="square[1] === '1'" class="coord file-coord">{{ square[0] }}</span>
              <span v-if="square[0] === 'a'" class="coord rank-coord">{{ square[1] }}</span>
            </div>
          </div>
          <img
            v-if="isBoardQuizDragLayout && isQuizDragging && quizDraggedPiece"
            class="dragged-piece"
            :src="getPieceImage(quizDraggedPiece)"
            :alt="quizDraggedPiece.type"
            draggable="false"
            :style="{
              left: `${quizDragPosition.x}px`,
              top: `${quizDragPosition.y}px`,
            }"
          />
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
        <div class="review-panel-header-row">
          <CcSidebarHeader
            class="review-panel-header-row__main"
            variant="secondary"
            title="Everything You Need to Know About Chess"
            :has-back-button="true"
            :end-icon="{ icon: { name: 'media-audio-speaker-noise' } }"
            @click-start="onSidebarHeaderBackClick"
          />
          <div class="review-panel-header-row__trailing">
            <button type="button" class="review-panel-header-icon-btn" aria-label="Line list">
              <CcIcon name="layout-list-bullet" variant="glyph" :size="20" />
            </button>
          </div>
        </div>

        <div v-if="isReview" class="line-header-row">
          <MoveListHeader
            :title="lineHeaderTitle"
            :prev-disabled="moveTrainerLineNav.prevDisabled"
            :next-disabled="moveTrainerLineNav.nextDisabled"
            @next="onOpeningLineNext"
            @prev="onOpeningLinePrev"
          />
        </div>

        <div
          class="coach-section"
          :class="{
            'coach-section--informational-fill': coachFillsContentWindow,
          }"
        >
          <CoachBubble
            :header-icon="coachHeaderIcon"
            :header-text="coachHeaderText"
            :eval-text="coachEvalText"
            :white-advantage="coachWhiteAdvantage"
            :message="coachMessage"
            :coach-avatar-icon-px="coachAvatarIconPx"
            :turn-strip-text="coachTurnStripText"
            :quiz-strip-state="coachQuizStripState"
            :message-notation-segments="coachMessageNotationSegments"
            :message-notation-active-ply="coachMessageNotationActivePly"
            :show-tip="true"
            :start-position="bubbleStartPosition"
            :typewriter="false"
            :intro-coach-combined-bubble="isReview && (isIntroPage || isVideoPage)"
            :fill-available-height="coachFillsContentWindow"
            :secondary-bubble-fit-content="coachSecondBubbleHugContent"
            :secondary-bubble-expand-to-fit="coachQuiz1SecondaryBubbleExpand"
            :informational-single-bubble="isReview && (isInformationalPage || assistedCoachInformational)"
            :informational-segments="isInformationalPage ? informationalLineSegments : assistedLearningSegments"
            :informational-active-ply="currentPly"
            @select-informational-ply="goToPly"
          />
        </div>

        <div
          class="screen-content"
          :class="{ 'screen-content--footer-only': coachFillsContentWindow }"
        >
          <div class="screen-content-main">
            <div
              v-if="isReview"
              v-show="showTopShareNextButtons"
              class="button-pair top-buttons"
              :class="{ 'has-scroll-shadow': moveListScrolled }"
            >
              <CcButton variant="secondary" :icon="{ name: 'graph-nodes-share' }">Share</CcButton>
              <CcButton variant="primary" :icon="{ name: 'arrow-line-right' }">Next</CcButton>
            </div>
            <!-- REVIEW SCREEN -->
            <template v-if="isReview">
              <!-- Scrollable move list (hidden on informational + quiz layout: standalone quiz & assisted) -->
              <div
                v-if="!isInformationalPage && !isQuizLayoutPage && !isVideoPage"
                class="move-list-scroll"
                @scroll="onMoveListScroll"
              >
                <MoveList
                  :moves="gameMoves"
                  :result="gameResult"
                  :show-game-result="false"
                  :active-ply="currentPly"
                  :auto-tooltip="featureFlags.tooltipAppears"
                  @select-ply="goToPly"
                />
              </div>
              <div v-else-if="isVideoPage" class="video-page-panel" aria-label="Video">
                <div class="video-page-panel__frame">
                  <button type="button" class="video-page-panel__play" aria-label="Play video">
                    <svg class="video-page-panel__play-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path
                        fill="currentColor"
                        d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
          </div>
          <!-- Footer stays at bottom of panel; middle scrolls above it. -->
          <template v-if="isReview">
            <PanelFooterV10
              class="review-panel-footer"
              :class="{ 'panel-footer-v10--assisted-quiz': isAssistedLearningPage }"
            >
              <template #actions>
                <div v-if="isVideoPage" class="footer-buttons-row footer-buttons-row-full">
                  <CcButton
                    variant="primary"
                    size="large"
                    class="footer-btn-full"
                    :disabled="moveTrainerLineNav.nextDisabled"
                    @click="onOpeningLineNext"
                  >
                    Continue
                  </CcButton>
                </div>
                <div v-else-if="isInformationalPage" class="footer-buttons-row footer-buttons-row-split">
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
                    @click="onOpeningLineNext"
                  >
                    Learn Next Line
                  </CcButton>
                </div>
                <div v-else-if="isIntroPage" class="footer-buttons-row footer-buttons-row-split">
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
                    @click="onIntroStartLearningOrNext"
                  >
                    Start Learning
                  </CcButton>
                </div>
                <!-- `quiz-1` step 1: after a wrong try, single primary Next to step 2. -->
                <div v-else-if="showUnassistedPostWrongNext" class="footer-buttons-row footer-buttons-row-full">
                  <CcButton
                    variant="primary"
                    size="large"
                    class="footer-btn-full"
                    @click="goToUnassistedAfterWrong"
                  >
                    Next
                  </CcButton>
                </div>
                <!-- Standalone quiz lines: Video + Hint (no progress bar). -->
                <div v-else-if="isQuizPage" class="footer-buttons-row footer-buttons-row-split">
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
                    variant="secondary"
                    size="large"
                    class="footer-btn-equal"
                    :icon="{ name: 'device-bulb-glow', variant: 'glyph' }"
                  >
                    Hint
                  </CcButton>
                </div>
                <div v-else-if="isAssistedLearningPage" class="footer-assisted-quiz-footer">
                  <div class="footer-progress-bar-wrap">
                    <CcProgressBar :value="assistedProgressPercent" :variant="assistedProgressBarVariant" />
                  </div>
                  <div class="footer-buttons-row footer-buttons-row-split">
                    <CcButton variant="secondary" size="large" class="footer-btn-equal" :icon="{ name: 'media-camera-video-on' }" @click="toggleVideoToolbar">Video</CcButton>
                    <CcButton
                      variant="secondary"
                      size="large"
                      class="footer-btn-equal"
                      :icon="{ name: 'device-bulb-glow', variant: 'glyph' }"
                    >
                      Hint
                    </CcButton>
                  </div>
                </div>
                <!-- Compact footer: icon toolbar only. -->
                <div v-else></div>
              </template>
              <template #toolbar>
                <div class="footer-icon-group">
                  <button type="button" class="footer-icon-btn" aria-label="More options">
                    <CcIcon name="mark-ellipsis-horizontal" variant="glyph" :size="20" class="footer-icon" />
                  </button>
                  <template v-if="isIntroLikeReviewPage">
                    <button type="button" class="footer-icon-btn" aria-label="Open line notes">
                      <CcIcon name="document-book-open" variant="glyph" :size="20" class="footer-icon" />
                    </button>
                    <button type="button" class="footer-icon-btn" aria-label="Line information">
                      <CcIcon name="circle-fill-info" variant="glyph" :size="20" class="footer-icon" />
                    </button>
                  </template>
                  <button
                    v-else-if="!isVideoPage && !isInformationalPage && !assistedCoachInformational"
                    type="button"
                    class="footer-icon-btn"
                    :aria-label="showVideoSection ? 'Hide video' : 'Show video'"
                    @click="toggleVideoToolbar"
                  >
                    <CcIcon
                      :name="showVideoSection ? 'media-camera-video-off' : 'media-camera-video-on'"
                      variant="glyph"
                      :size="20"
                      class="footer-icon"
                    />
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
          </template>
        </div>

        <!-- Resize handle (right edge) -->
        <div class="resize-handle" @mousedown="onResizeStart"></div>
      </div>
    </div>

    <!-- Feature flag configurator (prototype-awards style) -->
    <div v-show="SHOW_CORNER_FEATURE_FLAGS_UI" class="feature-flags" :class="{ 'is-open': flagDrawerOpen }">
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

/* Board — keep above stray overlays / siblings in stacking contexts */
.board-section {
  position: relative;
  z-index: 3;
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

/* OpeningCoursesV3-style: prevent scroll/browser gestures from stealing piece drags on touch */
.chessboard--quiz-active {
  touch-action: none;
}

.square--quiz-white {
  cursor: grab;
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

.square--quiz-from {
  box-shadow: inset 0 0 0 3px rgba(255, 200, 80, 0.95);
  z-index: 2;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  user-select: none;
  pointer-events: none;
}

/* OpeningCoursesV3 `.piece.draggable` — quiz white pieces receive mousedown/touchstart */
.piece.draggable {
  pointer-events: auto;
  cursor: grab;
}

.piece.draggable:active {
  cursor: grabbing;
}

.dragged-piece {
  position: fixed;
  width: 8.5rem;
  height: 8.5rem;
  pointer-events: none;
  z-index: 1000;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
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

.review-panel-header-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
}

.review-panel-header-row__main {
  flex: 1 1 auto;
  min-width: 0;
}

.review-panel-header-row__trailing {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px 0 4px;
  border-bottom: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.08));
  box-sizing: border-box;
}

.review-panel-header-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

.review-panel-header-icon-btn:hover {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.04));
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

/* Opening line bar: under CcSidebarHeader, above coach */
.line-header-row {
  flex-shrink: 0;
  width: 100%;
}

/* Coach section — consistent padding on all routes / breakpoints */
.coach-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  padding: 8px 16px 16px 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: box-shadow 150ms ease;
}

/* Informational route: coach fills space from line header to footer */
.coach-section--informational-fill {
  flex: 1 1 0;
  min-height: 0;
}

.coach-section--informational-fill :deep(.coach-container) {
  flex: 1;
  min-height: 0;
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

/* Scrollable move list area */
.move-list-scroll {
  flex: 1;
  overflow-x: clip;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--space-24, 24px);
}

.panel-sm .move-list-scroll,
.panel-md .move-list-scroll {
  padding: 0 0 var(--space-24, 24px);
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

/* Informational + quiz layout: coach takes flex; content column is only top strip + footer (no move list). */
.screen-content--footer-only {
  flex: 0 0 auto;
  min-height: 0;
}

.screen-content--footer-only .screen-content-main {
  flex: 0 0 auto;
  min-height: 0;
}

/* Scrollable / fillable middle — grows so PanelFooterV10 stays at panel bottom. */
.screen-content-main {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Video line: black 16:9-style frame, full width of content column, play control centered */
.video-page-panel {
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.video-page-panel__frame {
  flex: 1 1 auto;
  width: 100%;
  /* Two steps of −10% height vs 16:9 at same width (≈ 0.81 × 9/16). */
  min-height: 12.96rem;
  aspect-ratio: 1600 / 729;
  max-height: min(40.5vh, 25.92rem);
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.video-page-panel__play {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0.8rem;
  border: none;
  background: none;
  color: #b8b8b8;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s ease, transform 0.1s ease;
}

.video-page-panel__play:hover {
  color: #e8e8e8;
}

.video-page-panel__play:active {
  transform: scale(0.98);
}

.video-page-panel__play-icon {
  width: 4.8rem;
  height: 4.8rem;
  display: block;
  margin-left: 0.35rem;
}

.review-panel-footer {
  flex-shrink: 0;
  width: 100%;
}

.footer-assisted-quiz-footer {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
}

.footer-progress-bar-wrap {
  width: 100%;
  padding: 10px 0 8px;
  box-sizing: border-box;
  flex-shrink: 0;
  background: unset;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-progress-bar-wrap :deep(.cc-progress-bar),
.footer-progress-bar-wrap :deep([class*='progress']) {
  width: 100%;
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
