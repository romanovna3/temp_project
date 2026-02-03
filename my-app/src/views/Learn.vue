<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { useRoute } from 'vue-router'
import { CcButton, CcChip, CcIconButton, CcIcon } from '@chesscom/design-system'
import ProgressCircle from '../components/ProgressCircle.vue'

// Design system context (WEB-DS-PACKAGE-SETUP – required for cc-avatar etc.)
provide('design-system-key', {
  routes: {
    webMemberView: (username) => `/member/${username}`,
    webAbout: '/about',
    webMembership: (params) => `/membership`,
    webMemberTitledPlayers: '/titled-players',
  },
  trans: (key) => key,
})
import { playSound } from '../lib/playSound.js'

// Base URL with trailing slash so public assets load on GitHub Pages (e.g. /temp_project/)
const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/*$/, '') + '/'

// Courses data (right panel – Courses view, Practice Filter node 1-10063)
const courses = [
  { id: 1, title: "The Master's Hand: Capablanca's Endgame Technique", instructor: 'GM Alex Colovich', lines: 120, thumbnail: 'course-cover-gotham.png' },
]

// Lines filter options (label only the value – "Show " is separate)
const linesFilterOptions = [
  { value: 'all', label: 'All' },
]
const linesFilterValue = ref('all')

// Progress under course card – derived from courseSections (Figma node 2-5697)
const progressLearned = computed(() =>
  courseSections.reduce((sum, s) => sum + s.completed, 0)
)
const progressTotal = computed(() =>
  courseSections.reduce((sum, s) => sum + s.total, 0)
)
const progressPercent = computed(() =>
  progressTotal.value > 0 ? Math.min(100, (progressLearned.value / progressTotal.value) * 100) : 0
)

// Mastery bar: level out of 8 sections (fill 3 sections = Level 3)
const masteryLevel = ref(3)
const masteryTotal = 8
const masteryPercent = computed(() =>
  masteryTotal > 0 ? Math.min(100, (masteryLevel.value / masteryTotal) * 100) : 0
)

// Panel view: in course view hide lesson action buttons (show only toolbar)
const showLessonActions = ref(true)

// Practice button badge uses practiceReadyCount (computed from sectionMoves)

// More button: show/hide additional mastery stats (8 Mastery Level items)
const showMoreStats = ref(false)
const lessButtonContainerRef = ref(null)
function expandMoreStats() {
  showMoreStats.value = true
  nextTick(() => {
    lessButtonContainerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  })
}
// AdvancedStatsExpanded: L1–L6 active with counter, L7–L8 locked with lock icon
const masteryLevelItems = [
  { level: 'L1', title: 'Rookie', counter: 120, locked: false },
  { level: 'L2', title: 'Keen Learner', counter: 100, locked: false },
  { level: 'L3', title: 'Apprentice', counter: 80, locked: false },
  { level: 'L4', title: 'Rank Riser', counter: 68, locked: false },
  { level: 'L5', title: 'Booked Up', counter: 54, locked: false },
  { level: 'L6', title: 'Expert', counter: 1, locked: false },
  { level: 'L7', title: 'Encyclopaedic', counter: null, locked: true },
  { level: 'L8', title: 'Master', counter: null, locked: true },
]

// Section expand/collapse (accordion)
const expandedSectionIds = ref(new Set())
function toggleSection(sectionId) {
  v3ReleasedUntilSectionId.value = null
  // V2.2: opening another chapter (or closing) pauses the video – play button shows again
  if (isVideoV2_2.value) {
    v22PlayingSectionId.value = null
  }
  const currentlyExpanded = expandedSectionIds.value
  if (currentlyExpanded.has(sectionId)) {
    expandedSectionIds.value = new Set()
  } else {
    expandedSectionIds.value = new Set([sectionId]) // only one chapter open at a time
  }
}
function isSectionExpanded(sectionId) {
  return expandedSectionIds.value.has(sectionId)
}

// Panel view: 'courses' (course card, sections, lines) or 'line' (single Line screen, content empty for now)
const panelView = ref('courses')
const selectedLine = ref(null) // { section, move } when in Line view
const savedCoursesScrollTop = ref(null) // restore scroll when coming back from Line view (no auto-scroll)
function openLine(section, move) {
  if (coursesContentRef.value != null) {
    savedCoursesScrollTop.value = coursesContentRef.value.scrollTop
  }
  selectedLine.value = { section, move }
  panelView.value = 'line'
}
function backToCourses() {
  const line = selectedLine.value
  if (!line) {
    panelView.value = 'courses'
    return
  }
  const { section } = line
  panelView.value = 'courses'
  if (!isVideoV3.value) {
    expandedSectionIds.value = new Set([section.id])
  }
  nextTick(() => {
    nextTick(() => {
      if (coursesContentRef.value != null && savedCoursesScrollTop.value != null) {
        coursesContentRef.value.scrollTop = savedCoursesScrollTop.value
      }
      savedCoursesScrollTop.value = null
      selectedLine.value = null
    })
  })
}

// Line view: chess move rows (Figma 32-7715). Placeholder data; replace with real line moves later.
const lineViewMoves = ref([
  { number: 1, white: 'd4', black: 'd5' },
  { number: 2, white: 'c4', black: 'e6' },
  { number: 3, white: 'Nc3', black: 'Nf6' },
  { number: 4, white: 'Bg5', black: 'Be7' },
])
const selectedPly = ref({ moveIndex: 0, side: 'white' })
function isPlySelected(moveIndex, side) {
  return selectedPly.value.moveIndex === moveIndex && selectedPly.value.side === side
}
function selectPly(moveIndex, side) {
  selectedPly.value = { moveIndex, side }
}
function selectNextPly() {
  const { moveIndex, side } = selectedPly.value
  if (side === 'white') {
    selectedPly.value = { moveIndex, side: 'black' }
  } else if (moveIndex + 1 < lineViewMoves.value.length) {
    selectedPly.value = { moveIndex: moveIndex + 1, side: 'white' }
  }
}
function selectPreviousPly() {
  const { moveIndex, side } = selectedPly.value
  if (side === 'black') {
    selectedPly.value = { moveIndex, side: 'white' }
  } else if (moveIndex > 0) {
    selectedPly.value = { moveIndex: moveIndex - 1, side: 'black' }
  }
}

/** Progress % for a section (0–100), used by the circular progress bar on each row. */
function getSectionProgressPercent(section) {
  if (!section?.total) return 0
  return Math.min(100, (section.completed / section.total) * 100)
}

// Move items (Move Item List) – shown when chapter is expanded
// 3 line types for layout/styling: completed | uncompleted | ready
function getLineType(move) {
  if (!move?.completed) return 'uncompleted'
  return move.level ? 'completed' : 'ready'
}

// Line view screen type: completed vs ready vs uncompleted (separate designs, don’t mix)
const currentLineType = computed(() => {
  if (panelView.value !== 'line' || !selectedLine.value?.move) return 'completed'
  return getLineType(selectedLine.value.move)
})

// 3 states: Uncompleted (dimmed check) | Ready (green check + animated dot) | Completed (green check + level chip e.g. L1)
const sectionMoves = {
  intro: [
    { id: '1', text: 'Introducing the Chapters', completed: true },
    { id: '2', text: 'The Discovered Attack', completed: true },
    { id: '3', text: 'The Double Check', completed: true },
  ],
  tactical: [
    { id: '1', text: '1... d5 without ...c5: 2... Bf5', completed: true },
    { id: '2', text: 'Kline vs. Capablanca #1', completed: true },
    { id: '3', text: 'Yermolinsky vs. Hodgson', completed: true },
    { id: '4', text: 'Alexey Yermolinsky vs. Julian Hodgson, L... L1', completed: true, level: 'L1' },
    { id: '5', text: 'Luke McShane vs. Vasilios Kotronias, Gib... L1', completed: true, level: 'L1' },
    { id: '6', text: 'Learning from Proteus', completed: false },
    { id: '7', text: 'McShane vs. Kotronias #1', completed: false },
  ],
}

// Pool of uncompleted move titles – shuffled per section to fill section.total (0/6 → 6 items, 0/24 → 24, etc.)
const uncompletedMoveTitles = [
  'Learning from Proteus',
  'Anand, Viswanathan vs. Sokolov, Ivan (1989)',
  'Anand, Viswanathan vs. Bacrot, Etienne (2006)',
  'Sandipan, Chanda vs. Tiviakov, Sergei (2007)',
  'Wesley vs. Kramnik (2016)',
  'Movsesian, Sergei vs. Oms Pallisse, Josep (2008)',
  'Carlsen vs. Caruana (2018)',
  'Kasparov vs. Deep Blue (1997)',
  'Fischer vs. Spassky (1972)',
  'Karpov vs. Kasparov (1985)',
  'Topalov vs. Anand (2006)',
  'Lasker vs. Capablanca (1921)',
  'Alekhine vs. Bogoljubov (1929)',
  'Tal vs. Botvinnik (1960)',
  'Smyslov vs. Botvinnik (1957)',
  'Petrosian vs. Botvinnik (1963)',
  'Spassky vs. Petrosian (1969)',
  'Kramnik vs. Kasparov (2000)',
  'Anand vs. Topalov (2010)',
  'Carlsen vs. Anand (2013)',
  'Caruana vs. Carlsen (2018)',
  'Nakamura vs. So (2016)',
  'Aronian vs. Grischuk (2012)',
  'Mamedyarov vs. Radjabov (2019)',
]

// Seeded shuffle: deterministic order per sectionId, different per section
function seededShuffle(arr, seed) {
  const a = [...arr]
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i)
  const rng = () => {
    h = Math.imul(48271, h) >>> 0
    return h / 4294967296
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getSectionMoves(section) {
  const sectionId = typeof section === 'string' ? section : section?.id
  const total = typeof section === 'object' && section?.total != null ? section.total : 0
  if (sectionMoves[sectionId]) return sectionMoves[sectionId]
  const shuffled = seededShuffle(uncompletedMoveTitles, sectionId)
  const count = Math.min(total, shuffled.length)
  return shuffled.slice(0, count).map((text, i) => ({
    id: String(i + 1),
    text,
    completed: false,
  }))
}

// Course sections (Practice Filter: accordion list with progress)
const courseSections = [
  { id: 'intro', name: 'Introduction', completed: 3, total: 3, status: 'complete' },
  { id: 'tactical', name: 'Tactical Section', completed: 5, total: 7, status: 'in_progress' },
  { id: 'additional', name: 'Additional Tactics', completed: 0, total: 6, status: 'not_started' },
  { id: 'games', name: 'The Games - Additional Tactics', completed: 0, total: 8, status: 'not_started' },
  { id: 'other', name: 'Other Lines', completed: 0, total: 12, status: 'not_started' },
  { id: 'blackmar', name: 'The Blackmar Diemer', completed: 0, total: 24, status: 'not_started' },
  { id: 'quiz', name: 'Quiz', completed: 0, total: 2, status: 'not_started' },
]

// Count of Ready item Lines (completed moves without level) for Practice button badge
const practiceReadyCount = computed(() => {
  const moves = Object.values(sectionMoves).flat()
  return moves.filter(m => m.completed && !m.level).length
})

// ExtraData (Practice Schedule & Level Progress) – placeholder; wire to real data later
const extraDataPracticeIn = ref('1 DAY')
const extraDataLevelBadge = ref('L1')
const extraDataLevelName = ref('Rookie')

// Icon names from Figma design
const icons = {
  // Header icons (20px)
  back: 'arrow-line-left',
  sound: 'media-audio-speaker-noise',
  // Board sidebar (20px)
  settings: 'utility-cogwheel',
  // Footer toolbar: ellipsis (more options)
  ellipsis: 'mark-ellipsis-horizontal',
  // Video toggle in toolbar (20px)
  videoOn: 'media-camera-video-on',
  videoOff: 'media-camera-video-off',
  // Button icons (24px)
  video: 'media-camera-video-on',
  hint: 'device-bulb-glow',
  // Toolbar icons (24px)
  analysis: 'arrows-stroke-expand-diagonal-a',
  retry: 'arrow-spin-redo',
  undo: 'arrow-spin-undo',
  prev: 'arrow-chevron-left',
  next: 'arrow-chevron-right',
}

// ============================================
// ANIMATION COLORS (dynamic based on streak)
// ============================================
// Streak color values (matching CSS variables)
const STREAK_COLORS = {
  green: '#81B64C',      // --color-green-400 / text-win (first point)
  lowest: '#E3AA24',     // --color-streak-lowest (gold, 2 correct)
  low: '#E89B3C',        // --color-streak-low (light orange, 3-4 correct)
  medium: '#E07A3C',     // --color-streak-medium (orange, 5-6 correct)
  high: '#DC4C3C',       // --color-streak-high (red, 7+ correct)
}

// Get animation color based on streak (called BEFORE streak is incremented)
const getAnimationColor = (currentStreak) => {
  // After this move, streak will be currentStreak + 1
  const newStreak = currentStreak + 1
  if (newStreak <= 1) return STREAK_COLORS.green
  if (newStreak === 2) return STREAK_COLORS.lowest
  if (newStreak <= 4) return STREAK_COLORS.low
  if (newStreak <= 6) return STREAK_COLORS.medium
  return STREAK_COLORS.high
}

// Current animation color (reactive) - starts with green
const animationColor = ref(STREAK_COLORS.green)

// Brilliant colors (fixed)
const BRILLIANT_COLORS = {
  overlay: '#26C2A3',      // Teal overlay
  coin: '#26C2A3',         // Teal coin/pill
}

// Animation colors object for CSS v-bind (used in style section)
const ANIMATION_COLORS = {
  skill: {
    textColor: '#81B64C',  // Green text on white pill
  },
  brilliant: {
    overlay: '#26C2A3',    // Teal overlay
    coin: '#26C2A3',       // Teal coin
    textColor: '#1a9a82',  // Darker teal for text
  },
  checkmate: {
    overlay: '#FA412D',    // --color-red-300 (bg-loss)
    coin: '#FA412D',
    textColor: '#E02828',  // --color-red-400 for text
  },
}

// ============================================
// LESSON DATA
// ============================================
const lesson = {
  name: 'The Goals of Chess',
  questions: [
    {
      fen: '6k1/5pp1/3b1n1p/1p6/1P1R4/6PP/5P2/6K1 w - - 0 1',
      correctMove: { from: 'd4', to: 'd6', piece: 'R' }, // Rxd6
      intro: 'Which piece can White capture?',
      wrong: "There's a better move. Try again and look for a possible capture.",
      hint: 'The black bishop is on the same file as your rook.',
      solution: 'Good choice! White captures the bishop.',
    },
    {
      fen: '6k1/6p1/7p/2Q5/8/6P1/5P1P/4r1K1 w - - 0 0',
      correctMove: { from: 'g1', to: 'g2', piece: 'K' }, // Kg2
      intro: "White's king is in check. How can you get to safety?",
      wrong: 'Illegal',
      hint: 'Move the king forward so that the black rook will no longer be able to attack it.',
      solution: 'Nice move! The king is safe there.',
    },
    {
      fen: '6k1/5pp1/3Q3p/3b4/8/6P1/5PKP/2r5 w - - 0 1',
      correctMove: { from: 'd6', to: 'd5', piece: 'Q' }, // Qxd5
      intro: "The black bishop is checking White's king. What is White's best way out of check?",
      wrong: "This move escapes the check, but it's better to capture the black bishop. How can you do that?",
      hint: "Capture the piece that's checking your king.",
      solution: 'Good choice! Capturing the bishop removes the attack on your king.',
    },
    {
      fen: '6k1/1p3pp1/p5q1/8/7R/7P/3Q1PP1/6K1 w - - 0 0',
      correctMove: { from: 'd2', to: 'd8', piece: 'Q' }, // Qd8#
      kingSquare: 'g8',  // Checkmated king's square
      intro: 'White can check with the queen or with the rook. Which one is checkmate?',
      wrong: "There's a possible checkmate, but that's not it. Look at your checks and try again.",
      hint: "Find a way to check so that the black king can't capture the piece that attacks it.",
      solution: "Nice work! That's checkmate!",
    },
    {
      fen: '3k4/R7/1R6/8/8/7P/3q2PK/8 w - - 0 1',
      correctMove: { from: 'b6', to: 'b8', piece: 'R' }, // Rb8#
      kingSquare: 'd8',  // Checkmated king's square
      intro: 'White has several checks, but only one is mate. Can you find it?',
      wrong: "There's a checkmate, but that's not it. Look at your checks and try again.",
      hint: "Look at your checks. See if you can find one that Black can't escape.",
      solution: 'Checkmate! Well done!',
    },
  ],
}

// Standard chess starting position (board by default before first puzzle)
const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

// ============================================
// GAME STATE
// ============================================
const currentQuestionIndex = ref(-1) // -1 = show starting board; 0+ = puzzle index
const questionState = ref('intro') // 'intro', 'wrong', 'hint', 'solution'
const streak = ref(0)
const selectedSquare = ref(null)
const lastMove = ref(null) // { from, to }

// Drag state
const isDragging = ref(false)
const draggedPiece = ref(null) // { type, square }
const draggedFrom = ref(null)
const dragPosition = ref({ x: 0, y: 0 })
const boardRef = ref(null)

// Animation state
const skillHighlight = ref(null)      // Square to highlight with skill animation (e.g., 'd6')
const skillHighlightLabel = ref(null) // Label text for skill highlight (e.g., 'Correct!')
const showExplosion = ref(false)      // Show the explosion circle at progress bar

// Piece movement animation state
const movingPiece = ref(null)  // { type, fromSquare, toSquare, startPos, endPos }
const brilliantHighlight = ref(null)  // Square to highlight with brilliant animation
const checkmateHighlight = ref(null)  // Square for checkmate animation (on checkmated king)
const checkmateKingColor = ref('black')  // 'black' or 'white' - color of the checkmated king icon

// Refs for animation target positioning
const progressBarRef = ref(null)      // Reference to progress bar element
const explosionTop = ref(168)         // Y position for explosion, updated dynamically

// Computed
const currentQuestion = computed(() => {
  const i = currentQuestionIndex.value
  return i >= 0 ? lesson.questions[i] : null
})
const totalChallenges = computed(() => lesson.questions.length)
const currentChallenge = computed(() => Math.max(0, currentQuestionIndex.value + 1))
// Actual progress (internal)
const actualProgress = computed(() => {
  const i = currentQuestionIndex.value
  if (i < 0) return 0
  const completed = i + (questionState.value === 'solution' ? 1 : 0)
  return (completed / totalChallenges.value) * 100
})
// Displayed progress (synced with explosion animation at 1350ms)
const displayedProgress = ref(0)
const displayedStreak = ref(0)
const lessonName = computed(() => lesson.name)

// Coach message based on state
const coachMessage = computed(() => {
  const q = currentQuestion.value
  if (!q) return 'Click Next to start the lesson.'
  switch (questionState.value) {
    case 'intro': return q.intro
    case 'wrong': return q.wrong
    case 'hint': return q.hint
    case 'solution': return q.solution
    default: return q.intro
  }
})

// Coach bubble state based on question state
const coachState = computed(() => {
  const q = currentQuestion.value
  switch (questionState.value) {
    case 'intro':
    case 'hint':
      if (!q) return 'white-to-move'
      const fen = q.fen
      const parts = fen.split(' ')
      const sideToMove = parts[1] || 'w'
      return sideToMove === 'w' ? 'white-to-move' : 'black-to-move'
    case 'wrong':
      return 'incorrect'
    case 'solution':
      return 'correct'
    default:
      return 'white-to-move'
  }
})

// Move notation for correct/incorrect states
const moveNotation = computed(() => {
  if (!lastMove.value) return ''
  const q = currentQuestion.value
  if (!q) return ''
  const correct = q.correctMove
  const piece = correct.piece || ''
  const to = questionState.value === 'wrong' ? lastMove.value.to : correct.to
  // For non-pawn pieces, prepend the piece letter
  if (piece && piece !== 'P') {
    const isCapture = questionState.value === 'solution' && q.solution.toLowerCase().includes('capture')
    return isCapture ? `${piece}x${to}` : `${piece}${to}`
  }
  return to
})

// Streak color logic
// 0-1 = green (text-win), 2 = lowest, 3-4 = low, 5-6 = medium, 7+ = high
// Streak color uses displayedStreak (synced with explosion animation)
const streakColor = computed(() => {
  const s = displayedStreak.value
  if (s <= 1) return 'var(--color-text-win, #81b64c)'
  if (s === 2) return 'var(--color-streak-lowest)'
  if (s <= 4) return 'var(--color-streak-low)'
  if (s <= 6) return 'var(--color-streak-medium)'
  return 'var(--color-streak-high)'
})

// Progress bar color (synced with explosion)
const progressBarColor = computed(() => {
  const s = displayedStreak.value
  if (s <= 1) return 'var(--color-text-win, #81b64c)'
  if (s === 2) return 'var(--color-streak-lowest)'
  if (s <= 4) return 'var(--color-streak-low)'
  if (s <= 6) return 'var(--color-streak-medium)'
  return 'var(--color-streak-high)'
})

// ============================================
// CHESS BOARD
// ============================================
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const base = import.meta.env.BASE_URL
const pieces = ref([])

// Board: default 700px, min 550px; 6px gap between board and panel
const BOARD_SIZE = 700 // pixels (default)
const SQUARE_SIZE = BOARD_SIZE / 8
const GAP_SIZE = 6 // gap between board and settings, and settings and panel

// Calculate coin fall position for a given square (as CSS values)
// Target: start of the progress bar in the sidebar
const getCoinFallPosition = (square) => {
  if (!square) return { x: '800%', y: '100%' }
  
  const fileIndex = files.indexOf(square[0])
  const rankIndex = 8 - parseInt(square[1], 10) // 0 = top row (rank 8)
  
  // Square's position on the board
  const squareLeft = fileIndex * SQUARE_SIZE
  const squareTop = rankIndex * SQUARE_SIZE
  
  // Target position: start of progress bar in sidebar
  // Board (680px) + Gap (32px) + Panel padding (24px) + small offset = ~750px from board left
  // Progress bar is roughly 240px from top of layout (header 48px + padding 24px + coach ~120px + gap 16px + label 20px)
  const targetX = BOARD_SIZE + GAP_SIZE + 40 // Start of progress bar
  const targetY = 240 // Approximate Y position of progress bar
  
  // Final position relative to square (for CSS left/top)
  const finalLeft = targetX - squareLeft
  const finalTop = targetY - squareTop
  
  // Convert to percentage of square size
  return {
    x: (finalLeft / SQUARE_SIZE) * 100,
    y: (finalTop / SQUARE_SIZE) * 100
  }
}

// Get CSS custom properties for the skill highlight square
const getSkillHighlightStyle = computed(() => {
  if (!skillHighlight.value) return {}
  const pos = getCoinFallPosition(skillHighlight.value)
  return {
    '--coin-fall-x': `${pos.x}%`,
    '--coin-fall-y': `${pos.y}%`
  }
})

// Check if square has skill highlight
const hasSkillHighlight = (square) => skillHighlight.value === square

// Check if square has brilliant highlight
const hasBrilliantHighlight = (square) => brilliantHighlight.value === square

// Check if square has checkmate highlight
const hasCheckmateHighlight = (square) => checkmateHighlight.value === square

// Computed: Checkmate king icon name (same as queen: piece-fill-king)
const checkmateKingIcon = computed(() => 'piece-fill-king')

// Computed: Checkmate icon color (matches the checkmated king's color)
// Use hex values since CcIcon doesn't interpret 'black'/'white' strings properly
const checkmateIconColor = computed(() => {
  return checkmateKingColor.value === 'black' ? '#262421' : '#ffffff'
})

// Generate all squares
const squares = computed(() => {
  const result = []
  for (let rank of ranks) {
    for (let file of files) {
      result.push(`${file}${rank}`)
    }
  }
  return result
})

// Check if square is light colored
const isLightSquare = (square) => {
  const fileIndex = files.indexOf(square[0])
  const rankIndex = parseInt(square[1], 10) - 1
  return (fileIndex + rankIndex) % 2 === 1
}

// Parse FEN to pieces array
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

// Load question position (index >= 0). For index -1 use setBoardToDefault().
const loadQuestion = (index) => {
  const q = lesson.questions[index]
  if (!q) return
  pieces.value = parseFEN(q.fen)
  questionState.value = 'intro'
  selectedSquare.value = null
  lastMove.value = null
  checkmateHighlight.value = null
}

function setBoardToDefault() {
  pieces.value = parseFEN(STARTING_FEN)
  questionState.value = 'intro'
  selectedSquare.value = null
  lastMove.value = null
  checkmateHighlight.value = null
}

// Get piece on a specific square
const getPieceOnSquare = (square) => {
  return pieces.value.find(p => p.square === square)
}

// Get piece image path from Chess.com CDN
const getPieceImage = (piece) => {
  return `https://www.chess.com/chess-themes/pieces/neo/300/${piece.type}.png`
}

// Check if square is selected
const isSelected = (square) => selectedSquare.value === square

// Check if square is part of last move (for correct moves)
const isLastMove = (square) => {
  if (!lastMove.value) return false
  if (questionState.value === 'wrong') return false // Don't show yellow for wrong moves
  return lastMove.value.from === square || lastMove.value.to === square
}

// Check if square is part of a wrong move (for red highlight)
const isWrongMove = (square) => {
  if (!lastMove.value) return false
  if (questionState.value !== 'wrong') return false
  return lastMove.value.from === square || lastMove.value.to === square
}

// ============================================
// MOVE HANDLING
// ============================================
const handleSquareClick = (square) => {
  if (questionState.value === 'solution' && currentQuestionIndex.value >= 0) return

  const piece = getPieceOnSquare(square)

  // If no piece selected yet
  if (!selectedSquare.value) {
    if (piece && piece.type.startsWith('w')) {
      selectedSquare.value = square
    }
    return
  }

  // If clicking same square, deselect
  if (selectedSquare.value === square) {
    selectedSquare.value = null
    return
  }

  // If clicking another white piece, select that instead
  if (piece && piece.type.startsWith('w')) {
    selectedSquare.value = square
    return
  }

  // Attempt move
  const from = selectedSquare.value
  const to = square
  const movingPiece = getPieceOnSquare(from)

  if (!movingPiece) {
    selectedSquare.value = null
    return
  }

  // Default board (index -1): free play – any legal move executes
  if (currentQuestionIndex.value < 0) {
    if (!isLegalMove(from, to)) {
      selectedSquare.value = null
      return
    }
    const isCapture = getPieceOnSquare(to) !== undefined
    makeMove(from, to)
    lastMove.value = { from, to }
    playSound(isCapture ? 'capture' : 'move')
    selectedSquare.value = null
    return
  }

  // Puzzle mode: check correct move
  const correct = currentQuestion.value.correctMove
  if (from === correct.from && to === correct.to) {
    makeMove(from, to)
    streak.value++
    questionState.value = 'solution'
    lastMove.value = { from, to }
  } else {
    streak.value = 0
    questionState.value = 'wrong'
  }

  selectedSquare.value = null
}

// Convert square notation to coordinates
const squareToCoords = (square) => {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0) // 0-7 for a-h
  const rank = parseInt(square[1]) - 1 // 0-7 for 1-8
  return { file, rank }
}

// Check if path is clear between two squares (for sliding pieces)
const isPathClear = (fromFile, fromRank, toFile, toRank) => {
  const dFile = Math.sign(toFile - fromFile)
  const dRank = Math.sign(toRank - fromRank)
  
  let file = fromFile + dFile
  let rank = fromRank + dRank
  
  while (file !== toFile || rank !== toRank) {
    const square = String.fromCharCode('a'.charCodeAt(0) + file) + (rank + 1)
    if (getPieceOnSquare(square)) return false
    file += dFile
    rank += dRank
  }
  
  return true
}

// Check if a move is legal according to chess rules
const isLegalMove = (from, to) => {
  const piece = getPieceOnSquare(from)
  if (!piece) return false
  
  const fromCoords = squareToCoords(from)
  const toCoords = squareToCoords(to)
  const dFile = toCoords.file - fromCoords.file
  const dRank = toCoords.rank - fromCoords.rank
  const absDFile = Math.abs(dFile)
  const absDRank = Math.abs(dRank)
  
  // Can't capture your own piece
  const targetPiece = getPieceOnSquare(to)
  if (targetPiece) {
    const isWhite = piece.type.startsWith('w')
    const targetIsWhite = targetPiece.type.startsWith('w')
    if (isWhite === targetIsWhite) return false
  }
  
  // Get piece type (second character: k, q, r, b, n, p)
  const pieceType = piece.type[1]
  const isWhite = piece.type.startsWith('w')
  
  switch (pieceType) {
    case 'p': { // Pawn
      const direction = isWhite ? 1 : -1
      const startRank = isWhite ? 1 : 6
      
      // Normal move forward (no capture)
      if (dFile === 0 && dRank === direction && !targetPiece) {
        return true
      }
      // Double move from starting position
      if (dFile === 0 && dRank === 2 * direction && fromCoords.rank === startRank && !targetPiece) {
        // Check path is clear
        const midSquare = String.fromCharCode('a'.charCodeAt(0) + fromCoords.file) + (fromCoords.rank + direction + 1)
        if (!getPieceOnSquare(midSquare)) return true
      }
      // Capture diagonally
      if (absDFile === 1 && dRank === direction && targetPiece) {
        return true
      }
      return false
    }
    case 'n': // Knight
      return (absDFile === 2 && absDRank === 1) || (absDFile === 1 && absDRank === 2)
    
    case 'b': // Bishop
      if (absDFile !== absDRank) return false
      return isPathClear(fromCoords.file, fromCoords.rank, toCoords.file, toCoords.rank)
    
    case 'r': // Rook
      if (dFile !== 0 && dRank !== 0) return false
      return isPathClear(fromCoords.file, fromCoords.rank, toCoords.file, toCoords.rank)
    
    case 'q': // Queen
      if (dFile !== 0 && dRank !== 0 && absDFile !== absDRank) return false
      return isPathClear(fromCoords.file, fromCoords.rank, toCoords.file, toCoords.rank)
    
    case 'k': // King
      // Normal king move
      if (absDFile <= 1 && absDRank <= 1) return true
      // Castling (simplified - just check distance)
      if (absDFile === 2 && dRank === 0) return true
      return false
    
    default:
      return false
  }
}

// Execute a move on the board
const makeMove = (from, to) => {
  // Remove any piece on target square (capture)
  pieces.value = pieces.value.filter(p => p.square !== to)
  // Move the piece
  const piece = pieces.value.find(p => p.square === from)
  if (piece) {
    piece.square = to
  }
}

// Trigger a single skill animation on a square
// color: the color to use for the animation
// label: the text to show (e.g., "Correct!", "Streak 1")
// onExplosion: callback when explosion happens (for progress bar/streak updates)
// onComplete: callback when animation finishes
const triggerSingleAnimation = (square, color, label, onExplosion = null, onComplete = null) => {
  // Note: checkmateHighlight is NOT cleared here - checkmate coin stays visible
  
  animationColor.value = color
  skillHighlight.value = square
  skillHighlightLabel.value = label
  
  // Calculate explosion position based on progress bar
  if (progressBarRef.value) {
    const barRect = progressBarRef.value.getBoundingClientRect()
    const panelContent = progressBarRef.value.closest('.panel-content')
    if (panelContent) {
      const panelRect = panelContent.getBoundingClientRect()
      explosionTop.value = (barRect.top + barRect.height / 2) - panelRect.top
    }
  }
  
  // After 800ms (morph) + 50ms pause + 500ms (fall), show explosion
  setTimeout(() => {
    showExplosion.value = true
    if (onExplosion) onExplosion()
    
    // Clear explosion after 500ms
    setTimeout(() => {
      showExplosion.value = false
    }, 500)
  }, 1350)
  
  // Clear highlight after total animation duration
  setTimeout(() => {
    skillHighlight.value = null
    skillHighlightLabel.value = null
    // Use nextTick to ensure DOM updates before starting next animation
    // This allows v-if to remove the element before re-adding it
    if (onComplete) {
      nextTick(() => {
        onComplete()
      })
    }
  }, 1850)
}

// Trigger the full correct move animation sequence:
// 1. "Correct!" animation (always green) - grows progress bar
// 2. "Streak X" animation (streak-colored) - updates streak counter/color
const triggerCorrectMoveAnimations = (square, streakNumber) => {
  const greenColor = STREAK_COLORS.green // Always green for "Correct!"
  const streakColor = getAnimationColor(streakNumber - 1) // Color for this streak level
  
  // Animation 1: "Correct!" (green)
  triggerSingleAnimation(
    square,
    greenColor,
    'Correct!',
    () => {
      // On explosion: grow the progress bar
      displayedProgress.value = actualProgress.value
    },
    () => {
      // On complete: start the streak animation
      triggerSingleAnimation(
        square,
        streakColor,
        `Streak ${streakNumber}`,
        () => {
          // On explosion: update streak counter and color
          displayedStreak.value = streak.value
        },
        null
      )
    }
  )
}

// Legacy function for backwards compatibility (used by solution button, etc.)
const triggerSkillAnimation = (square, label = 'Correct!', setColor = true) => {
  const color = setColor ? getAnimationColor(streak.value) : animationColor.value
  triggerSingleAnimation(
    square,
    color,
    label,
    () => {
      displayedProgress.value = actualProgress.value
      displayedStreak.value = streak.value
    },
    null
  )
}

// Trigger brilliant highlight animation on a square
const triggerBrilliantAnimation = (square) => {
  brilliantHighlight.value = square
  
  // Clear after 800ms (no falling, stays on board briefly)
  setTimeout(() => {
    brilliantHighlight.value = null
  }, 1200)
}

// Trigger checkmate animation on the checkmated king's square
// The coin stays in place until replaced by the next animation
const triggerCheckmateAnimation = (kingSquare, isBlackKing, onComplete) => {
  checkmateHighlight.value = kingSquare
  checkmateKingColor.value = isBlackKing ? 'black' : 'white'

  // After animation completes (800ms), call onComplete for next animations
  // Don't clear checkmateHighlight here - it gets cleared when next animation starts
  setTimeout(() => {
    if (onComplete) nextTick(() => onComplete())
  }, 800)
}

// Try to make a move (used by both click and drag)
const tryMove = (from, to) => {
  if (questionState.value === 'solution' && currentQuestionIndex.value >= 0) return false

  const movingPiece = getPieceOnSquare(from)
  if (!movingPiece || !movingPiece.type.startsWith('w')) return false

  if (!isLegalMove(from, to)) {
    return false
  }

  // Default board (index -1): free play – execute any legal move
  if (currentQuestionIndex.value < 0) {
    const isCapture = getPieceOnSquare(to) !== undefined
    makeMove(from, to)
    lastMove.value = { from, to }
    playSound(isCapture ? 'capture' : 'move')
    return true
  }

  // Puzzle mode: check correct move
  const correct = currentQuestion.value.correctMove
  if (from === correct.from && to === correct.to) {
    // Check if it's a capture (piece on target square)
    const isCapture = getPieceOnSquare(to) !== undefined
    // Check if it's checkmate (has kingSquare field in lesson data)
    const isCheckmate = currentQuestion.value.kingSquare != null
    const kingSquare = currentQuestion.value.kingSquare
    
    // Correct move!
    makeMove(from, to)
    streak.value++
    questionState.value = 'solution'
    lastMove.value = { from, to }
    
    // Play appropriate sound
    if (isCheckmate) {
      playSound('check')
    } else if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    // Trigger animations based on whether it's a checkmate
    if (isCheckmate) {
      // Determine king color based on side to move (FEN has 'w' = white to move, so black king is checkmated)
      const isBlackKing = currentQuestion.value.fen.includes(' w ')

      // Trigger checkmate animation first, then regular animations
      triggerCheckmateAnimation(kingSquare, isBlackKing, () => {
        triggerCorrectMoveAnimations(to, streak.value)
      })
    } else {
      // Regular two-animation sequence (Correct! then Streak X)
      triggerCorrectMoveAnimations(to, streak.value)
    }
    
    return true
  } else {
    // Wrong move - still execute the move visually
    const isCapture = getPieceOnSquare(to) !== undefined
    makeMove(from, to)
    lastMove.value = { from, to }
    
    // Play move sound
    if (isCapture) {
      playSound('capture')
    } else {
      playSound('move')
    }
    
    // Reset streak and set wrong state
    streak.value = 0
    questionState.value = 'wrong'
    return false
  }
}

// ============================================
// DRAG & DROP
// ============================================
const handleDragStart = (event, square) => {
  if (questionState.value === 'solution' && currentQuestionIndex.value >= 0) return

  const piece = getPieceOnSquare(square)
  if (!piece || !piece.type.startsWith('w')) return
  
  // Prevent default drag behavior
  event.preventDefault()
  
  isDragging.value = true
  draggedPiece.value = piece
  draggedFrom.value = square
  selectedSquare.value = square
  
  // Get initial position
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  dragPosition.value = { x: clientX, y: clientY }
}

const handleDragMove = (event) => {
  if (!isDragging.value) return
  
  event.preventDefault()
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const clientY = event.touches ? event.touches[0].clientY : event.clientY
  dragPosition.value = { x: clientX, y: clientY }
}

const handleDragEnd = (event) => {
  if (!isDragging.value) return
  
  const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX
  const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY
  
  // Find which square we dropped on
  const targetSquare = getSquareFromPosition(clientX, clientY)
  
  if (targetSquare && targetSquare !== draggedFrom.value) {
    tryMove(draggedFrom.value, targetSquare)
  }
  
  // Reset drag state
  isDragging.value = false
  draggedPiece.value = null
  draggedFrom.value = null
  selectedSquare.value = null
}

const getSquareFromPosition = (x, y) => {
  if (!boardRef.value) return null
  
  const rect = boardRef.value.getBoundingClientRect()
  const squareSize = rect.width / 8
  
  const col = Math.floor((x - rect.left) / squareSize)
  const row = Math.floor((y - rect.top) / squareSize)
  
  if (col < 0 || col > 7 || row < 0 || row > 7) return null
  
  const file = files[col]
  const rank = 8 - row
  return `${file}${rank}`
}

// Check if piece is being dragged (to hide it from original square)
const isPieceDragged = (square) => {
  return isDragging.value && draggedFrom.value === square
}

// ============================================
// ACTIONS
// ============================================
const handleHint = () => {
  if (!currentQuestion.value) return
  if (questionState.value === 'solution') return
  streak.value = 0 // Reset streak on hint
  questionState.value = 'hint'
}

const showSolution = () => {
  const q = currentQuestion.value
  if (!q) return
  const correct = q.correctMove
  makeMove(correct.from, correct.to)
  questionState.value = 'solution'
  lastMove.value = { from: correct.from, to: correct.to }
  playSound('move')
  // Update progress immediately (no animation)
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
}

const handleRetry = () => {
  loadQuestion(currentQuestionIndex.value)
  displayedProgress.value = actualProgress.value
  displayedStreak.value = streak.value
}

// V2: video visible by default, one per chapter, not sticky
const route = useRoute()
const isVideoV2 = computed(() => route.path === '/learn/v2')
// V2.2: same as V2 but play button toggles to pause and makes that video sticky
const isVideoV2_2 = computed(() => route.path === '/learn/v2.2')
const v22PlayingSectionId = ref(null) // when set, this section's video shows pause and is sticky
const isVideoV3 = computed(() => route.path === '/learn/v3')
const expandedSection = computed(() => {
  const id = [...expandedSectionIds.value][0]
  return id ? (courseSections.find((s) => s.id === id) ?? null) : null
})

// V3: scroll-driven sticky – which section's block has reached the header
const panelHeaderRef = ref(null)
const sectionBlockRefs = ref(Object.create(null))
const stickySection = ref(null)
const v3StickyStripRef = ref(null)
const v3StickyVideoRef = ref(null)
const v3StickyWasVisible = ref(false)
// When set: hide sticky bar until this section reaches the header (smooth handoff)
const v3ReleasedUntilSectionId = ref(null)
// Strip height used as tolerance so after scroll compensation the section is still "at header"
const v3LastStripHeight = ref(0)
// Last computed max scroll (for wheel/touch handler to block scroll into padding)
const v3MaxScrollTop = ref(Infinity)
// When true: last chapter content is shorter than viewport – lock scroll as soon as last chapter is at header
const v3LastChapterShort = ref(false)
// When last chapter is short: set padding so max scroll = last chapter at top (no room to scroll past)
const v3PaddingBottomPx = ref(null)
// Show floating "scroll up" button when user has scrolled down (e.g. past ~3 chapters); hides after idle, reappears on any scroll
const v3ShowScrollUp = ref(false)
/** Fallback when there are < 3 chapters or 3rd block ref not ready */
const V3_SCROLL_UP_THRESHOLD_FALLBACK = 400
/** Seconds after scroll stops before the button auto-hides (user didn't click it) */
const V3_SCROLL_UP_IDLE_HIDE_MS = 2500
let v3TouchStartY = 0
let v3ScrollUpHideTimer = null

function clearV3ScrollUpHideTimer() {
  if (v3ScrollUpHideTimer != null) {
    clearTimeout(v3ScrollUpHideTimer)
    v3ScrollUpHideTimer = null
  }
}

function scheduleV3ScrollUpHide() {
  clearV3ScrollUpHideTimer()
  v3ScrollUpHideTimer = setTimeout(() => {
    v3ScrollUpHideTimer = null
    v3ShowScrollUp.value = false
  }, V3_SCROLL_UP_IDLE_HIDE_MS)
}

/** Scroll position at which the 3rd chapter "opens" (its block top reaches container top). Uses 3rd section block height if available. */
function getV3ScrollUpThreshold() {
  const el = coursesContentRef.value
  if (!el) return V3_SCROLL_UP_THRESHOLD_FALLBACK
  const sections = courseSections
  if (sections.length < 3) return V3_SCROLL_UP_THRESHOLD_FALLBACK
  const thirdSection = sections[2]
  const thirdBlock = sectionBlockRefs.value[thirdSection.id]
  if (!thirdBlock) return V3_SCROLL_UP_THRESHOLD_FALLBACK
  const containerRect = el.getBoundingClientRect()
  const blockRect = thirdBlock.getBoundingClientRect()
  const threshold = el.scrollTop + (blockRect.top - containerRect.top)
  return Math.max(0, threshold)
}

function setSectionBlockRef(sectionId, el) {
  // Vue 3 in v-for can pass an array when ref is collected
  const node = Array.isArray(el) ? el[0] : el
  if (node) {
    sectionBlockRefs.value[sectionId] = node
  } else {
    delete sectionBlockRefs.value[sectionId]
  }
}

/**
 * V3 sticky flow (one sticky bar, chapters in order as you scroll):
 * 1. "Current" = section whose block (row+video) has reached the header (top <= container top); pick the one with max top.
 * 2. Show sticky bar only when: current is set AND (not in "released" mode OR current is the section we're waiting for).
 * 3. Release: when the *next* chapter in list order touches the sticky video bottom → hide bar, set "released until" = that next section.
 * 4. Re-stick: when that next section's block reaches the header → show bar again, clear "released until".
 * 5. Same rule for every chapter; no accordion (all chapters always visible).
 */
function updateStickySection() {
  // V3 uses one sticky block (first chapter + video) in the flow – no separate strip or JS-driven stick
  if (isVideoV3.value) {
    stickySection.value = null
    return
  }
  if (!coursesContentRef.value) {
    stickySection.value = null
    v3StickyWasVisible.value = false
    v3ReleasedUntilSectionId.value = null
    return
  }
  const scrollEl = coursesContentRef.value
  if (scrollEl.scrollTop <= 0) {
    stickySection.value = null
    v3StickyWasVisible.value = false
    v3ReleasedUntilSectionId.value = null
    return
  }
  const containerRect = scrollEl.getBoundingClientRect()
  const headerThreshold = containerRect.top
  const releasedUntil = v3ReleasedUntilSectionId.value

  // Use tolerance = last known strip height so after we add scroll compensation the section is still "at header"
  const stripEl = v3StickyStripRef.value
  if (stripEl) {
    v3LastStripHeight.value = stripEl.getBoundingClientRect().height
  }
  const threshold = headerThreshold + (v3LastStripHeight.value || 0)

  // 1. Which section has reached the header – single "current", topmost at or past header.
  //    When in released state, only consider sections up to and including releasedUntil so we never skip order.
  const releasedUntilIndex = releasedUntil != null
    ? courseSections.findIndex((s) => s.id === releasedUntil)
    : -1
  const sectionsToConsider = releasedUntilIndex >= 0
    ? courseSections.slice(0, releasedUntilIndex + 1)
    : courseSections

  let best = null
  let bestTop = -Infinity
  for (const section of sectionsToConsider) {
    const el = sectionBlockRefs.value[section.id]
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= threshold && top > bestTop) {
      bestTop = top
      best = section
    }
  }
  stickySection.value = best

  const stickyVisible = !!(best && (!releasedUntil || best.id === releasedUntil))

  // 2. Release: only when not in "released" mode; *next* chapter (in list order) touches video → hide bar until it reaches header
  if (best && !releasedUntil) {
    const stickyStripEl = v3StickyStripRef.value
    const stickyVideoEl = v3StickyVideoRef.value
    const videoBottom = stickyVideoEl ? stickyVideoEl.getBoundingClientRect().bottom : (stickyStripEl ? stickyStripEl.getBoundingClientRect().bottom : null)
    if (videoBottom != null) {
      const currentIndex = courseSections.findIndex((s) => s.id === best.id)
      const nextSection = currentIndex >= 0 && currentIndex < courseSections.length - 1 ? courseSections[currentIndex + 1] : null
      if (nextSection) {
        const nextEl = sectionBlockRefs.value[nextSection.id]
        if (nextEl) {
          const nextTop = nextEl.getBoundingClientRect().top
          if (nextTop <= videoBottom) {
            const stripHeight = stickyStripEl.getBoundingClientRect().height
            v3ReleasedUntilSectionId.value = nextSection.id
            nextTick(() => {
              scrollEl.scrollTop = Math.max(0, scrollEl.scrollTop - stripHeight)
            })
          }
        }
      }
    }
  }

  // 3. Clear "released until" when that section has reached the header and we're showing the bar
  if (stickyVisible && best?.id === releasedUntil) {
    v3ReleasedUntilSectionId.value = null
  }

  if (stickyVisible && !v3StickyWasVisible.value) {
    nextTick(() => {
      requestAnimationFrame(() => {
        const stripEl = v3StickyStripRef.value
        if (stripEl && scrollEl) {
          const h = stripEl.getBoundingClientRect().height
          scrollEl.scrollTop += h
        }
      })
    })
  }
  v3StickyWasVisible.value = stickyVisible
}

/** V3: video placeholder bg – #000 for even chapter index, dark grey for odd */
function getStickyVideoBg(section) {
  if (!section) return '#000000'
  const i = courseSections.findIndex((s) => s.id === section.id)
  return i >= 0 && i % 2 === 1 ? '#2a2a2a' : '#000000'
}

let v3ScrollCleanup = null
let v3ScrollRaf = null
let v3IntersectionObserver = null

/** V3 (last chapter only): stop scroll when (1) last chapter block is at header, or (2) bottom of last chapter (block + lines) is at viewport bottom. When last chapter is short, set padding so there is no room to scroll past. */
function clampV3Scroll() {
  if (!isVideoV3.value || !coursesContentRef.value) {
    v3PaddingBottomPx.value = null
    return
  }
  const el = coursesContentRef.value
  const lastSection = courseSections[courseSections.length - 1]
  if (!lastSection) {
    v3PaddingBottomPx.value = null
    return
  }
  const lastBlock = sectionBlockRefs.value[lastSection.id]
  if (!lastBlock) {
    v3PaddingBottomPx.value = null
    return
  }
  const lastBlockRect = lastBlock.getBoundingClientRect()
  const scrollElRect = el.getBoundingClientRect()
  const maxWhenBlockAtTop = el.scrollTop + (lastBlockRect.top - scrollElRect.top)
  const lastSectionItem = lastBlock.parentElement
  const bottomLimit = lastSectionItem
    ? el.scrollTop + (lastSectionItem.getBoundingClientRect().bottom - scrollElRect.bottom)
    : maxWhenBlockAtTop
  const lastChapterHeight = lastSectionItem ? lastSectionItem.getBoundingClientRect().height : 0
  const contentShorterThanViewport = lastChapterHeight > 0 && lastChapterHeight <= scrollElRect.height
  v3LastChapterShort.value = contentShorterThanViewport

  if (contentShorterThanViewport) {
    const currentPadding = parseFloat(getComputedStyle(el).paddingBottom) || 0
    const contentHeight = el.scrollHeight - currentPadding
    const newPaddingPx = Math.max(0, Math.round(maxWhenBlockAtTop + el.clientHeight - contentHeight))
    v3PaddingBottomPx.value = Number.isFinite(newPaddingPx) ? newPaddingPx : null
  } else {
    v3PaddingBottomPx.value = null
  }

  const maxScrollTop = Math.max(
    0,
    contentShorterThanViewport ? maxWhenBlockAtTop : Math.max(maxWhenBlockAtTop, bottomLimit)
  )
  v3MaxScrollTop.value = maxScrollTop
  if (el.scrollTop > maxScrollTop) {
    el.scrollTop = maxScrollTop
  }
}

function onV3Wheel(e) {
  if (!isVideoV3.value || !coursesContentRef.value || !v3LastChapterShort.value) return
  const el = coursesContentRef.value
  clampV3Scroll()
  if (e.deltaY > 0 && el.scrollTop >= v3MaxScrollTop.value) {
    e.preventDefault()
  }
}

function onV3TouchStart(e) {
  if (!coursesContentRef.value || !e.touches.length) return
  v3TouchStartY = e.touches[0].clientY
}

function onV3TouchMove(e) {
  if (!isVideoV3.value || !coursesContentRef.value || !v3LastChapterShort.value || !e.touches.length) return
  const el = coursesContentRef.value
  clampV3Scroll()
  const currentY = e.touches[0].clientY
  if (el.scrollTop >= v3MaxScrollTop.value && currentY < v3TouchStartY) {
    e.preventDefault()
    el.scrollTop = v3MaxScrollTop.value
  }
  v3TouchStartY = currentY
}

function onV3Scroll() {
  const el = coursesContentRef.value
  if (el) {
    const showThreshold = getV3ScrollUpThreshold()
    if (el.scrollTop >= showThreshold) {
      v3ShowScrollUp.value = true
      scheduleV3ScrollUpHide()
    } else {
      v3ShowScrollUp.value = false
      clearV3ScrollUpHideTimer()
    }
  }
  clampV3Scroll()
  if (v3ScrollRaf) return
  v3ScrollRaf = requestAnimationFrame(() => {
    v3ScrollRaf = null
    updateStickySection()
  })
}

function scrollV3ToTop() {
  const el = coursesContentRef.value
  if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Forward wheel/touch scroll from the scroll-up button to the courses content so scrolling works when hovering the icon */
function onV3ScrollUpBtnWheel(e) {
  const el = coursesContentRef.value
  if (!el) return
  el.scrollTop += e.deltaY
  el.scrollTop = Math.max(0, Math.min(el.scrollTop, el.scrollHeight - el.clientHeight))
  e.preventDefault()
}
let v3ScrollUpTouchStartY = 0
function onV3ScrollUpBtnTouchStart(e) {
  if (e.touches.length) v3ScrollUpTouchStartY = e.touches[0].clientY
}
function onV3ScrollUpBtnTouchMove(e) {
  if (!e.touches.length) return
  const el = coursesContentRef.value
  if (!el) return
  const y = e.touches[0].clientY
  const delta = v3ScrollUpTouchStartY - y
  v3ScrollUpTouchStartY = y
  el.scrollTop += delta
  el.scrollTop = Math.max(0, Math.min(el.scrollTop, el.scrollHeight - el.clientHeight))
  e.preventDefault()
}

function setupV3IntersectionObserver() {
  v3IntersectionObserver?.disconnect()
  v3IntersectionObserver = null
  if (!isVideoV3.value || !coursesContentRef.value) return
  const root = coursesContentRef.value
  const sectionIds = courseSections.map((s) => s.id)
  const elements = sectionIds.map((id) => sectionBlockRefs.value[id]).filter(Boolean)
  if (elements.length === 0) {
    // Refs may not be set yet (v-for); retry once when still on V3
    if (isVideoV3.value && coursesContentRef.value) {
      setTimeout(setupV3IntersectionObserver, 80)
    }
    return
  }
  v3IntersectionObserver = new IntersectionObserver(
    () => {
      requestAnimationFrame(updateStickySection)
    },
    { root, rootMargin: '0px', threshold: [0, 0.01, 1] }
  )
  elements.forEach((el) => v3IntersectionObserver.observe(el))
  requestAnimationFrame(updateStickySection)
}

// Video section: show in panel when Video button clicked (V1); in V2 always visible per chapter
const showVideoSection = ref(false)
const videoSectionRef = ref(null)
const coursesContentRef = ref(null)
const videoSectionHeightPx = ref(270) // for sticky chapter; updated when video visible or size changes

const VIDEO_ASPECT = 16 / 9

// Three formats only: large (default), small, none (collapsed under course card)
const VIDEO_FORMATS = Object.freeze({
  large: { height: 220, width: null }, // width from container aspect
  small: { height: 112, width: 198 },
  none: { height: 0, width: 0 }
})
const videoFormat = ref('large')

const VIDEO_LARGE_H = 220
const VIDEO_SMALL_H = 112
const isResizingVideo = ref(false)
const videoDragPreviewHeight = ref(null)

const videoFrameHeight = computed(() => {
  if (isResizingVideo.value && videoDragPreviewHeight.value != null) {
    return videoDragPreviewHeight.value
  }
  return VIDEO_FORMATS[videoFormat.value].height
})
const videoFrameWidth = computed(() => {
  const h = videoFrameHeight.value
  const rawW = videoSectionRef.value?.clientWidth
  const w = (rawW && rawW > 0) ? rawW : 460
  if (isResizingVideo.value && videoDragPreviewHeight.value != null) {
    if (h <= 0) return 0
    if (h < VIDEO_SMALL_H) return Math.round(198 * (h / VIDEO_SMALL_H))
    if (h < VIDEO_LARGE_H) return Math.round(198 + (w - 198) * ((h - VIDEO_SMALL_H) / (VIDEO_LARGE_H - VIDEO_SMALL_H)))
    return w
  }
  const fmt = VIDEO_FORMATS[videoFormat.value]
  if (fmt.width !== null) return fmt.width
  return w
})

let resizeStartY = 0
let resizeStartHeight = 0
let resizeLastY = 0
let videoResizeUpHandler = null
const FORMAT_ORDER = ['large', 'small']
const SNAP_HEIGHTS = [VIDEO_LARGE_H, VIDEO_SMALL_H]

function snapHeightToFormat(h) {
  const i = SNAP_HEIGHTS.reduce((best, snap, i) =>
    Math.abs(snap - h) < Math.abs(SNAP_HEIGHTS[best] - h) ? i : best
  , 0)
  return FORMAT_ORDER[i]
}

function startVideoResize(e) {
  if (!showVideoSection.value) return
  isResizingVideo.value = true
  resizeStartY = e.clientY
  resizeLastY = e.clientY
  resizeStartHeight = VIDEO_FORMATS[videoFormat.value].height
  videoDragPreviewHeight.value = resizeStartHeight
  document.addEventListener('mousemove', onVideoResizeMove)
  videoResizeUpHandler = (ev) => stopVideoResize(ev)
  document.addEventListener('mouseup', videoResizeUpHandler)
  document.body.style.userSelect = 'none'
}

function onVideoResizeMove(e) {
  if (!isResizingVideo.value) return
  resizeLastY = e.clientY
  const deltaY = e.clientY - resizeStartY
  const next = Math.round(resizeStartHeight + deltaY)
  videoDragPreviewHeight.value = Math.min(VIDEO_LARGE_H, Math.max(VIDEO_SMALL_H, next))
  updateVideoSectionHeightPx()
}

function stopVideoResize(e) {
  const wasResizing = isResizingVideo.value
  const finalPreviewH = videoDragPreviewHeight.value
  isResizingVideo.value = false
  document.removeEventListener('mousemove', onVideoResizeMove)
  if (videoResizeUpHandler) {
    document.removeEventListener('mouseup', videoResizeUpHandler)
    videoResizeUpHandler = null
  }
  document.body.style.userSelect = ''
  if (wasResizing && finalPreviewH != null) {
    const endY = e && e.clientY != null ? e.clientY : resizeLastY
    const deltaY = endY - resizeStartY
    if (deltaY < 0) {
      const i = FORMAT_ORDER.indexOf(videoFormat.value)
      videoFormat.value = FORMAT_ORDER[Math.min(i + 1, FORMAT_ORDER.length - 1)]
    } else if (deltaY > 0) {
      const i = FORMAT_ORDER.indexOf(videoFormat.value)
      videoFormat.value = FORMAT_ORDER[Math.max(i - 1, 0)]
    } else {
      videoFormat.value = snapHeightToFormat(finalPreviewH)
    }
    videoDragPreviewHeight.value = null
  }
  nextTick(updateVideoSectionHeightPx)
}

function updateVideoSectionHeightPx() {
  if (showVideoSection.value && videoSectionRef.value) {
    videoSectionHeightPx.value = videoSectionRef.value.offsetHeight
  }
}

// Line view: video with resize, default small; same footer toggle (showVideoSection)
const lineViewVideoFormat = ref('large')
const lineViewVideoSectionRef = ref(null)
const lineViewIsResizingVideo = ref(false)
const lineViewVideoDragPreviewHeight = ref(null)
let lineViewResizeStartY = 0
let lineViewResizeStartHeight = 0
let lineViewResizeLastY = 0
let lineViewVideoResizeUpHandler = null

const lineViewVideoFrameHeight = computed(() => {
  if (lineViewIsResizingVideo.value && lineViewVideoDragPreviewHeight.value != null) {
    return lineViewVideoDragPreviewHeight.value
  }
  return VIDEO_FORMATS[lineViewVideoFormat.value].height
})
const lineViewVideoFrameWidth = computed(() => {
  const h = lineViewVideoFrameHeight.value
  const rawW = lineViewVideoSectionRef.value?.clientWidth
  const w = (rawW && rawW > 0) ? rawW : 460
  if (lineViewIsResizingVideo.value && lineViewVideoDragPreviewHeight.value != null) {
    if (h <= 0) return 0
    if (h < VIDEO_SMALL_H) return Math.round(198 * (h / VIDEO_SMALL_H))
    if (h < VIDEO_LARGE_H) return Math.round(198 + (w - 198) * ((h - VIDEO_SMALL_H) / (VIDEO_LARGE_H - VIDEO_SMALL_H)))
    return w
  }
  const fmt = VIDEO_FORMATS[lineViewVideoFormat.value]
  if (fmt.width !== null) return fmt.width
  return w
})

function startLineViewVideoResize(e) {
  if (!showVideoSection.value) return
  lineViewIsResizingVideo.value = true
  lineViewResizeStartY = e.clientY
  lineViewResizeLastY = e.clientY
  lineViewResizeStartHeight = VIDEO_FORMATS[lineViewVideoFormat.value].height
  lineViewVideoDragPreviewHeight.value = lineViewResizeStartHeight
  document.addEventListener('mousemove', onLineViewVideoResizeMove)
  lineViewVideoResizeUpHandler = (ev) => stopLineViewVideoResize(ev)
  document.addEventListener('mouseup', lineViewVideoResizeUpHandler)
  document.body.style.userSelect = 'none'
}

function onLineViewVideoResizeMove(e) {
  if (!lineViewIsResizingVideo.value) return
  lineViewResizeLastY = e.clientY
  const deltaY = e.clientY - lineViewResizeStartY
  const next = Math.round(lineViewResizeStartHeight + deltaY)
  lineViewVideoDragPreviewHeight.value = Math.min(VIDEO_LARGE_H, Math.max(VIDEO_SMALL_H, next))
}

function stopLineViewVideoResize(e) {
  const wasResizing = lineViewIsResizingVideo.value
  const finalPreviewH = lineViewVideoDragPreviewHeight.value
  lineViewIsResizingVideo.value = false
  document.removeEventListener('mousemove', onLineViewVideoResizeMove)
  if (lineViewVideoResizeUpHandler) {
    document.removeEventListener('mouseup', lineViewVideoResizeUpHandler)
    lineViewVideoResizeUpHandler = null
  }
  document.body.style.userSelect = ''
  if (wasResizing && finalPreviewH != null) {
    const endY = e && e.clientY != null ? e.clientY : lineViewResizeLastY
    const deltaY = endY - lineViewResizeStartY
    if (deltaY < 0) {
      const i = FORMAT_ORDER.indexOf(lineViewVideoFormat.value)
      lineViewVideoFormat.value = FORMAT_ORDER[Math.min(i + 1, FORMAT_ORDER.length - 1)]
    } else if (deltaY > 0) {
      const i = FORMAT_ORDER.indexOf(lineViewVideoFormat.value)
      lineViewVideoFormat.value = FORMAT_ORDER[Math.max(i - 1, 0)]
    } else {
      lineViewVideoFormat.value = snapHeightToFormat(finalPreviewH)
    }
    lineViewVideoDragPreviewHeight.value = null
  }
}

// ResizeObserver: keep sticky chapter top in sync with video section height during drag and size transition
let videoSectionResizeObserver = null
let videoSectionObservedEl = null
function setupVideoSectionResizeObserver() {
  const el = videoSectionRef.value
  if (!el || !showVideoSection.value) return
  if (videoSectionObservedEl === el) return
  teardownVideoSectionResizeObserver()
  videoSectionResizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      videoSectionHeightPx.value = entry.target.offsetHeight
    }
  })
  videoSectionResizeObserver.observe(el)
  videoSectionObservedEl = el
}
function teardownVideoSectionResizeObserver() {
  if (videoSectionResizeObserver && videoSectionObservedEl) {
    videoSectionResizeObserver.unobserve(videoSectionObservedEl)
  }
  videoSectionResizeObserver = null
  videoSectionObservedEl = null
}

const openVideo = () => {
  showVideoSection.value = !showVideoSection.value
}

// V2.2: toggle play/pause on video container (shows pause when "playing", makes video sticky)
function toggleV22VideoPlay(sectionId) {
  v22PlayingSectionId.value = v22PlayingSectionId.value === sectionId ? null : sectionId
}


// V2 / V2.2: show video by default (per-chapter blocks rendered below each chapter)
watch([isVideoV2, isVideoV2_2, isVideoV3], ([v2, v22, v3]) => {
  if (v2 || v22 || v3) showVideoSection.value = true
}, { immediate: true })

watch(showVideoSection, (visible) => {
  if (visible) {
    videoFormat.value = 'large'
    nextTick(() => {
      updateVideoSectionHeightPx()
      setupVideoSectionResizeObserver()
    })
  } else {
    teardownVideoSectionResizeObserver()
  }
})
watch([videoFormat], () => {
  nextTick(() => {
    updateVideoSectionHeightPx()
    setupVideoSectionResizeObserver()
  })
})
watch(videoSectionRef, (el) => {
  if (showVideoSection.value && el) {
    nextTick(() => setupVideoSectionResizeObserver())
  } else if (!el) {
    teardownVideoSectionResizeObserver()
  }
})

const nextQuestion = () => {
  if (currentQuestionIndex.value === -1) {
    currentQuestionIndex.value = 0
    loadQuestion(0)
    displayedProgress.value = actualProgress.value
    displayedStreak.value = streak.value
    return
  }
  if (currentQuestionIndex.value < totalChallenges.value - 1) {
    currentQuestionIndex.value++
    loadQuestion(currentQuestionIndex.value)
    displayedProgress.value = actualProgress.value
    displayedStreak.value = streak.value
  }
}

const handleComplete = () => {
  // TODO: Navigate to next lesson (to be implemented)
  console.log('Lesson complete! Moving to next lesson...')
}

const prevQuestion = () => {
  if (currentQuestionIndex.value === 0) {
    currentQuestionIndex.value = -1
    setBoardToDefault()
    displayedProgress.value = 0
    displayedStreak.value = streak.value
    return
  }
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    loadQuestion(currentQuestionIndex.value)
    displayedProgress.value = actualProgress.value
    displayedStreak.value = streak.value
  }
}

// ============================================
// INITIALIZATION
// ============================================
// Board by default: show standard starting position; user clicks Next to start first puzzle
setBoardToDefault()
displayedProgress.value = 0
displayedStreak.value = 0

// Add global event listeners for drag immediately
// (using document listeners that work even before mount)
document.addEventListener('mousemove', handleDragMove)
document.addEventListener('mouseup', handleDragEnd)
document.addEventListener('touchmove', handleDragMove, { passive: false })
document.addEventListener('touchend', handleDragEnd)

function setupV3ScrollListener() {
  v3ScrollCleanup?.()
  v3ScrollCleanup = null
  v3IntersectionObserver?.disconnect()
  v3IntersectionObserver = null
  if (!isVideoV3.value || !coursesContentRef.value) {
    v3ShowScrollUp.value = false
    clearV3ScrollUpHideTimer()
    return
  }
  const el = coursesContentRef.value
  const showThreshold = getV3ScrollUpThreshold()
  const at = el.scrollTop >= showThreshold
  v3ShowScrollUp.value = at
  if (at) scheduleV3ScrollUpHide()
  else clearV3ScrollUpHideTimer()
  el.addEventListener('scroll', onV3Scroll, { passive: true })
  el.addEventListener('wheel', onV3Wheel, { passive: false })
  el.addEventListener('touchstart', onV3TouchStart, { passive: true })
  el.addEventListener('touchmove', onV3TouchMove, { passive: false })
  v3ScrollCleanup = () => {
    el.removeEventListener('scroll', onV3Scroll)
    el.removeEventListener('wheel', onV3Wheel)
    el.removeEventListener('touchstart', onV3TouchStart)
    el.removeEventListener('touchmove', onV3TouchMove)
    v3IntersectionObserver?.disconnect()
    v3IntersectionObserver = null
    clearV3ScrollUpHideTimer()
    v3ScrollCleanup = null
  }
  // Section block refs may not be set until after paint; run after refs are in DOM
  nextTick(() => {
    requestAnimationFrame(() => {
      clampV3Scroll()
      updateStickySection()
      // Second rAF so refs (from v-for) are definitely set
      requestAnimationFrame(() => {
        setupV3IntersectionObserver()
        clampV3Scroll()
        updateStickySection()
      })
    })
  })
}

watch([isVideoV3, coursesContentRef], () => {
  setupV3ScrollListener()
}, { immediate: true })

onMounted(() => {
  nextTick(setupV3ScrollListener)
})

onUnmounted(() => {
  v3ScrollCleanup?.()
  teardownVideoSectionResizeObserver()
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('touchmove', handleDragMove)
  document.removeEventListener('touchend', handleDragEnd)
})
</script>

<template>
  <div class="app dark-mode">
    <div class="layout">
      <!-- Left: Chessboard -->
      <div class="board-section">
        <div class="board-wrapper">
          <div class="chessboard" ref="boardRef">
            <div 
              v-for="square in squares" 
              :key="square"
              class="square"
              :class="[
                isLightSquare(square) ? 'light' : 'dark',
                { 'selected': isSelected(square), 'last-move': isLastMove(square), 'wrong-move': isWrongMove(square) }
              ]"
              :data-square="square"
              @click="handleSquareClick(square)"
            >
              <!-- Skill Highlight Overlay -->
              <div 
                v-if="hasSkillHighlight(square)" 
                class="skill-highlight-overlay"
              ></div>
              
              <!-- Skill +1 Icon (same animation as original star) -->
              <div 
                v-if="hasSkillHighlight(square)" 
                class="skill-plus-icon" 
                :style="getSkillHighlightStyle"
              >+1</div>
              
              <!-- Skill Label Bubble (transforms from white pill to gold circle) -->
              <div 
                v-if="hasSkillHighlight(square) && skillHighlightLabel" 
                class="skill-label-bubble"
                :style="getSkillHighlightStyle"
              >
                <span class="skill-label-text">{{ skillHighlightLabel }}</span>
              </div>

              <!-- Brilliant Highlight Overlay (teal color) -->
              <div 
                v-if="hasBrilliantHighlight(square)" 
                class="brilliant-highlight-overlay"
              ></div>
              
              <!-- Brilliant Icon (exclamation double) - scaled 1.8x from 16 to 29 -->
              <div 
                v-if="hasBrilliantHighlight(square)" 
                class="brilliant-icon-wrapper"
              >
                <CcIcon name="move-exclamation-double" :customSize="51" class="brilliant-icon" />
              </div>
              
              <!-- Brilliant Label Bubble (teal, stays on board) -->
              <div 
                v-if="hasBrilliantHighlight(square)" 
                class="brilliant-label-bubble"
              >
                <span class="brilliant-label-text">Brilliant!</span>
              </div>

              <!-- Checkmate Highlight Overlay (red at 80% opacity) -->
              <div 
                v-if="hasCheckmateHighlight(square)" 
                class="checkmate-highlight-overlay"
              ></div>
              
              <!-- Checkmate Icon (Rotated King - defeated) -->
              <div 
                v-if="hasCheckmateHighlight(square)" 
                class="checkmate-icon-wrapper"
              >
                <CcIcon :name="checkmateKingIcon" :customSize="51" class="checkmate-king-icon" :style="{ color: checkmateIconColor, fill: checkmateIconColor }" />
              </div>
              
              <!-- Checkmate Label Bubble (red, stays on board) -->
              <div 
                v-if="hasCheckmateHighlight(square)" 
                class="checkmate-label-bubble"
              >
                <span class="checkmate-label-text">Checkmate</span>
              </div>

              <!-- Piece -->
              <img 
                v-if="getPieceOnSquare(square) && !isPieceDragged(square)" 
                class="piece"
                :class="{ 'draggable': getPieceOnSquare(square)?.type.startsWith('w') }"
                :src="getPieceImage(getPieceOnSquare(square))"
                :alt="getPieceOnSquare(square).type"
                draggable="false"
                @mousedown="handleDragStart($event, square)"
                @touchstart="handleDragStart($event, square)"
              />
              <!-- File label (bottom row) -->
              <span v-if="square[1] === '1'" class="coord file-coord">{{ square[0] }}</span>
              <!-- Rank label (left column) -->
              <span v-if="square[0] === 'a'" class="coord rank-coord">{{ square[1] }}</span>
            </div>
          </div>
          
        </div>
        
        <!-- Dragged piece (follows cursor) -->
        <img 
          v-if="isDragging && draggedPiece"
          class="dragged-piece"
          :src="getPieceImage(draggedPiece)"
          :style="{
            left: dragPosition.x + 'px',
            top: dragPosition.y + 'px'
          }"
        />
      </div>

      <!-- Settings between board and panel (6px gap) -->
      <div class="board-settings">
        <CcIcon :name="icons.settings" :size="20" />
      </div>

      <!-- Right: Panel (Courses view) -->
      <div class="review-panel">
        <div class="panel-main">
          <!-- SidebarHeader: left (back when Line view) | Title (book + Courses) | right placeholder -->
          <header ref="panelHeaderRef" class="panel-header sidebar-header">
            <div class="sidebar-header-left">
              <button
                v-if="panelView === 'line'"
                type="button"
                class="sidebar-header-back"
                aria-label="Back to course"
                @click="backToCourses"
              >
                <CcIcon :name="icons.back" variant="glyph" :size="20" />
              </button>
            </div>
            <div class="sidebar-header-title" :class="{ 'sidebar-header-title--line': panelView === 'line' }">
              <img v-if="panelView === 'courses'" :src="baseUrl + 'icons/book-mark-aqua.png'" alt="" class="sidebar-header-icon" width="24" height="24" aria-hidden="true" />
              <span class="sidebar-header-text" :class="{ 'sidebar-header-text--truncate': panelView === 'line' }">{{ panelView === 'line' ? (selectedLine?.move?.text ?? 'Line') : 'Courses' }}</span>
            </div>
            <div class="sidebar-header-right" aria-hidden="true" />
          </header>

          <!-- Content: Courses view (course card, progress, sections, lines) or Line view (empty for now) -->
          <template v-if="panelView === 'courses'">
        <div
          ref="coursesContentRef"
          class="panel-content courses-content"
          :class="{ 'courses-content--v3': isVideoV3 }"
          :style="isVideoV3 && v3PaddingBottomPx != null ? { paddingBottom: `${v3PaddingBottomPx}px` } : {}"
        >
          <!-- Normal content (V1, V2, V3 – all visible; V3: first chapter + video stick when they reach header) -->
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-cards"
            data-name="Course Cards"
          >
            <span class="course-cards-border" aria-hidden="true" />
            <div class="course-cover" data-name="Cover Image" aria-hidden="true">
              <div class="course-cover-wrapper" aria-hidden="true">
                <img v-if="course.thumbnail" :src="baseUrl + course.thumbnail" class="course-cover-img" alt="" />
              </div>
            </div>
            <div class="course-title-author" data-name="Title + Author">
              <div class="course-title-wrap">
                <p class="course-title">{{ course.title }}</p>
              </div>
              <p class="course-author">{{ course.instructor }}</p>
            </div>
          </div>

          <!-- VideoSection (V1 only) – visible when Video button clicked; under course card; sticky -->
          <section ref="videoSectionRef" v-show="showVideoSection && !isVideoV2 && !isVideoV2_2 && !isVideoV3" class="video-section" data-name="VideoSection">
            <div
              class="video-placeholder-frame"
              :class="{ 'video-placeholder-frame--dragging': isResizingVideo }"
              :style="{ width: videoFrameWidth + 'px', height: videoFrameHeight + 'px' }"
            >
              <Transition name="video-play-fade">
                <button
                  v-if="videoFormat !== 'none'"
                  key="play"
                  type="button"
                  class="video-play-button"
                  aria-label="Play video"
                >
                  <CcIcon name="media-control-play" variant="glyph" :size="24" class="video-play-icon" />
                </button>
              </Transition>
            </div>
            <!-- VideoResize – whole strip activates drag; snaps to large / small / none -->
            <div
              class="video-resize"
              data-name="VideoResize"
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize video"
              tabindex="0"
              @mousedown.prevent="startVideoResize"
            >
              <span class="video-resize-handle" />
            </div>
          </section>

          <!-- Rest of content – hidden when video section is on (V1 only); always shown in V2 -->
          <template v-if="!showVideoSection || isVideoV2 || isVideoV2_2 || isVideoV3">
          <!-- Progress – Figma node 2-5697 (specs: layout, spacing, typography, colors) -->
          <div class="course-progress" data-name="Course Progress Container">
            <div class="course-progress-header" data-name="Header">
              <span class="course-progress-title" data-name="Course Progress">Progress</span>
              <span class="course-progress-learned">Learned: {{ progressLearned }}/{{ progressTotal }}</span>
            </div>
            <div class="course-progress-bar-track" data-name="v6 Progress Bar" role="progressbar" :aria-valuenow="progressLearned" :aria-valuemin="0" :aria-valuemax="progressTotal" aria-label="Course progress">
              <div class="course-progress-bar-fill" :style="{ width: progressPercent + '%' }" />
            </div>
          </div>

          <!-- Mastery bar – 8 segments, aqua fill, mint gradient overlay; Next Level (same as Line page) in header -->
          <div class="course-progress course-progress-mastery" :class="{ 'course-progress-mastery--more-expanded': showMoreStats }" data-name="Mastery Container">
            <div class="course-progress-header" data-name="Header">
              <span class="course-progress-title">Mastery</span>
              <div class="course-progress-mastery-next-level extra-data-next-level" data-name="NextLevel">
                <span class="extra-data-label">Level:</span>
                <div class="extra-data-level-chip" data-name="LevelChip">
                  <CcChip
                    :label="extraDataLevelBadge"
                    color="aqua"
                    variant="translucent"
                    :is-uppercase="false"
                    label-class="extra-data-level-chip-label"
                  />
                  <span class="extra-data-level-name">{{ extraDataLevelName }}</span>
                </div>
              </div>
            </div>
            <div class="course-progress-segmented-track" role="progressbar" :aria-valuenow="masteryLevel" :aria-valuemin="0" :aria-valuemax="masteryTotal" aria-label="Mastery: Level {{ masteryLevel }} of {{ masteryTotal }}">
              <div class="course-progress-segmented-segments">
                <div v-for="i in 8" :key="i" class="course-progress-segmented-segment" />
              </div>
              <div class="course-progress-segmented-fill" :style="{ width: masteryPercent + '%' }">
                <div class="course-progress-segmented-fill-gradient" aria-hidden="true" />
              </div>
            </div>
          </div>

          <!-- More / Less – one button: top when collapsed ("More"), bottom when expanded ("Less") -->
          <div class="more-container">
            <button
              v-show="!showMoreStats"
              type="button"
              class="more-btn"
              data-name="V6 Button"
              aria-label="More"
              :aria-expanded="showMoreStats"
              @click="expandMoreStats"
            >
              <span class="more-btn-text">More</span>
              <span class="more-btn-icon" aria-hidden="true" data-name="arrow-chevron-bottom">
                <CcIcon name="arrow-chevron-bottom" variant="glyph" :size="16" class="more-chevron" />
              </span>
            </button>
            <!-- Practice Filter (header): Level / Variations -->
            <div v-show="showMoreStats" class="advanced-stats-header" data-name="Practice Filter">
              <span class="advanced-stats-header-label">Level</span>
              <span class="advanced-stats-header-label">Variations</span>
            </div>
            <!-- Variations list (L1 Rookie, etc.) -->
            <div v-show="showMoreStats" class="advanced-stats-variations" role="list">
              <div
                v-for="item in masteryLevelItems"
                :key="item.level"
                class="mastery-level-item"
                :class="{ 'mastery-level-item--locked': item.locked }"
                role="listitem"
                data-name="MasteryLevelItemContainer"
              >
                <div class="mastery-level-item-left">
                  <CcChip
                    v-if="!item.locked"
                    :label="item.level"
                    color="aqua"
                    :is-uppercase="false"
                    label-class="mastery-level-chip-label"
                  />
                  <CcChip
                    v-else
                    :label="item.level"
                    color="gray"
                    variant="translucent"
                    :is-uppercase="false"
                    label-class="mastery-level-chip-label"
                  />
                  <span class="mastery-level-title">{{ item.title }}</span>
                </div>
                <div class="mastery-level-counter-wrap">
                  <template v-if="item.locked">
                    <span class="mastery-level-lock" aria-hidden="true">
                      <CcIcon name="tool-lock-blank" variant="glyph" :size="20" class="mastery-level-lock-icon" />
                    </span>
                  </template>
                  <template v-else>
                    <span class="mastery-level-counter">{{ item.counter }}</span>
                  </template>
                </div>
              </div>
            </div>
            <!-- Less button – under advanced stats (variations list) when expanded -->
            <div ref="lessButtonContainerRef" v-show="showMoreStats" class="advanced-stats-expanded" data-name="AdvancedStatsExpanded">
              <div class="more-btn-wrap-bottom">
                <button
                  type="button"
                  class="more-btn"
                  data-name="V6 Button"
                  aria-label="Less"
                  aria-expanded="true"
                  @click="showMoreStats = false"
                >
                  <span class="more-btn-text">Less</span>
                  <span class="more-btn-icon" aria-hidden="true">
                    <CcIcon name="arrow-chevron-bottom" variant="glyph" :size="16" class="more-chevron more-chevron-expanded" />
                  </span>
                </button>
              </div>
            </div>
          </div>
          </template>

          <div class="course-lines-row">
            <span class="course-lines-count">{{ courses[0]?.lines ?? 120 }} lines</span>
            <div class="show-all" data-name="Show All" aria-label="Show lines">
              <span class="show-all-label">Show</span>
              <select
                v-model="linesFilterValue"
                class="show-all-value"
                aria-label="Show lines"
              >
                <option
                  v-for="opt in linesFilterOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <span class="show-all-icon-wrap" aria-hidden="true" data-name="triangle-fill-small-bottom">
                <CcIcon name="triangle-fill-small-bottom" variant="glyph" :size="16" class="show-all-icon" />
              </span>
            </div>
          </div>

          <!-- Sections list – V3: all visible + scroll sticky; V2/V1: accordion -->
          <div class="sections-list">
            <div v-for="(section, sectionIndex) in courseSections" :key="section.id" class="section-item" :data-section-id="section.id">
              <!-- V3: every chapter in a sticky block – each sticks when it reaches the header; each has a video -->
              <template v-if="isVideoV3">
                <div
                  :ref="el => setSectionBlockRef(section.id, el)"
                  class="v3-chapter-sticky-block"
                >
                  <!-- Only the chapter header sticks; video scrolls with content -->
                  <div class="v3-chapter-header-sticky">
                    <button
                      type="button"
                      class="chapter-v2"
                      data-name="Chapter V2"
                      aria-expanded="true"
                      disabled
                      aria-disabled="true"
                    >
                      <span class="chapter-v2-border" aria-hidden="true" />
                      <div class="chapter-progress-name">
                        <div class="chapter-content">
                          <span class="chapter-progress-icon" aria-hidden="true">
                            <ProgressCircle
                              :key="`progress-${section.id}`"
                              :progress="getSectionProgressPercent(section)"
                              :size="24"
                            />
                          </span>
                          <span class="chapter-title">{{ section.name }}</span>
                        </div>
                        <div class="chapter-variations">
                          <span class="chapter-count">{{ section.completed }}/{{ section.total }}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                  <!-- Video under each chapter – hidden for "The Games..." (id: games) only -->
                  <section v-if="showVideoSection && section.id !== 'games'" class="video-section video-section--inline" :data-name="`VideoSection-${section.id}`">
                    <div
                      class="video-placeholder-frame"
                      :style="{ width: videoFrameWidth + 'px', height: videoFrameHeight + 'px', backgroundColor: '#000000' }"
                    >
                      <button
                        v-if="videoFormat !== 'none'"
                        type="button"
                        class="video-play-button"
                        aria-label="Play video"
                      >
                        <CcIcon name="media-control-play" variant="glyph" :size="24" class="video-play-icon" />
                      </button>
                    </div>
                  </section>
                  <!-- Lines inside same block so sticky header unsticks only when next chapter touches it -->
                  <div class="move-list-wrap">
                    <div class="move-list" role="list" data-name="Lines" aria-label="Lines">
                      <div
                        v-for="move in getSectionMoves(section)"
                        :key="`${section.id}-${move.id}`"
                        class="move-item"
                        :class="[
                          { 'move-item--inactive': !move.completed },
                          `move-item--${getLineType(move)}`
                        ]"
                        role="listitem"
                        data-name="Line"
                        :data-move-id="`${section.id}-${move.id}`"
                        @click="openLine(section, move)"
                      >
                        <div class="move-item-content">
                          <div class="move-item-inner">
                            <div class="move-item-plys">
                              <span class="move-item-check-wrap" aria-hidden="true">
                                <CcIcon name="mark-check" variant="glyph" :size="16" class="move-item-check" />
                              </span>
                              <span class="move-item-text">{{ move.text }}</span>
                            </div>
                            <span v-if="move.completed && move.level" class="move-item-level-wrap" aria-hidden="true">
                              <CcChip
                                :label="move.level"
                                color="aqua"
                                variant="translucent"
                                :is-uppercase="false"
                                label-class="move-item-level-chip-label"
                              />
                            </span>
                            <span v-else-if="move.completed" class="move-item-indicator-wrap" aria-hidden="true">
                              <span class="move-item-dot" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <!-- V2/V1: accordion – expand to show video + lines -->
              <template v-else>
                <!-- V2.2: one sticky wrapper so chapter + video stick together under the header -->
                <div
                  class="v22-chapter-video-block"
                  :class="{ 'v22-chapter-video-block--sticky': isVideoV2_2 && v22PlayingSectionId === section.id }"
                >
                  <button
                    type="button"
                    class="chapter-v2"
                    :class="{ 'chapter-v2--sticky-under-video': showVideoSection && !isVideoV2 && !isVideoV2_2 && isSectionExpanded(section.id) }"
                    :style="showVideoSection && !isVideoV2 && !isVideoV2_2 && isSectionExpanded(section.id) ? { '--sticky-under-video-top': videoSectionHeightPx + 'px' } : undefined"
                    data-name="Chapter V2"
                    :aria-expanded="isSectionExpanded(section.id)"
                    @click="toggleSection(section.id)"
                  >
                    <span class="chapter-v2-border" aria-hidden="true" />
                    <div class="chapter-progress-name">
                      <div class="chapter-content">
                        <span class="chapter-progress-icon" aria-hidden="true">
                          <ProgressCircle
                            :key="`progress-${section.id}`"
                            :progress="getSectionProgressPercent(section)"
                            :size="24"
                          />
                        </span>
                        <span class="chapter-title">{{ section.name }}</span>
                      </div>
                      <div class="chapter-variations">
                        <span class="chapter-count">{{ section.completed }}/{{ section.total }}</span>
                        <span class="chapter-chevron-wrap" aria-hidden="true">
                          <CcIcon name="arrow-chevron-bottom" variant="glyph" :size="16" class="chapter-chevron" />
                        </span>
                      </div>
                    </div>
                  </button>
                  <section
                    v-if="(isVideoV2 || isVideoV2_2) && showVideoSection && isSectionExpanded(section.id)"
                    class="video-section video-section--inline"
                    :data-name="`VideoSection-${section.id}`"
                  >
                    <div
                      class="video-placeholder-frame"
                      :style="{ width: videoFrameWidth + 'px', height: videoFrameHeight + 'px' }"
                    >
                      <button
                        v-if="videoFormat !== 'none'"
                        type="button"
                        class="video-play-button"
                        :aria-label="isVideoV2_2 && v22PlayingSectionId === section.id ? 'Pause video' : 'Play video'"
                        @click="isVideoV2_2 ? toggleV22VideoPlay(section.id) : undefined"
                      >
                        <CcIcon
                          :name="isVideoV2_2 && v22PlayingSectionId === section.id ? 'media-control-pause' : 'media-control-play'"
                          variant="glyph"
                          :size="24"
                          class="video-play-icon"
                        />
                      </button>
                    </div>
                  </section>
                </div>
                <Transition name="chapter-moves">
                  <div
                    v-if="isSectionExpanded(section.id) && getSectionMoves(section).length"
                    class="move-list-wrap"
                  >
                    <div class="move-list" role="list" data-name="Lines" aria-label="Lines">
                      <div
                        v-for="move in getSectionMoves(section)"
                        :key="`${section.id}-${move.id}`"
                        class="move-item"
                        :class="[
                          { 'move-item--inactive': !move.completed },
                          `move-item--${getLineType(move)}`
                        ]"
                        role="listitem"
                        data-name="Line"
                        :data-move-id="`${section.id}-${move.id}`"
                        @click="openLine(section, move)"
                      >
                        <div class="move-item-content">
                          <div class="move-item-inner">
                            <div class="move-item-plys">
                              <span class="move-item-check-wrap" aria-hidden="true">
                                <CcIcon name="mark-check" variant="glyph" :size="16" class="move-item-check" />
                              </span>
                              <span class="move-item-text">{{ move.text }}</span>
                            </div>
                            <span v-if="move.completed && move.level" class="move-item-level-wrap" aria-hidden="true">
                              <CcChip
                                :label="move.level"
                                color="aqua"
                                variant="translucent"
                                :is-uppercase="false"
                                label-class="move-item-level-chip-label"
                              />
                            </span>
                            <span v-else-if="move.completed" class="move-item-indicator-wrap" aria-hidden="true">
                              <span class="move-item-dot" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </template>
            </div>
          </div>
          </div>
          </template>
          <template v-else-if="panelView === 'line'">
          <div class="panel-content courses-content line-view-content" :class="`line-view-content--${currentLineType}`">
            <!-- COMPLETED LINES SCREEN – design for lines with level (e.g. L1, L2). Do not mix with ready. -->
            <template v-if="currentLineType === 'completed'">
              <section class="coach-new" data-name="CoachNew">
                <div class="coach-new-card" data-name="Quiz">
                  <div class="coach-new-inner">
                    <img :src="baseUrl + 'icons/misc/play-black.png'" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                    <div class="coach-new-message">
                      <div class="coach-new-header coach-new-header--hidden">
                        <span class="coach-new-title">It's practice time!</span>
                      </div>
                      <p class="coach-new-body coach-new-body-with-chip">
                        You've learned all the moves, now come back in
                        <span class="coach-chip-light" data-name="Chip">
                          <span class="coach-chip-light-icon-wrap" aria-hidden="true">
                            <CcIcon name="time-clock" variant="glyph" :size="12" class="coach-chip-light-icon" aria-hidden="true" />
                          </span>
                          <span class="coach-chip-light-text">{{ extraDataPracticeIn }}</span>
                        </span>
                        to practice
                      </p>
                    </div>
                  </div>
                </div>
              </section>
              <section ref="lineViewVideoSectionRef" v-show="showVideoSection" class="video-section" data-name="VideoSection">
                <div
                  class="video-placeholder-frame"
                  :class="{ 'video-placeholder-frame--dragging': lineViewIsResizingVideo }"
                  :style="{ width: lineViewVideoFrameWidth + 'px', height: lineViewVideoFrameHeight + 'px' }"
                >
                  <Transition name="video-play-fade">
                    <button
                      v-if="lineViewVideoFormat !== 'none'"
                      key="play"
                      type="button"
                      class="video-play-button"
                      aria-label="Play video"
                    >
                      <CcIcon name="media-control-play" variant="glyph" :size="24" class="video-play-icon" />
                    </button>
                  </Transition>
                </div>
                <div
                  class="video-resize"
                  data-name="VideoResize"
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize video"
                  tabindex="0"
                  @mousedown.prevent="startLineViewVideoResize"
                >
                  <span class="video-resize-handle" />
                </div>
              </section>
              <div class="line-view-moves">
                <div
                  v-for="(pair, idx) in lineViewMoves"
                  :key="idx"
                  class="move-row"
                  data-name="Move"
                >
                  <span class="move-number">{{ pair.number }}.</span>
                  <div class="ply-pair">
                    <div class="ply-classification">
                      <span class="ply-classification-placeholder" aria-hidden="true" />
                      <span
                        class="ply-chip"
                        :class="{ 'ply-chip--selected': isPlySelected(idx, 'white') }"
                        @click="selectPly(idx, 'white')"
                      >{{ pair.white }}</span>
                    </div>
                    <div class="ply-classification">
                      <span class="ply-classification-placeholder" aria-hidden="true" />
                      <span
                        class="ply-chip"
                        :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') }"
                        @click="selectPly(idx, 'black')"
                      >{{ pair.black }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- READY LINES SCREEN – separate design for completed lines without level. Style independently. -->
            <template v-else-if="currentLineType === 'ready'">
              <section class="coach-new" data-name="CoachNew">
                <div class="coach-new-card" data-name="Quiz">
                  <div class="coach-new-inner">
                    <img :src="baseUrl + 'icons/misc/play-black.png'" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                    <div class="coach-new-message">
                      <div class="coach-new-header">
                        <span class="coach-new-title">It's practice time!</span>
                      </div>
                      <p class="coach-new-body">Let's find out what you remember</p>
                    </div>
                  </div>
                </div>
              </section>
              <section ref="lineViewVideoSectionRef" v-show="showVideoSection" class="video-section" data-name="VideoSection">
                <div
                  class="video-placeholder-frame"
                  :class="{ 'video-placeholder-frame--dragging': lineViewIsResizingVideo }"
                  :style="{ width: lineViewVideoFrameWidth + 'px', height: lineViewVideoFrameHeight + 'px' }"
                >
                  <Transition name="video-play-fade">
                    <button
                      v-if="lineViewVideoFormat !== 'none'"
                      key="play"
                      type="button"
                      class="video-play-button"
                      aria-label="Play video"
                    >
                      <CcIcon name="media-control-play" variant="glyph" :size="24" class="video-play-icon" />
                    </button>
                  </Transition>
                </div>
                <div
                  class="video-resize"
                  data-name="VideoResize"
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize video"
                  tabindex="0"
                  @mousedown.prevent="startLineViewVideoResize"
                >
                  <span class="video-resize-handle" />
                </div>
              </section>
              <div class="line-view-moves">
                <div
                  v-for="(pair, idx) in lineViewMoves"
                  :key="idx"
                  class="move-row"
                  data-name="Move"
                >
                  <span class="move-number">{{ pair.number }}.</span>
                  <div class="ply-pair">
                    <div class="ply-classification">
                      <span class="ply-classification-placeholder" aria-hidden="true" />
                      <span
                        class="ply-chip"
                        :class="{ 'ply-chip--selected': isPlySelected(idx, 'white') }"
                        @click="selectPly(idx, 'white')"
                      >{{ pair.white }}</span>
                    </div>
                    <div class="ply-classification">
                      <span class="ply-classification-placeholder" aria-hidden="true" />
                      <span
                        class="ply-chip"
                        :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') }"
                        @click="selectPly(idx, 'black')"
                      >{{ pair.black }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- UNCOMPLETED LINES SCREEN – no header; body only; Learn + Practice (disabled) -->
            <template v-else>
              <section class="coach-new" data-name="CoachNew">
                <div class="coach-new-card" data-name="Quiz">
                  <div class="coach-new-inner">
                    <img :src="baseUrl + 'icons/misc/play-black.png'" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                    <div class="coach-new-message">
                      <div class="coach-new-header coach-new-header--hidden">
                        <span class="coach-new-title">It's practice time!</span>
                      </div>
                      <p class="coach-new-body">These are the moves you'll learn. Review them and let's start whenever you're ready</p>
                    </div>
                  </div>
                </div>
              </section>
              <section ref="lineViewVideoSectionRef" v-show="showVideoSection" class="video-section" data-name="VideoSection">
                <div
                  class="video-placeholder-frame"
                  :class="{ 'video-placeholder-frame--dragging': lineViewIsResizingVideo }"
                  :style="{ width: lineViewVideoFrameWidth + 'px', height: lineViewVideoFrameHeight + 'px' }"
                >
                  <Transition name="video-play-fade">
                    <button
                      v-if="lineViewVideoFormat !== 'none'"
                      key="play"
                      type="button"
                      class="video-play-button"
                      aria-label="Play video"
                    >
                      <CcIcon name="media-control-play" variant="glyph" :size="24" class="video-play-icon" />
                    </button>
                  </Transition>
                </div>
                <div
                  class="video-resize"
                  data-name="VideoResize"
                  role="separator"
                  aria-orientation="horizontal"
                  aria-label="Resize video"
                  tabindex="0"
                  @mousedown.prevent="startLineViewVideoResize"
                >
                  <span class="video-resize-handle" />
                </div>
              </section>
              <div class="line-view-moves">
                <div
                  v-for="(pair, idx) in lineViewMoves"
                  :key="idx"
                  class="move-row"
                  data-name="Move"
                >
                  <span class="move-number">{{ pair.number }}.</span>
                  <div class="ply-pair">
                    <div class="ply-classification">
                      <span class="ply-classification-placeholder" aria-hidden="true" />
                      <span
                        class="ply-chip"
                        :class="{ 'ply-chip--selected': isPlySelected(idx, 'white') }"
                        @click="selectPly(idx, 'white')"
                      >{{ pair.white }}</span>
                    </div>
                    <div class="ply-classification">
                      <span class="ply-classification-placeholder" aria-hidden="true" />
                      <span
                        class="ply-chip"
                        :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') }"
                        @click="selectPly(idx, 'black')"
                      >{{ pair.black }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        </div>
        <!-- Footer frame: bg/secondary; inner container has primary + overlay -->
        <div class="panel-footer-frame">
        <div class="panel-footer-container">
          <!-- Level footer: Practice in (completed) or Ready (ready lines) + Next Level – Lines only; hidden on uncompleted -->
          <div v-if="panelView === 'line' && currentLineType !== 'uncompleted'" class="extra-data" data-name="LevelFooter">
            <!-- Completed lines: Practice in + time chip -->
            <div v-if="currentLineType === 'completed'" class="extra-data-practice-in" data-name="PracticeIn">
              <span class="extra-data-label">Practice in:</span>
              <CcChip
                :label="extraDataPracticeIn"
                icon="time-clock"
                color="gray"
                variant="translucent"
                :is-uppercase="true"
                label-class="extra-data-time-chip-label"
                class="extra-data-time-chip"
              />
            </div>
            <!-- Ready lines: Ready for Practice status indicator (Figma 54-8005) -->
            <div v-else-if="currentLineType === 'ready'" class="extra-data-ready" data-name="Ready">
              <div class="extra-data-ready-icon-frame" data-name="IconFrame">
                <CcIcon name="circle-fill-check" variant="glyph" :size="16" class="extra-data-ready-icon" aria-hidden="true" />
              </div>
              <span class="extra-data-ready-text">Ready for Practice!</span>
            </div>
            <div v-else class="extra-data-practice-in" data-name="PracticeIn">
              <span class="extra-data-label">Practice in:</span>
              <CcChip
                :label="extraDataPracticeIn"
                icon="time-clock"
                color="gray"
                variant="translucent"
                :is-uppercase="true"
                label-class="extra-data-time-chip-label"
                class="extra-data-time-chip"
              />
            </div>
            <div class="extra-data-next-level" data-name="NextLevel">
              <span class="extra-data-label">Level:</span>
              <div class="extra-data-level-chip" data-name="LevelChip">
                <CcChip
                  :label="extraDataLevelBadge"
                  color="aqua"
                  variant="translucent"
                  :is-uppercase="false"
                  label-class="extra-data-level-chip-label"
                />
                <span class="extra-data-level-name">{{ extraDataLevelName }}</span>
              </div>
            </div>
          </div>
          <!-- Buttons footer: Continue / Practice – Chapter and Lines; Completed lines: Learn Again + Practice (disabled) -->
          <section class="footer-section footer-section-actions" data-name="ButtonsFooter">
            <!-- Completed lines: Learn Again (secondary) + Practice (disabled, no badge) -->
            <div v-if="panelView === 'line' && currentLineType === 'completed'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="secondary" size="large" class="footer-btn-equal">Learn Again</CcButton>
                <CcButton variant="primary" size="large" disabled class="footer-btn-equal">Practice</CcButton>
              </div>
            </div>
            <!-- Ready lines: Learn Again (secondary) + Practice (enabled, no badge) -->
            <div v-else-if="panelView === 'line' && currentLineType === 'ready'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="secondary" size="large" class="footer-btn-equal">Learn Again</CcButton>
                <CcButton variant="primary" size="large" class="footer-btn-equal">Practice</CcButton>
              </div>
            </div>
            <!-- Uncompleted lines: Learn (primary/green) + Practice (secondary, disabled, no badge) -->
            <div v-else-if="panelView === 'line' && currentLineType === 'uncompleted'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="primary" size="large" class="footer-btn-equal">Learn</CcButton>
                <CcButton variant="secondary" size="large" disabled class="footer-btn-equal">Practice</CcButton>
              </div>
            </div>
            <div v-else-if="showLessonActions" class="footer-buttons-container">
                <template v-if="questionState === 'solution' && currentQuestionIndex >= totalChallenges - 1">
                  <div class="footer-buttons-row footer-buttons-row-full">
                    <CcButton variant="primary" size="large" :icon="{ name: 'arrow-line-right', variant: 'glyph' }" @click="handleComplete" class="footer-btn-full">Complete</CcButton>
                  </div>
                </template>
                <template v-else-if="questionState === 'wrong'">
                  <div class="footer-buttons-row footer-buttons-row-split">
                    <CcButton variant="secondary" size="large" :icon="{ name: 'circle-fill-question', variant: 'glyph' }" @click="showSolution">Solution</CcButton>
                    <CcButton variant="danger" size="large" :icon="{ name: 'arrow-spin-undo', variant: 'glyph' }" @click="handleRetry">Retry</CcButton>
                  </div>
                </template>
                <template v-else>
                  <!-- Single row: Continue (left) + Practice (count) (right) -->
                  <div class="footer-buttons-row footer-buttons-row-split">
                    <CcButton variant="secondary" size="large" class="footer-btn-equal">Continue</CcButton>
                    <button type="button" class="v6-btn-practice-all cc-button-component cc-button-primary cc-button-large cc-bg-primary footer-btn-equal" data-name="V6 Button" aria-label="Practice">
                      <span class="v6-btn-practice-all-text">Practice</span>
                      <span class="v6-btn-practice-all-badge-frame">
                        <span class="v6-btn-practice-all-badge">
                          <span class="v6-btn-practice-all-badge-text">{{ practiceReadyCount }}</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </template>
            </div>
          </section>

          <!-- Icon footer: ellipsis, video, prev/next – Chapter and Lines -->
          <section class="footer-section footer-section-toolbar" data-name="IconFooter">
            <div class="footer-icon-group" data-name="V6 Icon Button Ghost Stack">
              <button type="button" class="footer-icon-btn" aria-label="More options">
                <CcIcon :name="icons.ellipsis" variant="glyph" :size="20" class="footer-icon" />
              </button>
              <button type="button" class="footer-icon-btn" :aria-label="showVideoSection ? 'Hide video' : 'Show video'" @click="openVideo">
                <CcIcon :name="showVideoSection ? icons.videoOff : icons.videoOn" variant="glyph" :size="20" class="footer-icon" />
              </button>
            </div>
            <div class="footer-icon-group" data-name="V6 Icon Button Ghost Stack">
              <button
                type="button"
                class="footer-icon-btn"
                :disabled="!(panelView === 'line' && (currentLineType === 'completed' || currentLineType === 'uncompleted'))"
                aria-label="Previous"
                @click="panelView === 'line' ? selectPreviousPly() : prevQuestion()"
              >
                <CcIcon name="arrow-chevron-left" variant="glyph" :size="20" class="footer-icon" />
              </button>
              <button
                type="button"
                class="footer-icon-btn"
                :disabled="!(panelView === 'line' && (currentLineType === 'completed' || currentLineType === 'uncompleted'))"
                aria-label="Next"
                @click="panelView === 'line' ? selectNextPly() : nextQuestion()"
              >
                <CcIcon name="arrow-chevron-right" variant="glyph" :size="20" class="footer-icon" />
              </button>
            </div>
          </section>

          <footer class="panel-footer" />
        </div>
        </div>
        <!-- V3 scroll-up button after footer in DOM; z 1 so footer (z 10) stacks on top -->
        <Transition name="v3-scroll-up">
          <button
            v-if="isVideoV3 && panelView === 'courses' && v3ShowScrollUp"
            type="button"
            class="v3-scroll-up-btn"
            aria-label="Scroll to top"
            @click="scrollV3ToTop"
            @wheel.prevent="onV3ScrollUpBtnWheel"
            @touchstart="onV3ScrollUpBtnTouchStart"
            @touchmove.prevent="onV3ScrollUpBtnTouchMove"
          >
            <CcIcon name="arrow-line-top" variant="glyph" :size="20" class="v3-scroll-up-icon" aria-hidden="true" />
          </button>
        </Transition>
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
/* color/bg/progress-completed-gradient – progress bar fill (DS may add later) */
.dark-mode {
  --color-bg-progress-completed-gradient: linear-gradient(0deg, var(--color-green-500, #45753C) 0%, var(--color-green-300, #81B64C) 100%);
}
</style>

<style scoped>
/* Responsive: min screen 975px, board 550px, panel 460px */
.app {
  min-height: 100vh;
  min-width: 975px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.4rem;
  overflow-x: auto;
}

.layout {
  display: flex;
  gap: 6px;
  height: 700px;
  min-width: 975px;
}

/* Board – fixed 550px for responsive testing */
.board-section {
  position: relative;
  display: flex;
  flex-shrink: 0;
  overflow: visible; /* Allow animations to overflow */
}

.chessboard {
  width: 700px;
  min-width: 550px;
  height: 700px;
  min-height: 550px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border-radius: 3px;
  overflow: hidden; /* Clip corners */
}

.square {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: visible; /* Allow animations to overflow */
}

.square.light { background: #ebecd0; }
.square.dark { background: #779556; }

.square.selected.light { background: #f6f669; }
.square.selected.dark { background: #bbcb44; }

/* Success move highlight - green-300 (#81B64C) at 50% opacity overlay */
.square.last-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(129, 182, 76, 0.5); /* green-300 at 50% */
  z-index: 1;
  pointer-events: none;
}

/* Wrong move highlight - red-200 (#FF6352) at 50% opacity overlay */
.square.wrong-move::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 99, 82, 0.5); /* red-200 at 50% */
  z-index: 1;
  pointer-events: none;
}

.piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
  user-select: none;
}

.piece.draggable {
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

/* Settings between board and panel (6px gap); icon only, 20px tall */
.board-settings {
  flex-shrink: 0;
  align-self: flex-start;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

/* Panel – Practice Filter (node 1-10063): design tokens */
.review-panel {
  flex: 0 0 460px;
  width: 460px;
  height: 700px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-l);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
/* Wrapper for header + content so footer stays pinned at bottom */
.panel-main {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 0;
}

/* SidebarHeader – three-column: left (48px) | title (flex) | right (48px); overlay bg; height 48px */
.panel-header.sidebar-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 48px;
  min-height: 48px;
  align-content: stretch;
  background: var(--bg-header-overlay, rgba(0, 0, 0, 0.14));
}
.sidebar-header-left,
.sidebar-header-right {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-12, 48px);
  min-width: var(--size-12, 48px);
  height: 100%;
  padding: var(--space-3, 12px);
  flex-shrink: 0;
  box-sizing: border-box;
}
.sidebar-header-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}
.sidebar-header-back:hover {
  color: var(--color-text-primary, rgba(255, 255, 255, 0.85));
}
.sidebar-header-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  position: relative;
}
.sidebar-header-icon {
  flex-shrink: 0;
  width: var(--size-6, 24px);
  height: var(--size-6, 24px);
  display: block;
  object-fit: contain;
}
.sidebar-header-text {
  font-family: 'Chess Sans', sans-serif;
  font-size: var(--text-lg, 17px);
  line-height: var(--leading-5, 20px);
  font-weight: 700;
  color: var(--text-primary-white, #ffffff);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 20px;
  flex-shrink: 0;
}
.sidebar-header-title--line .sidebar-header-text--truncate {
  flex: 1 1 0;
  min-width: 0;
  white-space: nowrap;
}

/* CoachNew – coach message / ready state (Line view, Figma 32-5549) */
.coach-new {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 4px;
  padding-bottom: 8px;
  padding-left: 16px;
  padding-right: 16px;
  position: relative;
  width: 100%;
  flex-shrink: 0;
  background: var(--bg-coach-gradient, linear-gradient(to bottom, #1e1d1a, rgba(38, 36, 33, 0)));
}
.coach-new-card {
  position: relative;
  width: 100%;
  min-height: var(--size-9, 36px);
  flex-shrink: 0;
  background: var(--bg-white, #ffffff);
  border-radius: var(--radius-md, 10px);
  border: 1px solid var(--border-subtle-white, rgba(255, 255, 255, 0.05));
}
.coach-new-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: 10px;
  min-height: inherit;
  width: 100%;
  box-sizing: border-box;
}
.coach-new-icon {
  flex-shrink: 0;
  width: var(--size-8, 32px);
  height: var(--size-8, 32px);
  display: block;
  object-fit: contain;
}
.coach-new-message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-1, 4px);
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  position: relative;
}
.coach-new-header {
  display: flex;
  align-items: flex-start;
  width: 100%;
  position: relative;
  flex-shrink: 0;
}
/* Line view: coach header and body both visible (e.g. "It's practice time!" / "Let's find out what you remember") */
.coach-new-title {
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-xl, 18px);
  line-height: var(--leading-6, 24px);
  font-weight: 600;
  color: var(--text-dark-primary, #312e2b);
  flex-shrink: 0;
}
.coach-new-body {
  margin: 0;
  font-family: var(--font-system-medium, system-ui, sans-serif);
  font-size: var(--text-base, 15px);
  line-height: var(--leading-5, 20px);
  font-weight: 500;
  color: var(--text-dark-primary, #312e2b);
  width: 100%;
  white-space: pre-wrap;
  flex-shrink: 0;
}
.coach-new-body-with-chip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 6px;
  white-space: normal;
}
.coach-new-header--hidden {
  display: none;
}
.coach-new-body-with-chip .coach-chip-light {
  flex-shrink: 0;
  vertical-align: middle;
}
/* Coach chip (light): Main Container – spec layout + DS tokens */
.coach-chip-light {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1, 4px);
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: var(--radius-xs-plus, 3px);
  position: relative;
  width: fit-content;
  align-content: stretch;
  background: var(--bg-chip-light, #dad8d6);
  box-sizing: border-box;
}
.coach-chip-light-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-3, 12px);
  height: var(--size-3, 12px);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}
.coach-chip-light-icon {
  width: var(--size-3, 12px);
  height: var(--size-3, 12px);
  flex-shrink: 0;
  position: relative;
  color: var(--icon-gray-medium, #8b8987);
  display: block;
}
.coach-chip-light-icon-wrap :deep(svg),
.coach-chip-light-icon-wrap :deep(.cc-icon) {
  width: 12px;
  height: 12px;
  min-width: 12px;
  min-height: 12px;
  display: block;
  flex-shrink: 0;
}
.coach-chip-light-text {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-xs, 12px);
  line-height: var(--leading-4, 16px);
  font-weight: 600;
  font-style: normal;
  letter-spacing: var(--tracking-wide, 0.6px);
  text-transform: uppercase;
  color: var(--text-gray-dark, #666564);
  text-align: center;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0);
  position: relative;
  flex-shrink: 0;
}

/* Line view: chess move rows (Figma 32-7715 – Move / Chess Move Notation Row) */
.line-view-moves {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
  min-width: 0;
  padding-left: 0;
  padding-right: 0;
}
.move-row {
  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  height: 30px;
  position: relative;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
}
.move-row:nth-child(even) {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
}
.move-number {
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-sm, 13px);
  line-height: var(--leading-4, 16px);
  font-weight: 600;
  color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
  width: var(--size-6, 24px);
  min-width: var(--size-6, 24px);
  white-space: pre-wrap;
  flex-shrink: 0;
}
.ply-pair {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}
.ply-classification {
  display: flex;
  gap: var(--space-1, 4px);
  align-items: center;
  width: var(--ply-classification-width, 100px);
  min-width: var(--ply-classification-width, 100px);
  position: relative;
  flex-shrink: 0;
}
.ply-classification-placeholder {
  width: var(--size-4, 16px);
  height: var(--size-4, 16px);
  flex-shrink: 0;
}
.ply-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  border-radius: var(--radius-xs, 2px);
  overflow: clip;
  flex-shrink: 0;
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-sm-plus, 14px);
  line-height: var(--leading-4, 16px);
  font-weight: 600;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
  min-height: 18px;
  white-space: pre-wrap;
  cursor: pointer;
}
.ply-chip--selected {
  background: var(--bg-ply-selected, rgba(255, 255, 255, 0.08));
  box-shadow: var(--shadow-ply-selected, 0 2px 0 0 rgba(255, 255, 255, 0.5));
  color: var(--text-primary-bright, #ffffff);
}

.lessons-icon {
  width: 2.4rem;
  height: 2.4rem;
}

/* Scrollable area: all content between header and footer; flex child needs min-height: 0 to scroll */
.panel-content {
  flex: 1;
  min-height: 0;
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  position: relative;
  overflow: visible;
}

/* Courses view – scrollable body (header and both footer sections stay fixed) */
.courses-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 0 var(--space-16) 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
/* Line view: no horizontal scroll */
.line-view-content {
  overflow-x: hidden;
  min-width: 0;
}
/* Line view screens – style separately; do not mix completed vs ready */
/* .line-view-content--completed { } – design for completed lines (with level) */
/* Ready lines: hide exact moves with layer blur so notation is unreadable */
.line-view-content--ready .line-view-moves {
  filter: blur(3px);
  user-select: none;
  -webkit-user-select: none;
}
/* .line-view-content--uncompleted { } – design for uncompleted lines */
/* V3: extra bottom padding so last chapter can be scrolled through fully */
.courses-content--v3 {
  padding-bottom: 80vh;
}
.courses-content::-webkit-scrollbar {
  width: 8px;
}
.courses-content::-webkit-scrollbar-track {
  background: transparent;
}
.courses-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}
.courses-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.45);
}

/* V3: chapter header sticks; video and lines scroll (only header is sticky) */
.v3-chapter-sticky-block {
  display: flex;
  flex-direction: column;
  gap: 0;
  flex-shrink: 0;
}
.v3-chapter-header-sticky {
  position: sticky;
  top: 0;
  z-index: 2;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
}

/* V3: floating scroll-up circle; z 5 = above content (0), below footer (10) */
.v3-scroll-up-btn {
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 5;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.15s ease;
}
.v3-scroll-up-btn:hover .v3-scroll-up-icon {
  color: var(--icon-secondary, rgba(255, 255, 255, 0.72));
}
.v3-scroll-up-btn:active {
  transform: translate(-50%, 0) scale(0.96);
}

/* V3 scroll-up: slide up from footer when appearing, slide down when disappearing */
.v3-scroll-up-enter-active,
.v3-scroll-up-leave-active {
  transition: transform 0.25s ease;
}
.v3-scroll-up-enter-from {
  transform: translate(-50%, 80px);
}
.v3-scroll-up-enter-to {
  transform: translate(-50%, 0);
}
.v3-scroll-up-leave-from {
  transform: translate(-50%, 0);
}
.v3-scroll-up-leave-to {
  transform: translate(-50%, 80px);
}
.v3-scroll-up-icon {
  flex-shrink: 0;
  color: var(--icon-tertiary, rgba(255, 255, 255, 0.5));
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
  transition: color 0.15s ease;
}

.v3-lines-scroll {
  flex: 1;
  min-height: 0;
}

/* Course Cards – spec: main container, border, cover, title + author */
.course-cards {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  width: 100%;
  position: relative;
  cursor: pointer;
}
.course-cards-border {
  position: absolute;
  inset: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

/* Cover Image – 64×64, 3px radius */
.course-cover {
  position: relative;
  width: 64px;
  height: 64px;
  min-width: 64px;
  flex-shrink: 0;
  border-radius: 3px;
  overflow: hidden;
  background: var(--color-bg-secondary);
}
.course-cover-wrapper {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 3px;
}
.course-cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  border-radius: 3px;
}

/* Title + Author section – 8px gap between heading and author */
.course-title-author {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  padding: 2px 0;
  align-self: stretch;
}
.course-title-wrap {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 100%;
  overflow: hidden;
  flex-shrink: 0;
}
.course-title {
  margin: 0;
  font-family: 'Chess Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  font-feature-settings: 'liga' 0;
}
.course-author {
  margin: 0;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

/* VideoSection – under course card; bg opaque; V1 sticky, V2 inline */
.video-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  position: sticky;
  top: 0;
  z-index: 2;
  width: 100%;
  align-content: stretch;
  background: var(--color-bg-opaque);
}
.video-section--inline {
  position: static;
  z-index: 0;
}
/* V2.2: one sticky block (chapter + video) sticks under header when video is playing */
.v22-chapter-video-block {
  display: flex;
  flex-direction: column;
}
.v22-chapter-video-block--sticky {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-bg-opaque);
}
.video-placeholder-frame {
  flex-shrink: 0;
  background: #000;
  position: relative;
  transition: width 0.25s ease, height 0.25s ease;
}
.video-placeholder-frame--dragging {
  transition: none;
}
.video-play-button {
  position: absolute;
  left: 50%;
  top: calc(50% + 1.2px);
  transform: translate(-50%, -50%);
  transform-origin: center center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--icon-video-play, #666564);
}
.video-play-button:hover {
  background: rgba(255, 255, 255, 0.95);
}
.video-play-fade-enter-active {
  transition: opacity 0.2s ease;
}
.video-play-fade-leave-active {
  transition: opacity 0.1s ease-out, transform 0.1s ease-out;
}
.video-play-fade-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.video-play-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}
.video-play-fade-enter-from {
  opacity: 0;
}
.video-play-fade-enter-to {
  opacity: 1;
}
.video-play-icon {
  margin-left: 1.77px;
  margin-top: 0.47px;
}

/* VideoResize – height 16px; bg Material thick dark; inner bar 25% longer (30px) */
.video-resize {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 179px;
  width: 100%;
  min-height: 16px;
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  background: var(--color-gray-900, #1a1a1a);
}
.video-resize:focus {
  outline: 2px solid var(--color-text-link);
  outline-offset: 2px;
}
.video-resize-handle {
  display: block;
  width: 30px;
  height: 3px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  pointer-events: none;
}

/* Progress – Figma node 2-5697 (exact spec: layout, spacing, typography, colors) */
.course-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 4px;
  padding: 12px 16px 8px;
  overflow: clip;
}
.course-progress-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  flex: none;
}
.course-progress-title {
  font-family: 'Chess Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  font-style: normal;
  color: rgba(255, 255, 255, 0.85);
  flex: none;
}
.course-progress-learned {
  font-family: var(--font-family-system, system-ui, -apple-system, sans-serif);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  font-style: normal;
  color: rgba(255, 255, 255, 0.5);
  flex: none;
}
.course-progress-bar-track {
  position: relative;
  width: 100%;
  height: 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  overflow: clip;
  flex: none;
}
.course-progress-bar-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(0deg, var(--color-green-500, #45753C) 0%, var(--color-green-300, #81B64C) 100%);
  /* Button/Icon/button-icon-shadow */
  box-shadow: 0 1px 0 0 var(--color-elevation-foreground-dark-only, rgba(0, 0, 0, 0.20));
  transition: width 0.2s ease;
  pointer-events: none;
  z-index: 1;
  /* width set inline from progressPercent */
}

/* Mastery: Level block baseline-align with "Level:", chip, "Rookie" */
.course-progress-mastery .course-progress-mastery-next-level {
  flex-shrink: 0;
  align-items: baseline;
}

/* Mastery container: when More is expanded, bottom padding 12px (default 8px from .course-progress) */
.course-progress-mastery--more-expanded {
  padding-bottom: 12px;
}

/* Progress bar 2 – Figma node 3-6134: 8 segments, teal indicator, mint gradient overlay */
.course-progress-segmented .course-progress-segmented-track {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 16px;
  min-height: 1px;
  position: relative;
  border-radius: 10px;
  overflow: clip;
  background: rgba(255, 255, 255, 0.1);
}
.course-progress-mastery .course-progress-segmented-track {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 16px;
  min-height: 1px;
  position: relative;
  border-radius: 10px;
  overflow: clip;
  background: rgba(255, 255, 255, 0.1);
}
.course-progress-segmented .course-progress-segmented-segments {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: row;
  pointer-events: none;
  z-index: 0;
}
.course-progress-mastery .course-progress-segmented-segments {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: row;
  pointer-events: none;
  z-index: 2;
}
.course-progress-mastery .course-progress-segmented-segment {
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  border-right: 2px solid #22201E;
  box-sizing: border-box;
}
.course-progress-mastery .course-progress-segmented-segment:last-child {
  border-right: none;
}
.course-progress-mastery .course-progress-segmented-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  background: linear-gradient(180deg, rgba(98, 246, 202, 0.50) 0%, rgba(98, 246, 202, 0.00) 100%), linear-gradient(180deg, var(--color-aqua-300, #26C2A3) 0%, var(--color-aqua-400, #109888) 100%);
  transition: width 0.2s ease;
  pointer-events: none;
  z-index: 1;
  overflow: clip;
}
.course-progress-mastery .course-progress-segmented-fill-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* More – under Mastery bar, V6 Button with text + chevron */
.more-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-bottom: 4px;
  position: relative;
}
.more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 32px;
  max-height: 32px;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  overflow: clip;
}
.more-btn:hover .more-btn-text {
  color: var(--text-primary, rgba(255, 255, 255, 0.85));
}
.more-btn:hover .more-chevron {
  color: var(--icon-secondary, rgba(255, 255, 255, 0.72));
}
.more-btn-text {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
  text-align: center;
  text-shadow: var(--shadow-text, 0 1px 0 rgba(0, 0, 0, 0.2));
  flex-shrink: 0;
}
.more-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.more-chevron {
  color: var(--icon-tertiary, rgba(255, 255, 255, 0.5));
  filter: var(--shadow-drop, drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2)));
  transition: transform 0.2s ease;
}
.more-chevron-expanded {
  transform: rotate(180deg);
}

/* AdvancedStatsExpanded – main container */
.advanced-stats-expanded {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  width: 100%;
  flex-shrink: 0;
  align-content: stretch;
}

/* Practice Filter (header): Level / Variations – bg black 14%, padding 12px 16px; direct child of more-container */
.advanced-stats-header {
  background: var(--bg-header-dark, rgba(0, 0, 0, 0.14));
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: var(--space-3, 12px);
  padding-bottom: var(--space-3, 12px);
  padding-left: 16px;
  padding-right: 16px;
  position: relative;
  flex-shrink: 0;
  width: 100%;
  align-content: stretch;
}
.advanced-stats-header-label {
  position: relative;
  flex-shrink: 0;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  font-style: normal;
  color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
}

/* Variations container – 8 items, gap 8px, padding 12px vertical */
.advanced-stats-variations {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: var(--space-3, 12px);
  padding-bottom: var(--space-3, 12px);
  padding-left: 16px;
  padding-right: 12px;
  position: relative;
  flex-shrink: 0;
  width: 100%;
  align-content: stretch;
  list-style: none;
  margin: 0;
}

/* MasteryLevelItemContainer – row: left (chip + title), counter or lock */
.mastery-level-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-left: 4px;
  padding-right: 4px;
  padding-top: var(--space-0.5, 2px);
  padding-bottom: var(--space-0.5, 2px);
  position: relative;
  width: 100%;
  min-height: 0;
  align-content: stretch;
}
/* Locked row: opacity 0.4, no right padding */
.mastery-level-item--locked {
  opacity: var(--opacity-disabled, 0.4);
  padding-right: 0;
}

/* Left panel: chip + title (flex grow) */
.mastery-level-item-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  position: relative;
  align-content: stretch;
}

/* DS CcChip – layout; aqua only: label color #26C2A3; gray chip uses DS color (no override) */
.mastery-level-item-left :deep(.cc-chip-component) {
  flex-shrink: 0;
}
.mastery-level-item-left :deep(.cc-chip-component.cc-chip-aqua) {
  --chip-translucent-fg: var(--color-aqua-300, #26C2A3);
}
.mastery-level-item-left :deep(.cc-chip-fg),
.mastery-level-item-left :deep(.mastery-level-chip-label) {
  font-family: var(--font-family-system) !important;
  font-size: var(--text-xs, 12px) !important;
  line-height: var(--leading-4, 16px) !important;
}

/* Locked row uses DS CcChip gray translucent; system font via .mastery-level-chip-label below */

/* Lock icon (L7/L8): 20×20, white 40% fill, drop shadow */
.mastery-level-lock {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  width: var(--size-5, 20px);
  height: var(--size-5, 20px);
  opacity: var(--opacity-disabled, 0.4);
}
.mastery-level-lock-icon {
  color: var(--icon-disabled, rgba(255, 255, 255, 0.4));
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}

/* Title (e.g. Keen Learner) */
.mastery-level-title {
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  position: relative;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  font-style: normal;
  white-space: pre-wrap;
  color: rgba(255, 255, 255, 0.5);
}

/* Counter container (right) */
.mastery-level-counter-wrap {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
  align-content: stretch;
}

.mastery-level-counter {
  position: relative;
  flex-shrink: 0;
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  font-style: normal;
  text-align: right;
  font-feature-settings: 'liga' 0;
  color: var(--text-primary, rgba(255, 255, 255, 0.85));
}

/* More button at bottom of expanded panel (becomes "Less", upward chevron) */
.more-btn-wrap-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-1, 4px) 0 var(--space-2, 8px);
  flex-shrink: 0;
  width: 100%;
}

/* Filter panel – Figma node 2-1762: flat “Show All” (light grey text, dark bg, no border, triangle) */
.course-lines-row {
  margin: 0;
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
  background: var(--color-bg-tertiary);
  padding: var(--space-8) var(--space-16);
}

.course-lines-count {
  flex-shrink: 0;
  font-family: var(--font-family-system);
  font-size: 12px;
  line-height: 20px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

/* Frame 238011 – Show All filter/dropdown */
.show-all {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.show-all-label {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.show-all-value {
  appearance: none;
  background: transparent;
  border: none;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}
.show-all-value:focus {
  outline: none;
}
.show-all-value option {
  background: var(--color-bg-secondary);
  color: var(--color-text-default);
}

.show-all-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}

.show-all-icon {
  color: rgba(255, 255, 255, 0.5);
}

/* Sections list – section rows with progress; scroll is on parent .courses-content */
.sections-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.section-item {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Chapter V2 – main container */
.chapter-v2 {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: inherit;
  font-family: var(--font-family-system, system-ui, sans-serif);
  text-align: left;
  cursor: pointer;
  position: relative;
  transition: background 0.15s ease;
}
.chapter-v2:hover,
.chapter-v2[aria-expanded="true"] {
  background: var(--chapter-selected-bg, #353330);
}
/* When video is visible and this chapter is expanded: stick row right under the video; solid subtler look so content doesn’t show through */
.chapter-v2--sticky-under-video {
  position: sticky;
  top: var(--sticky-under-video-top, 270px);
  z-index: 1;
  background: var(--chapter-selected-bg, #353330);
}
.chapter-v2--sticky-under-video:hover,
.chapter-v2--sticky-under-video[aria-expanded="true"] {
  background: var(--chapter-selected-bg, #353330);
}
.chapter-v2:focus-visible {
  outline: 2px solid var(--color-text-link);
  outline-offset: -2px;
}
.chapter-v2-border {
  position: absolute;
  inset: 0;
  border-bottom: 1px solid var(--color-border-subtlest);
  pointer-events: none;
}

/* Progress + Chapter Name container */
.chapter-progress-name {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
}

/* Content: Progress Circle + Chapter title */
.chapter-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
}
.chapter-progress-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}
.chapter-title {
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  transition: color 0.15s ease;
}
.chapter-v2[aria-expanded="true"] .chapter-title {
  color: var(--color-text-bolder);
}

/* Variations + Chevron */
.chapter-variations {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.chapter-count {
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  transition: color 0.15s ease;
}
.chapter-v2[aria-expanded="true"] .chapter-count {
  color: var(--color-text-default);
}
.chapter-chevron-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}
.chapter-chevron {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease;
}
.chapter-v2[aria-expanded="true"] .chapter-chevron {
  transform: rotate(180deg);
}

/* Move Item List – when chapter expanded; 44px row, 52px left indent, checkmark + text + dot */
/* Chapter move list – instant open/close */
.move-list-wrap {
  overflow: hidden;
}
.chapter-moves-enter-active,
.chapter-moves-leave-active {
  transition: none;
}

.move-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.move-item {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  align-content: stretch;
  transition: background 0.15s ease;
  cursor: pointer;
}
.move-item:hover {
  background: var(--bg-hover-subtle, rgba(255, 255, 255, 0.02));
}
.move-item:hover .move-item-content {
  background: var(--bg-hover-subtle, rgba(255, 255, 255, 0.02));
}

.move-item-content {
  flex: 1 0 0;
  height: var(--size-11, 44px);
  min-width: 1px;
  min-height: 1px;
  position: relative;
  display: flex;
  width: 100%;
  transition: background 0.15s ease;
}

.move-item-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: var(--space-1, 4px);
  padding-left: 50px;
  padding-right: var(--space-3, 12px);
  position: relative;
  align-content: stretch;
}

.move-item-plys {
  display: flex;
  flex: 1 0 0;
  gap: 4px;
  align-items: center;
  min-width: 1px;
  min-height: 1px;
  position: relative;
  overflow: hidden;
}

.move-item-check-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--size-5, 20px);
  height: var(--size-5, 20px);
  border-radius: var(--radius-sm, 5px);
  flex-shrink: 0;
}

.move-item-check {
  color: var(--icon-success, #81B64C);
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
  transition: color 0.15s ease;
}
.move-item:hover .move-item-check {
  color: var(--icon-success-hover, #B2E068);
}

/* Move (Uncompleted/Default): dimmed checkmark, no indicator dot */
.move-item--inactive .move-item-check-wrap {
  opacity: 0.5;
}
.move-item--inactive .move-item-check {
  color: rgba(255, 255, 255, 0.4); /* 40% fill × 50% container ≈ 20% effective (--icon-inactive) */
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}
.move-item--inactive:hover .move-item-check {
  color: rgba(255, 255, 255, 0.4); /* keep dimmed on hover */
}

/* Line type layouts – Completed | Uncompleted | Ready (customize per type) */
.move-item--completed {
  /* layout / styling for completed lines (green check + level chip) */
}
.move-item--uncompleted {
  /* layout / styling for uncompleted lines (dimmed check) */
}
.move-item--ready {
  /* layout / styling for ready lines (green check + animated dot) */
}

.move-item-text {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 1 0;
  min-width: 0;
  transition: color 0.15s ease;
}
.move-item:hover .move-item-text {
  color: var(--text-primary-bright, white);
}

/* Completed Default: static L1 (or other level) chip in aqua */
.move-item-level-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.move-item-level-wrap :deep(.cc-chip-component.cc-chip-aqua) {
  --chip-translucent-fg: var(--color-aqua-300, #26C2A3);
}
.move-item-level-wrap :deep(.move-item-level-chip-label) {
  font-family: var(--font-family-system) !important;
}

.move-item-indicator-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--size-5, 20px);
  height: var(--size-5, 20px);
  border-radius: var(--radius-sm, 5px);
  flex-shrink: 0;
}

.move-item-dot {
  width: 6px;
  height: 6px;
  border-radius: 2px;
  background: var(--bg-indicator-mint, #26c2a3);
  flex-shrink: 0;
  transform: scale(0.833); /* 5/6 – visually 5px default */
  transition: background 400ms ease, transform 400ms ease;
}
.move-item:hover .move-item-dot {
  background: var(--bg-indicator-mint-hover, #62f6ca);
  transform: scale(1); /* 6×6 with 2px radius */
}

/* Footer frame – bg/opaque; z 10 so footer stacks above scroll-up icon */
.panel-footer-frame {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  background-color: var(--color-bg-opaque);
}

/* Footer container – overlay 000 14% */
.panel-footer-container {
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 0;
  height: fit-content;
  padding-left: 0;
  padding-right: 0;
  background-color: rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
}
.panel-footer-container > * {
  position: relative;
  z-index: 1;
}

/* Level footer: Practice in / Next Level (Lines page only) */
.extra-data {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 16px 4px;
  margin-top: 4px;
  margin-bottom: 0;
  position: relative;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.extra-data-practice-in {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  min-width: 1px;
  min-height: 1px;
  position: relative;
}

/* Ready (ready lines only): status indicator – circle-check + "Ready for Practice!" (Figma 54-8005) */
.extra-data-ready {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  width: 100%;
  min-width: 0;
  flex: 1 0 0;
}
.extra-data-ready-icon-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-0.5, 2px) var(--space-0.5, 2px) var(--space-0.5, 2px);
  position: relative;
  flex-shrink: 0;
}
.extra-data-ready-icon {
  color: var(--icon-success-mint, #26c2a3);
  flex-shrink: 0;
}
.extra-data-ready-text {
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-sm-plus, 14px);
  line-height: var(--leading-4, 16px);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.72);
  position: relative;
  flex-shrink: 0;
}
.extra-data-label {
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-sm-plus, 14px);
  line-height: var(--leading-4, 16px);
  font-weight: 600;
  color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
  position: relative;
  flex-shrink: 0;
}
/* Practice in chip – DS CcChip with time-clock icon */
.extra-data-time-chip {
  flex-shrink: 0;
}
.extra-data-time-chip :deep(.cc-chip-fg),
.extra-data-time-chip :deep(.extra-data-time-chip-label) {
  font-family: var(--font-family-system, system-ui, sans-serif) !important;
  font-size: var(--text-xs, 12px) !important;
  line-height: var(--leading-4, 16px) !important;
}
.extra-data-next-level {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  position: relative;
  flex-shrink: 0;
  width: fit-content;
}
/* Level / level name: DS text-small-bold (12px / 16px); level name color 72% (DS text/default) */
.extra-data-next-level .extra-data-label {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}
.extra-data-level-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  flex-shrink: 0;
}
/* Level footer CcChip – same as advanced stats (aqua translucent, padding, fonts) */
.extra-data-level-chip :deep(.cc-chip-component) {
  flex-shrink: 0;
}
.extra-data-level-chip :deep(.cc-chip-component.cc-chip-aqua) {
  --chip-translucent-fg: var(--color-aqua-300, #26C2A3);
}
.extra-data-level-chip :deep(.cc-chip-fg),
.extra-data-level-chip :deep(.extra-data-level-chip-label) {
  font-family: var(--font-family-system, system-ui, sans-serif) !important;
  font-size: var(--text-xs, 12px) !important;
  line-height: var(--leading-4, 16px) !important;
}
.extra-data-level-name {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  position: relative;
  flex-shrink: 0;
}

/* Footer sections: Level footer (extra-data), Buttons footer, Icon footer */
.panel-footer {
  flex-shrink: 0;
  position: relative;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.footer-section {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}
/* Buttons footer: Continue / Practice */
.footer-section-actions {
  justify-content: center;
  padding: 12px;
  gap: 16px;
  width: 100%;
  min-width: 0;
  height: 56px;
  margin: 8px 0 0 0;
}

/* Buttons container – column, 12px gap, align start */
.footer-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-width: 0;
  position: relative;
}
.footer-buttons-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
}
.footer-buttons-row-split {
  gap: 8px;
  width: 100%;
}
.footer-buttons-row-full {
  /* single full-width button */
}
.footer-btn-equal {
  flex: 1 0 0;
  min-width: 0;
}
.footer-btn-full {
  flex: 1 0 0;
  width: 100%;
  min-width: 0;
  max-height: 4.8rem;
}
.footer-buttons-row-split > * {
  flex: 1 0 0;
  min-width: 0;
}
.footer-buttons-row-split > * :deep(button) {
  width: 100%;
}
.footer-buttons-row-full > * {
  flex: 1 0 0;
  width: 100%;
  min-width: 0;
}
.footer-buttons-row-full > * :deep(button) {
  width: 100%;
}
/* Icon footer: ellipsis, video, prev/next */
.footer-section-toolbar {
  justify-content: space-between;
  padding: 12px;
  height: 56px;
  margin-left: 0;
  margin-right: 0;
  align-items: flex-start;
}

/* Icons footer – spec: 32×32 button, 20×20 icon, 5px radius, 50% white, drop shadow */
.footer-icon-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0;
}
.footer-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}
.footer-icon-btn:hover .footer-icon {
  color: var(--icon-secondary, rgba(255, 255, 255, 0.72));
}
.footer-icon {
  color: var(--icon-tertiary, rgba(255, 255, 255, 0.5));
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
  transition: color 0.15s ease;
}
/* Prev/next arrows in footer – disabled on ready/uncompleted/chapter; enabled on completed lines */
.footer-section-toolbar .footer-icon-group:last-child .footer-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: default;
}
.footer-section-toolbar .footer-icon-group:last-child .footer-icon-btn:disabled:hover .footer-icon {
  color: var(--icon-tertiary, rgba(255, 255, 255, 0.5));
}

.panel-toolbar-courses {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-8);
}
.panel-toolbar-courses .toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-3);
  background: transparent;
  color: var(--color-icon-default);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.panel-toolbar-courses .toolbar-btn:hover {
  background: var(--color-bg-subtle);
  color: var(--color-text-default);
}
.panel-toolbar-courses .toolbar-nav-arrows {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}


/* Practice All – Primary Large (DS) + badge; uses cc-button-component cc-button-primary cc-button-large cc-bg-primary for all states */
.v6-btn-practice-all-text {
  flex-shrink: 0;
}

/* Badge frame – outer wrapper; left spacing only */
.v6-btn-practice-all-badge-frame {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: var(--space-0.5, 2px);
  position: relative;
  flex-shrink: 0;
}

/* Notification badge – inner pill; shadow on bubble not text */
.v6-btn-practice-all-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: var(--size-4, 16px);
  padding-left: 4px;
  padding-right: 4px;
  position: relative;
  border-radius: 30px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 30px;
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  flex-shrink: 0;
  background: var(--bg-badge-light, rgba(255, 255, 255, 0.72));
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

/* Badge text – heading-label: Chess Sans 12px/16px bold, 0.05em, uppercase */
.v6-btn-practice-all-badge-text {
  position: relative;
  box-sizing: content-box;
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  font-style: normal;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-badge-dark-green, #45753c);
  flex-shrink: 0;
  text-shadow: none;
}


.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-icon {
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

.toolbar-nav {
  display: flex;
  gap: 0.8rem;
}

/* ========== BOARD WRAPPER ========== */
.board-wrapper {
  display: inline-block;
  position: relative;
  border-radius: 3px;
  overflow: visible; /* Allow animation elements to overflow */
}

/* ========== EXPLOSION CIRCLE ========== */
/* Positioned at left edge of panel-content as semicircle */
.explosion-circle {
  position: absolute;
  background: v-bind('animationColor');
  border-radius: 50%;
  /* Position at left edge, dynamically aligned with progress bar center */
  left: 0;
  top: v-bind("explosionTop + 'px'");
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  /* Animation: grow from 36px to 300px, fade out */
  animation: explosion-expand 500ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes explosion-expand {
  0% {
    width: 36px;
    height: 36px;
    opacity: 1;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

/* ========== SKILL HIGHLIGHT ANIMATIONS ========== */
/* Scaled 1.8x for 680px board (85px squares vs original 47px squares) */

/* Skill Highlight Overlay */
.skill-highlight-overlay {
  position: absolute;
  inset: 0;
  background: v-bind('animationColor');
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: skill-overlay-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes skill-overlay-animate {
  /* State 1 → State 2: fade in */
  0% {
    opacity: 0;
  }
  37.5% { /* 300ms */
    opacity: 0.8;
  }
  /* Hold until 500ms (62.5%) */
  62.5% {
    opacity: 0.8;
  }
  /* State 2 → State 3: fade out */
  100% { /* 800ms */
    opacity: 0;
  }
}

/* Skill +1 Icon - same animation as original star, scaled 1.8x */
.skill-plus-icon {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Total: 800ms morph + 50ms pause + 500ms fall = 1350ms */
  animation: skill-plus-animate 1350ms cubic-bezier(0.8, 0, 1, 1) forwards;
}

@keyframes skill-plus-animate {
  /* State 1 (0ms) - centered, faded - 42px */
  0% {
    opacity: 0.1;
    width: 42px;
    height: 42px;
    font-size: 27px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 2 (300ms = 22.2%) - visible, larger - 51px (60% of 85px square) */
  22.2% {
    opacity: 1;
    width: 51px;
    height: 51px;
    font-size: 33px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* Hold State 2 (500ms = 37%) */
  37% {
    opacity: 1;
    width: 51px;
    height: 51px;
    font-size: 33px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 3: shrink into coin position (800ms = 59.3%) */
  59.3% {
    opacity: 1;
    width: 29px;
    height: 29px;
    font-size: 16px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* Hold State 3 - pause before fall (850ms = 63%) */
  63% {
    opacity: 1;
    width: 29px;
    height: 29px;
    font-size: 16px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  /* State 4: fall to target position, rotate -90° (1350ms = 100%) */
  100% {
    opacity: 1;
    width: 29px;
    height: 29px;
    font-size: 16px;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, -50%) rotate(-90deg);
  }
}

/* Skill Label Bubble (transforms from white pill to colored circle, then falls) - scaled 1.8x */
.skill-label-bubble {
  position: absolute;
  left: 90%;
  top: -11px;
  height: 36px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  --coin-color: v-bind('animationColor');
  /* Total: 800ms morph + 50ms pause + 500ms fall = 1350ms */
  animation: skill-pill-animate 1350ms cubic-bezier(0.8, 0, 1, 1) forwards;
}

@keyframes skill-pill-animate {
  /* State 1: centered, faded (0ms) */
  0% {
    opacity: 0;
    top: 50%;
    left: 90%;
    transform: translate(-50%, -50%);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 22.2%) */
  22.2% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* Hold State 2 (500ms = 37%) */
  37% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 3: colored circle (800ms = 59.3%) */
  59.3% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: var(--coin-color);
  }
  /* Hold State 3 - pause before fall (850ms = 63%) */
  63% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: var(--coin-color);
  }
  /* State 4: fall to target position (1350ms = 100%) */
  100% {
    opacity: 1;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: var(--coin-color);
  }
}

/* Text inside the pill - fades out - scaled 1.8x */
.skill-label-text {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 36px;
  color: v-bind('animationColor');
  white-space: nowrap;
  animation: skill-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes skill-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}

/* ========== BRILLIANT HIGHLIGHT ANIMATIONS ========== */
/* Same as skill animation but with teal color and no falling - scaled 1.8x */

/* Brilliant Highlight Overlay (teal color) */
.brilliant-highlight-overlay {
  position: absolute;
  inset: 0;
  background: v-bind('ANIMATION_COLORS.brilliant.overlay');
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: brilliant-overlay-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-overlay-animate {
  0% { opacity: 0; }
  37.5% { opacity: 0.8; }
  62.5% { opacity: 0.8; }
  100% { opacity: 0; }
}

/* Brilliant Icon Wrapper - contains the CcIcon - scaled 1.8x */
.brilliant-icon-wrapper {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
  /* 800ms animation - no falling, stays at final position */
  animation: brilliant-icon-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

/* Brilliant icon fills its container */
.brilliant-icon {
  width: 100% !important;
  height: 100% !important;
  color: white;
}
.brilliant-icon :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  fill: currentColor;
}

@keyframes brilliant-icon-animate {
  /* State 1 (0ms) - centered, faded - 42px */
  0% {
    opacity: 0.1;
    width: 42px;
    height: 42px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 2 (300ms = 37.5%) - centered, visible, 51px (60% of 85px square) */
  37.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 3: in teal coin at top right (800ms = 100%) */
  100% {
    opacity: 1;
    width: 29px;
    height: 29px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%);
  }
}

/* Brilliant Label Bubble (white pill → teal circle, stays on board) - scaled 1.8x */
.brilliant-label-bubble {
  position: absolute;
  left: 90%;
  top: -11px;
  height: 36px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  /* 800ms animation - no falling, stays at final position */
  animation: brilliant-pill-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-pill-animate {
  /* State 1: centered, faded (0ms) */
  0% {
    opacity: 0;
    top: 50%;
    left: 90%;
    transform: translate(-50%, -50%);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 37.5%) */
  37.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 3: teal circle (800ms = 100%) - scaled from 20px to 36px */
  100% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: v-bind('ANIMATION_COLORS.brilliant.coin');
  }
}

/* Text inside the brilliant pill - fades out - scaled 1.8x */
.brilliant-label-text {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 36px;
  color: v-bind('ANIMATION_COLORS.brilliant.textColor');
  white-space: nowrap;
  animation: brilliant-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes brilliant-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}

/* ============================================ */
/* CHECKMATE ANIMATION (copy of brilliant but red, stays on board) */
/* ============================================ */

/* Checkmate Highlight Overlay (red at 80% opacity) */
.checkmate-highlight-overlay {
  position: absolute;
  inset: 0;
  background: v-bind('ANIMATION_COLORS.checkmate.overlay');
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: checkmate-overlay-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes checkmate-overlay-animate {
  0% { opacity: 0; }
  37.5% { opacity: 0.8; }
  62.5% { opacity: 0.8; }
  100% { opacity: 0; }  /* Fades out like brilliant */
}

/* Checkmate Icon Wrapper - contains the king icon - scaled 1.8x */
.checkmate-icon-wrapper {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.25));
  /* 800ms animation - no falling, stays at final position */
  animation: checkmate-icon-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

/* Rotated king icon (defeated/fallen look) */
.checkmate-king-icon {
  transform: rotate(-90deg);
  width: 100% !important;
  height: 100% !important;
}

/* Force fill color on checkmate king SVG */
.checkmate-king-icon :deep(svg),
.checkmate-king-icon :deep(svg path),
.checkmate-king-icon :deep(svg *) {
  fill: v-bind('checkmateIconColor') !important;
  color: v-bind('checkmateIconColor') !important;
  width: 100% !important;
  height: 100% !important;
}

@keyframes checkmate-icon-animate {
  /* State 1 (0ms) - centered, faded - 42px */
  0% {
    opacity: 0.1;
    width: 42px;
    height: 42px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 2 (300ms = 37.5%) - centered, visible, 51px (60% of 85px square) */
  37.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    width: 51px;
    height: 51px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  /* State 3: in red coin at top right (800ms = 100%) */
  100% {
    opacity: 1;
    width: 29px;
    height: 29px;
    top: 7px;
    left: 90%;
    transform: translate(-50%, -50%);
  }
}

/* Checkmate Label Bubble (white pill → red circle, stays on board) - scaled 1.8x */
.checkmate-label-bubble {
  position: absolute;
  left: 90%;
  top: -11px;
  height: 36px;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  /* 800ms animation - no falling, stays at final position */
  animation: checkmate-pill-animate 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes checkmate-pill-animate {
  /* State 1: centered, faded (0ms) */
  0% {
    opacity: 0;
    top: 50%;
    left: 90%;
    transform: translate(-50%, -50%);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 2: at top, visible, white pill (300ms = 37.5%) */
  37.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* Hold State 2 (500ms = 62.5%) */
  62.5% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 200px;
    padding: 0 11px;
    background: white;
  }
  /* State 3: red circle (800ms = 100%) - scaled from 20px to 36px */
  100% {
    opacity: 1;
    top: -11px;
    left: 90%;
    transform: translate(-50%, 0);
    max-width: 36px;
    padding: 0;
    background: v-bind('ANIMATION_COLORS.checkmate.coin');
  }
}

/* Text inside the checkmate pill - fades out - scaled 1.8x */
.checkmate-label-text {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 36px;
  color: v-bind('ANIMATION_COLORS.checkmate.textColor');
  white-space: nowrap;
  animation: checkmate-text-fade 800ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes checkmate-text-fade {
  0% { opacity: 0; }
  37.5% { opacity: 1; }
  62.5% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
