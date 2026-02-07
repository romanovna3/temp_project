<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, provide, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Chess } from 'chess.js'
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

// Version: V2.3 = legacy content (14 sections), V2.4 = real course (7 chapters). Same layout for both.
const route = useRoute()
const isVideoV2_4 = computed(() => route.path === '/learn/v2.4')

// Courses data – V2.3 legacy, V2.4 real course (right panel – Courses view)
const coursesV23 = [
  { id: 1, title: "The Master's Hand: Capablanca's Endgame Technique", instructor: 'GM Alex Colovich', lines: 120, thumbnail: 'course-cover-gotham.png' },
]
const coursesV24 = [
  { id: 1, title: 'Everything You Need to Know About Chess', instructor: 'IM Danny Rensch', lines: 92, thumbnail: 'course-cover-everything.png' },
]
const courses = computed(() => (isVideoV2_4.value ? coursesV24 : coursesV23))

// Lines filter options (label only the value – "Show " is separate)
const linesFilterOptions = [
  { value: 'all', label: 'All' },
]
const linesFilterValue = ref('all')

// Progress under course card – derived from actual section moves (chapters/lines)
const progressLearned = computed(() =>
  courseSections.value.reduce((sum, s) => sum + getSectionChapterProgress(s).completed, 0)
)
const progressTotal = computed(() =>
  courseSections.value.reduce((sum, s) => sum + getSectionChapterProgress(s).total, 0)
)
/** Total number of lines in the course (for "X lines" display). */
const courseTotalLines = computed(() => progressTotal.value)
const progressPercent = computed(() =>
  progressTotal.value > 0 ? Math.min(100, (progressLearned.value / progressTotal.value) * 100) : 0
)

// Mastery bar: level out of 8 sections (fill 3 sections = Level 3)
const masteryLevel = ref(1)
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
  // V2.2 / V2.3: opening another chapter (or closing) pauses the video – play button shows again
  if (isVideoV2_2.value) v22PlayingSectionId.value = null
  if (isVideoV2_3OrV24.value) v23PlayingSectionId.value = null
  const currentlyExpanded = expandedSectionIds.value
  if (currentlyExpanded.has(sectionId)) {
    expandedSectionIds.value = new Set()
  } else {
    expandedSectionIds.value = new Set([sectionId]) // only one chapter open at a time
    // Pin section to top during expand only when needed: skip for short chapters that fit in view (no jump)
    nextTick(() => {
      const container = coursesContentRef.value
      if (!container) return
      const sectionEl = Array.from(container.querySelectorAll('.section-item')).find(
        (el) => el.getAttribute('data-section-id') === sectionId
      )
      if (!sectionEl) return
      const containerRect = container.getBoundingClientRect()
      const sectionRect = sectionEl.getBoundingClientRect()
      const expandable = sectionEl.querySelector('.v23-expandable')
      const expandedContentHeight = expandable ? expandable.scrollHeight : 0
      const spaceBelowHeader = containerRect.bottom - sectionRect.top
      const sectionAlreadyAtTop = sectionRect.top <= containerRect.top + 20
      const contentFitsInView = expandedContentHeight <= spaceBelowHeader
      // Only scroll to pin when section is below the fold and content doesn't fit – avoids jump for short chapters (Welcome, Introduction)
      if (sectionAlreadyAtTop || contentFitsInView) return
      const expandDuration = 360
      const start = performance.now()
      const tick = () => {
        const elapsed = performance.now() - start
        if (elapsed >= expandDuration) return
        const containerRectNow = container.getBoundingClientRect()
        const sectionRectNow = sectionEl.getBoundingClientRect()
        const scrollDelta = sectionRectNow.top - containerRectNow.top
        if (Math.abs(scrollDelta) > 1) container.scrollTop += scrollDelta
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
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
  v3ScrollUpInstantHide.value = true
  v3ShowScrollUp.value = false
  clearV3ScrollUpHideTimer()
  selectedLine.value = { section, move }
  lineViewMoves.value = getMovesForLine(section, move)
  selectedPly.value = { moveIndex: 0, side: 'white' }
  isLineReadMode.value = false
  hoveredChapterLine.value = null
  panelView.value = 'line'
  lineViewVideoFormat.value = 'large' // start large; shrink to small on first scroll when content is scrollable
}
function backToCourses() {
  const line = selectedLine.value
  v3ScrollUpInstantHide.value = false
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

/** Header back button: on line view always go back to chapter (courses) page; works for all line types (info, quiz, completed, ready, uncompleted). */
function onHeaderBackClick() {
  if (panelView.value === 'line') backToCourses()
}

/** V2.3 Line view: prev/next line for headline chevrons; can cross chapter boundaries */
const lineListForNav = computed(() => {
  if (!selectedLine.value?.section) return []
  return getSectionMoves(selectedLine.value.section)
})
const currentLineIndexForNav = computed(() => {
  const { section, move } = selectedLine.value || {}
  if (!move || !section) return -1
  const moves = getSectionMoves(section)
  return moves.findIndex((m) => m.id === move.id)
})
const currentSectionIndexForNav = computed(() => {
  const { section } = selectedLine.value || {}
  if (!section) return -1
  return courseSections.value.findIndex((s) => s.id === section.id)
})
const hasPrevLine = computed(() => {
  const idx = currentLineIndexForNav.value
  const sectionIdx = currentSectionIndexForNav.value
  if (idx < 0 || sectionIdx < 0) return false
  if (idx > 0) return true
  return sectionIdx > 0
})
const hasNextLine = computed(() => {
  const idx = currentLineIndexForNav.value
  const list = lineListForNav.value
  const sectionIdx = currentSectionIndexForNav.value
  if (idx < 0 || sectionIdx < 0) return false
  if (idx < list.length - 1) return true
  return sectionIdx < courseSections.value.length - 1
})
function goToPrevLine() {
  if (!hasPrevLine.value || !selectedLine.value) return
  const { section } = selectedLine.value
  const moves = getSectionMoves(section)
  const idx = currentLineIndexForNav.value
  if (idx > 0) {
    openLine(section, moves[idx - 1])
    return
  }
  const sectionIdx = currentSectionIndexForNav.value
  if (sectionIdx > 0) {
    const prevSection = courseSections.value[sectionIdx - 1]
    const prevMoves = getSectionMoves(prevSection)
    if (prevMoves.length) openLine(prevSection, prevMoves[prevMoves.length - 1])
  }
}
function goToNextLine() {
  if (!hasNextLine.value || !selectedLine.value) return
  const { section } = selectedLine.value
  const moves = getSectionMoves(section)
  const idx = currentLineIndexForNav.value
  if (idx < moves.length - 1) {
    openLine(section, moves[idx + 1])
    return
  }
  const sectionIdx = currentSectionIndexForNav.value
  if (sectionIdx >= 0 && sectionIdx < courseSections.value.length - 1) {
    const nextSection = courseSections.value[sectionIdx + 1]
    const nextMoves = getSectionMoves(nextSection)
    if (nextMoves.length) openLine(nextSection, nextMoves[0])
  }
}

// Line view: chess moves shown on the Line page. Key = `${section.id}-${move.id}` (baseId for -2 sections).
// Each line has a distinct sequence so hover previews are visually different within a chapter.
const lineMovesByKey = {
  // Introduction (3 lines)
  'intro-1': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'Bc5' },
    { number: 4, white: 'c3', black: 'Nf6' },
  ],
  'intro-2': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
  ],
  'intro-3': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'd6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'Nf6' },
  ],
  // Tactical (10 lines)
  'tactical-1': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Nxe5', black: 'Nxe5' },
    { number: 5, white: 'd4', black: 'Nd3+' },
  ],
  'tactical-2': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Bc4', black: 'Nc6' },
    { number: 3, white: 'Qh5', black: 'Nf6' },
    { number: 4, white: 'Qxf7', black: '#' },
  ],
  'tactical-3': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
  ],
  'tactical-4': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
  ],
  'tactical-5': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'e6' },
  ],
  'tactical-6': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'g6' },
    { number: 3, white: 'Nc3', black: 'Bg7' },
    { number: 4, white: 'e4', black: 'd6' },
  ],
  'tactical-7': [
    { number: 1, white: 'e4', black: 'e6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
  ],
  'tactical-8': [
    { number: 1, white: 'c4', black: 'e5' },
    { number: 2, white: 'Nc3', black: 'Nf6' },
    { number: 3, white: 'Nf3', black: 'Nc6' },
    { number: 4, white: 'g3', black: 'Bb4' },
  ],
  'tactical-9': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'c6' },
    { number: 3, white: 'Nf3', black: 'Nf6' },
    { number: 4, white: 'Nc3', black: 'dxc4' },
  ],
  'tactical-10': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nf6' },
    { number: 3, white: 'Nxe5', black: 'd6' },
    { number: 4, white: 'Nf3', black: 'Nxe4' },
  ],
  // Additional Tactics (3 lines)
  'additional-1': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'd6' },
    { number: 3, white: 'd4', black: 'Bg4' },
    { number: 4, white: 'dxe5', black: 'Nc6' },
  ],
  'additional-2': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
  ],
  'additional-3': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Bb4' },
    { number: 4, white: 'e3', black: 'O-O' },
  ],
  // Games (18 lines) – varied openings
  'games-1': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'd6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'Nf6' },
  ],
  'games-2': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nf3', black: 'd5' },
    { number: 4, white: 'Nc3', black: 'Be7' },
  ],
  'games-3': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
  ],
  'games-4': [
    { number: 1, white: 'e4', black: 'e6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nd2', black: 'c5' },
    { number: 4, white: 'exd5', black: 'exd5' },
  ],
  'games-5': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
  ],
  'games-6': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nf6' },
    { number: 3, white: 'Nxe5', black: 'd6' },
    { number: 4, white: 'Nf3', black: 'Nxe4' },
  ],
  'games-7': [
    { number: 1, white: 'c4', black: 'Nf6' },
    { number: 2, white: 'Nc3', black: 'e5' },
    { number: 3, white: 'Nf3', black: 'Nc6' },
    { number: 4, white: 'e3', black: 'Bb4' },
  ],
  'games-8': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'g6' },
    { number: 3, white: 'Nc3', black: 'Bg7' },
    { number: 4, white: 'e4', black: 'd6' },
  ],
  'games-9': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'e6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'Nc6' },
  ],
  'games-10': [
    { number: 1, white: 'Nf3', black: 'd5' },
    { number: 2, white: 'd4', black: 'Nf6' },
    { number: 3, white: 'c4', black: 'e6' },
    { number: 4, white: 'Nc3', black: 'Be7' },
  ],
  'games-11': [
    { number: 1, white: 'e4', black: 'c6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nc3', black: 'dxe4' },
    { number: 4, white: 'Nxe4', black: 'Bf5' },
  ],
  'games-12': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nf3', black: 'Bb4' },
    { number: 4, white: 'Nc3', black: 'O-O' },
  ],
  'games-13': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'Nf6' },
    { number: 4, white: 'Ng5', black: 'd5' },
  ],
  'games-14': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'c6' },
    { number: 3, white: 'Nf3', black: 'Nf6' },
    { number: 4, white: 'Nc3', black: 'e6' },
  ],
  'games-15': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'Nf6' },
    { number: 4, white: 'O-O', black: 'Nxe4' },
  ],
  'games-16': [
    { number: 1, white: 'c4', black: 'e5' },
    { number: 2, white: 'Nc3', black: 'Nf6' },
    { number: 3, white: 'Nf3', black: 'Nc6' },
    { number: 4, white: 'g3', black: 'd5' },
  ],
  'games-17': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'd4', black: 'exd4' },
    { number: 4, white: 'Bc4', black: 'Bc5' },
  ],
  'games-18': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'Nf3', black: 'Nf6' },
    { number: 3, white: 'c4', black: 'e6' },
    { number: 4, white: 'Nc3', black: 'c6' },
  ],
  // Other / Opening Repertoire (10 lines)
  'other-1': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'e6' },
  ],
  'other-2': [
    { number: 1, white: 'e4', black: 'e6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'dxe4' },
  ],
  'other-3': [
    { number: 1, white: 'e4', black: 'c6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nc3', black: 'dxe4' },
    { number: 4, white: 'Nxe4', black: 'Nd7' },
  ],
  'other-4': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
  ],
  'other-5': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
  ],
  'other-6': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'g6' },
    { number: 3, white: 'Nc3', black: 'Bg7' },
    { number: 4, white: 'e4', black: 'd6' },
  ],
  'other-7': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'c6' },
    { number: 3, white: 'Nf3', black: 'Nf6' },
    { number: 4, white: 'Nc3', black: 'e6' },
  ],
  'other-8': [
    { number: 1, white: 'c4', black: 'e5' },
    { number: 2, white: 'Nc3', black: 'Nf6' },
    { number: 3, white: 'Nf3', black: 'Nc6' },
    { number: 4, white: 'g3', black: 'Bb4' },
  ],
  'other-9': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'g3', black: 'd5' },
    { number: 4, white: 'Nf3', black: 'Be7' },
  ],
  'other-10': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Bb4' },
    { number: 4, white: 'e3', black: 'O-O' },
  ],
  // Blackmar-Diemer (20 lines)
  'blackmar-1': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'dxe4' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'f3', black: 'exf3' },
  ],
  'blackmar-2': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'e5' },
    { number: 3, white: 'dxe5', black: 'd4' },
    { number: 4, white: 'Nf3', black: 'Nc6' },
  ],
  'blackmar-3': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'e6' },
    { number: 3, white: 'Nd2', black: 'c5' },
    { number: 4, white: 'exd5', black: 'exd5' },
  ],
  'blackmar-4': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'dxe4' },
    { number: 3, white: 'Nc3', black: 'Nc6' },
    { number: 4, white: 'Bc4', black: 'Nf6' },
  ],
  'blackmar-5': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'dxe4' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'f3', black: 'Nc6' },
  ],
  'blackmar-6': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'Nf3', black: 'd5' },
    { number: 3, white: 'e3', black: 'e6' },
    { number: 4, white: 'Bd3', black: 'c5' },
  ],
  'blackmar-7': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'Bc5' },
    { number: 4, white: 'b4', black: 'Bxb4' },
  ],
  'blackmar-8': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'g6' },
    { number: 3, white: 'Nc3', black: 'Bg7' },
    { number: 4, white: 'Nf3', black: 'Nf6' },
  ],
  'blackmar-9': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'Nf6' },
    { number: 4, white: 'd3', black: 'd6' },
  ],
  'blackmar-10': [
    { number: 1, white: 'c4', black: 'Nf6' },
    { number: 2, white: 'Nc3', black: 'e5' },
    { number: 3, white: 'Nf3', black: 'Nc6' },
    { number: 4, white: 'e3', black: 'Bb4' },
  ],
  'blackmar-11': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'dxe4' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Nc6' },
  ],
  'blackmar-12': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'c3', black: 'd5' },
    { number: 3, white: 'exd5', black: 'Qxd5' },
    { number: 4, white: 'd4', black: 'Nc6' },
  ],
  'blackmar-13': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Bb4' },
    { number: 4, white: 'Qc2', black: 'O-O' },
  ],
  'blackmar-14': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Nbd7' },
  ],
  'blackmar-15': [
    { number: 1, white: 'e4', black: 'e6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nd2', black: 'Nf6' },
    { number: 4, white: 'e5', black: 'Nfd7' },
  ],
  'blackmar-16': [
    { number: 1, white: 'Nf3', black: 'd5' },
    { number: 2, white: 'd4', black: 'Nf6' },
    { number: 3, white: 'c4', black: 'e6' },
    { number: 4, white: 'Nc3', black: 'Be7' },
  ],
  'blackmar-17': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'Nf6' },
    { number: 4, white: 'd3', black: 'Be7' },
  ],
  'blackmar-18': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'Nf3', black: 'Nf6' },
    { number: 3, white: 'c4', black: 'c6' },
    { number: 4, white: 'Qb3', black: 'dxc4' },
  ],
  'blackmar-19': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Bc4', black: 'Nc6' },
    { number: 3, white: 'Qh5', black: 'Nf6' },
    { number: 4, white: 'Qxe5+', black: 'Be7' },
  ],
  'blackmar-20': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'e4', black: 'dxe4' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'f3', black: 'exf3' },
  ],
  // Quiz (2 lines)
  'quiz-1': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
    { number: 5, white: 'O-O', black: 'Be7' },
  ],
  'quiz-2': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Bb4' },
    { number: 4, white: 'e3', black: 'O-O' },
  ],
  'learning-the-game-1': [
    { number: 1, white: 'Qh3', black: '' },
  ],
  'learning-the-game-2': [
    { number: 1, white: 'Qd8', black: '' },
  ],
  'learning-the-game-3': [
    { number: 1, white: 'Qh8', black: '' },
  ],
  'learning-the-game-4': [
    { number: 1, white: 'Qd5', black: '' },
  ],
  'learning-the-game-5': [
    { number: 1, white: 'Qa2', black: '' },
  ],
  'learning-the-game-6': [
    { number: 1, white: 'Qf7', black: '' },
  ],
  'learning-the-game-7': [
    { number: 1, white: 'Re8', black: '' },
    { number: 2, white: 'Ra8', black: '' },
    { number: 3, white: 'Ra4', black: '' },
    { number: 4, white: 'Re4', black: '' },
  ],
  'learning-the-game-8': [
    { number: 1, white: 'Rc7', black: '' },
  ],
  'learning-the-game-9': [
    { number: 1, white: 'Ba4', black: '' },
    { number: 2, white: 'Be8', black: '' },
    { number: 3, white: 'Bf7', black: '' },
    { number: 4, white: 'Bd5', black: '' },
  ],
  'learning-the-game-10': [
    { number: 1, white: 'Be5', black: '' },
  ],
  'learning-the-game-11': [
    { number: 1, white: 'Qa8', black: '' },
    { number: 2, white: 'Qa1', black: '' },
    { number: 3, white: 'Qg7', black: '' },
    { number: 4, white: 'Qg4', black: '' },
    { number: 5, white: 'Qd4', black: '' },
  ],
  'learning-the-game-12': [
    { number: 1, white: 'Qa2', black: '' },
  ],
  'learning-the-game-13': [
    { number: 1, white: 'Nc6', black: '' },
    { number: 2, white: 'Nb4', black: '' },
  ],
  'learning-the-game-14': [
    { number: 1, white: 'Nc6', black: '' },
    { number: 2, white: 'Nd4', black: '' },
    { number: 2, white: 'Ne5', black: '' },
    { number: 2, white: 'Ne7', black: '' },
    { number: 2, white: 'Nd8', black: '' },
    { number: 2, white: 'Nb8', black: '' },
    { number: 2, white: 'Na7', black: '' },
    { number: 2, white: 'Na5', black: '' },
    { number: 2, white: 'Nb4', black: '' },
  ],
  'learning-the-game-15': [
    { number: 1, white: 'Ke5', black: '' },
    { number: 2, white: 'Kd6', black: '' },
    { number: 3, white: 'Kd5', black: '' },
    { number: 4, white: 'Kc4', black: '' },
    { number: 5, white: 'Kd4', black: '' },
  ],
  'learning-the-game-16': [
    { number: 1, white: 'Ke3', black: '' },
    { number: 1, white: 'Ke2', black: '' },
    { number: 1, white: 'Kf2', black: '' },
    { number: 1, white: 'Kf4', black: '' },
  ],
  'learning-the-game-17': [
    { number: 1, white: 'exd5', black: '' },
    { number: 2, white: 'd6', black: '' },
    { number: 3, white: 'a4', black: '' },
  ],
  'learning-the-game-18': [
    { number: 1, white: 'd5', black: '' },
  ],
  'learning-the-game-19': [
    { number: 1, white: 'exf5', black: '' },
  ],
  'learning-the-game-20': [
    { number: 1, white: 'e8=Q', black: '' },
  ],
  'the-opening-1': [
    { number: 1, white: 'e4', black: '' },
    { number: 2, white: 'd4', black: '' },
    { number: 3, white: 'Nf3', black: '' },
    { number: 4, white: 'Nc3', black: '' },
    { number: 5, white: 'Nc4', black: '' },
    { number: 6, white: 'Bf4', black: '' },
    { number: 7, white: 'Qe2', black: '' },
    { number: 8, white: 'O-O-O', black: '' },
  ],
  'the-opening-2': [
    { number: 1, white: 'e4', black: '' },
    { number: 2, white: 'd4', black: '' },
    { number: 3, white: 'Nf3', black: '' },
    { number: 4, white: 'Nc3', black: '' },
    { number: 5, white: 'Bc4', black: '' },
    { number: 6, white: 'Bf4', black: '' },
    { number: 7, white: 'Qe2', black: '' },
    { number: 8, white: 'O-O-O', black: '' },
  ],
  'the-opening-3': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bc4', black: 'Bb4' },
    { number: 5, white: 'd3', black: 'd6' },
    { number: 6, white: 'Bg5', black: 'O-O' },
    { number: 7, white: 'O-O', black: '' },
  ],
  'the-opening-4': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'd6' },
  ],
  'the-opening-5': [
    { number: 1, white: 'e4', black: 'd5' },
    { number: 2, white: 'exd5', black: 'Qxd5' },
    { number: 3, white: 'Nc3', black: 'Qc6' },
    { number: 4, white: 'Bb5', black: '' },
  ],
  'the-opening-6': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'Nf6' },
    { number: 4, white: 'O-O', black: '' },
  ],
  'the-opening-7': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
    { number: 5, white: 'e3', black: 'O-O' },
    { number: 6, white: 'Nf3', black: '' },
  ],
  'the-opening-8': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Qh5', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'g6' },
    { number: 4, white: 'Qf3', black: 'Nf6' },
    { number: 5, white: 'g4', black: 'd5' },
    { number: 6, white: 'exd5', black: 'Nd4' },
    { number: 7, white: 'Qd1', black: 'Bxg4' },
    { number: 8, white: 'Ne2', black: 'Nf3+' },
    { number: 9, white: 'Kf1', black: 'Bh3#' },
  ],
  'the-opening-9': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Qh5', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'g6' },
    { number: 4, white: 'Qf3', black: 'Nf6' },
    { number: 5, white: 'g4', black: 'd5' },
    { number: 6, white: 'exd5', black: 'Nd4' },
    { number: 7, white: 'Qd1', black: 'Bxg4' },
    { number: 8, white: 'Ne2', black: 'Nf3+' },
    { number: 9, white: 'Kf1', black: 'Bh3#' },
  ],
  'the-opening-10': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bc4', black: 'Bb4' },
    { number: 5, white: 'd3', black: 'd6' },
    { number: 6, white: 'Bg5', black: 'O-O' },
    { number: 7, white: 'O-O', black: '' },
  ],
  'the-opening-11': [
    { number: 1, white: 'e4', black: 'd5' },
    { number: 2, white: 'exd5', black: 'Qxd5' },
    { number: 3, white: 'Nc3', black: 'Qc6' },
    { number: 4, white: 'Bb5', black: '' },
  ],
  'the-opening-12': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
    { number: 5, white: 'e3', black: 'O-O' },
    { number: 6, white: 'Nf3', black: '' },
  ],
  'tactics-strategy-1': [
    { number: 1, white: 'Rf7', black: '' },
  ],
  'tactics-strategy-2': [
    { number: 1, white: 'Ne7+', black: 'Kf7' },
    { number: 2, white: 'Nxc8', black: '' },
  ],
  'tactics-strategy-3': [
    { number: 1, white: 'Bb5', black: '' },
  ],
  'tactics-strategy-4': [
    { number: 1, white: 'Bg5', black: 'Nd5' },
    { number: 2, white: 'Bxd8', black: '' },
  ],
  'tactics-strategy-5': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: '' },
  ],
  'tactics-strategy-6': [
    { number: 1, white: 'Re1+', black: 'Kd4' },
    { number: 2, white: 'Rxe8', black: '' },
  ],
  'tactics-strategy-7': [
    { number: 1, white: 'Re1', black: 'Qg6' },
    { number: 2, white: 'Rxe8#', black: '' },
  ],
  'tactics-strategy-8': [
    { number: 1, white: 'a8=Q+', black: 'Kf4' },
    { number: 2, white: 'Qxh1', black: '' },
  ],
  // The Endgame (14 lines) – each with a different move sequence
  'the-endgame-1': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bc4', black: 'Bc5' },
    { number: 4, white: 'c3', black: 'Nf6' },
  ],
  'the-endgame-2': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Bg5', black: 'Be7' },
  ],
  'the-endgame-3': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'd6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'Nf6' },
  ],
  'the-endgame-4': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Nc3', black: 'Nf6' },
    { number: 4, white: 'Nxe5', black: 'Nxe5' },
    { number: 5, white: 'd4', black: 'Nd3+' },
  ],
  'the-endgame-5': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'e6' },
    { number: 3, white: 'Nf3', black: 'd5' },
    { number: 4, white: 'Nc3', black: 'Be7' },
  ],
  'the-endgame-6': [
    { number: 1, white: 'e4', black: 'e6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nd2', black: 'c5' },
    { number: 4, white: 'exd5', black: 'exd5' },
  ],
  'the-endgame-7': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'Bb5', black: 'a6' },
    { number: 4, white: 'Ba4', black: 'Nf6' },
  ],
  'the-endgame-8': [
    { number: 1, white: 'c4', black: 'Nf6' },
    { number: 2, white: 'Nc3', black: 'e5' },
    { number: 3, white: 'Nf3', black: 'Nc6' },
    { number: 4, white: 'e3', black: 'Bb4' },
  ],
  'the-endgame-9': [
    { number: 1, white: 'd4', black: 'd5' },
    { number: 2, white: 'c4', black: 'c6' },
    { number: 3, white: 'Nf3', black: 'Nf6' },
    { number: 4, white: 'Nc3', black: 'dxc4' },
  ],
  'the-endgame-10': [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'Nc6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4', black: 'e6' },
  ],
  'the-endgame-11': [
    { number: 1, white: 'Nf3', black: 'd5' },
    { number: 2, white: 'd4', black: 'Nf6' },
    { number: 3, white: 'c4', black: 'e6' },
    { number: 4, white: 'Nc3', black: 'Be7' },
  ],
  'the-endgame-12': [
    { number: 1, white: 'e4', black: 'e5' },
    { number: 2, white: 'Nf3', black: 'Nf6' },
    { number: 3, white: 'Nxe5', black: 'd6' },
    { number: 4, white: 'Nf3', black: 'Nxe4' },
  ],
  'the-endgame-13': [
    { number: 1, white: 'd4', black: 'Nf6' },
    { number: 2, white: 'c4', black: 'g6' },
    { number: 3, white: 'Nc3', black: 'Bg7' },
    { number: 4, white: 'e4', black: 'd6' },
  ],
  'the-endgame-14': [
    { number: 1, white: 'e4', black: 'c6' },
    { number: 2, white: 'd4', black: 'd5' },
    { number: 3, white: 'Nc3', black: 'dxe4' },
    { number: 4, white: 'Nxe4', black: 'Bf5' },
  ],
  'bringing-it-together-2': [
    { number: 1, white: 'd4', black: '' },
  ],
  'bringing-it-together-3': [
    { number: 1, white: 'c5', black: '' },
  ],
  'bringing-it-together-4': [
    { number: 1, white: 'Bc5', black: '' },
  ],
}
const defaultLineMoves = [
  { number: 1, white: 'e4', black: 'e5' },
  { number: 2, white: 'Nf3', black: 'Nc6' },
  { number: 3, white: 'Bb5', black: 'a6' },
]
function getMovesForLine(section, move) {
  if (!section?.id || !move?.id) return defaultLineMoves
  const baseId = String(section.id).replace(/-2$/, '')
  const key = `${baseId}-${move.id}`
  return lineMovesByKey[key] ?? defaultLineMoves
}
const lineViewMoves = ref([...defaultLineMoves])
const selectedPly = ref({ moveIndex: 0, side: 'white' })

/** Chapter page: hovered line for board preview (only for non-ready lines; ready = hidden). */
const hoveredChapterLine = ref(null) // { section, move } | null

/** Build FEN and lastMove for the position *after* the selected ply (selected = this move is highlighted; show board after it). */
function getPositionAfterPly(moves, selectedPlyVal) {
  try {
    const flat = []
    for (const pair of moves) {
      if (pair.white) flat.push(pair.white)
      if (pair.black && pair.black !== '#') flat.push(pair.black)
    }
    // Selected ply = "this move is visible" → show position after that move (1 half-move for white, 2 for black in that pair)
    const halfCount = selectedPlyVal.moveIndex * 2 + (selectedPlyVal.side === 'white' ? 1 : 2)
    const chess = new Chess()
    let lastMove = null
    for (let i = 0; i < halfCount && i < flat.length; i++) {
      const result = chess.move(flat[i])
      if (result) lastMove = { from: result.from, to: result.to }
    }
    return { fen: chess.fen(), lastMove }
  } catch {
    return { fen: STARTING_FEN, lastMove: null }
  }
}

/** Position at end of a line (for chapter-page hover preview). */
function getPositionAtEndOfLine(moves) {
  if (!moves?.length) return { fen: STARTING_FEN, lastMove: null }
  const last = moves[moves.length - 1]
  const side = last?.black && last?.black !== '#' ? 'black' : 'white'
  return getPositionAfterPly(moves, { moveIndex: moves.length - 1, side })
}

function setHoveredChapterLine(section, move) {
  if (!section || !move) {
    hoveredChapterLine.value = null
    return
  }
  if (getLineType(move) === 'ready') return // hidden moves – don't preview
  hoveredChapterLine.value = { section, move }
}

function clearHoveredChapterLine() {
  hoveredChapterLine.value = null
}

function isPlySelected(moveIndex, side) {
  return selectedPly.value.moveIndex === moveIndex && selectedPly.value.side === side
}
function selectPly(moveIndex, side) {
  selectedPly.value = { moveIndex, side }
}
/** Handle click on inline move notation in body/caption HTML (event delegation). */
function onInlinePlyChipClick(event) {
  const target = event.target
  if (!target) return
  const el = target.nodeType === 1 ? target : target.parentElement
  const chip = el?.closest?.('.inline-ply-chip')
  if (!chip || !lineViewMoves.value?.length) return
  event.preventDefault()
  event.stopPropagation()
  const move = chip.getAttribute('data-move')
  if (!move) return
  const moves = lineViewMoves.value
  for (let idx = 0; idx < moves.length; idx++) {
    const pair = moves[idx]
    if (pair.white === move) {
      selectPly(idx, 'white')
      return
    }
    if (pair.black && pair.black === move) {
      selectPly(idx, 'black')
      return
    }
  }
}
function selectNextPly() {
  const moves = lineViewMoves.value
  if (!moves?.length) return
  const { moveIndex, side } = selectedPly.value
  const pair = moves[moveIndex]
  if (side === 'white') {
    if (pair && pair.black) {
      selectedPly.value = { moveIndex, side: 'black' }
    } else if (moveIndex + 1 < moves.length) {
      selectedPly.value = { moveIndex: moveIndex + 1, side: 'white' }
    }
  } else if (moveIndex + 1 < moves.length) {
    selectedPly.value = { moveIndex: moveIndex + 1, side: 'white' }
  }
}

/** True if there is a next ply within the current line (so Next chevron can advance ply). Only counts plies that exist (e.g. no "black" if the pair has no black move). */
function hasNextPlyInLine() {
  const moves = lineViewMoves.value
  if (!moves?.length) return false
  const { moveIndex, side } = selectedPly.value
  const pair = moves[moveIndex]
  if (side === 'white') {
    if (pair && pair.black) return true
    return moveIndex + 1 < moves.length
  }
  return moveIndex + 1 < moves.length
}

/** True if there is a previous ply within the current line (so Previous chevron can go back one ply). */
function hasPreviousPlyInLine() {
  const moves = lineViewMoves.value
  if (!moves?.length) return false
  const { moveIndex, side } = selectedPly.value
  if (side === 'black') return true
  return moveIndex > 0
}

function onFooterNextClick() {
  if (panelView.value !== 'line') {
    nextQuestion()
    return
  }
  if (hasNextPlyInLine()) selectNextPly()
}

function selectPreviousPly() {
  const moves = lineViewMoves.value
  if (!moves?.length) return
  const { moveIndex, side } = selectedPly.value
  if (side === 'black') {
    selectedPly.value = { moveIndex, side: 'white' }
  } else if (moveIndex > 0) {
    const prevPair = moves[moveIndex - 1]
    selectedPly.value = {
      moveIndex: moveIndex - 1,
      side: prevPair && prevPair.black ? 'black' : 'white',
    }
  }
}

/** Chapter (line) counts for a section – derived from actual moves so progress bar and counter match. */
function getSectionChapterProgress(section) {
  const moves = getSectionMoves(section)
  const total = moves.length
  const completed = moves.filter((m) => m.completed).length
  return { completed, total }
}

/** Chapter counter display e.g. "2/3" for use in template (single call per section). */
function getSectionChapterCountDisplay(section) {
  const { completed, total } = getSectionChapterProgress(section)
  return `${completed}/${total}`
}

/** Progress % for a section (0–100), used by the circular progress bar on each row. */
function getSectionProgressPercent(section) {
  const { completed, total } = getSectionChapterProgress(section)
  if (!total) return 0
  return Math.min(100, (completed / total) * 100)
}

// Move items (Move Item List) – shown when chapter is expanded
// 3 line types for layout/styling: completed | uncompleted | ready
function getLineType(move) {
  if (move?.info) return 'info'
  if (!move?.completed) return 'uncompleted'
  return move.level ? 'completed' : 'ready'
}

// Line view screen type: completed vs ready vs uncompleted (separate designs, don’t mix)
const currentLineType = computed(() => {
  if (panelView.value !== 'line' || !selectedLine.value?.move) return 'completed'
  return getLineType(selectedLine.value.move)
})

/** Uncompleted lines: hand-with-pawn icon – white when White to move, black when Black to move; deterministic per line so icons vary across lines. */
const uncompletedLineCoachIcon = computed(() => {
  if (panelView.value !== 'line' || currentLineType.value !== 'uncompleted') return 'play-white.png'
  const moves = lineViewMoves.value
  const sideToMove = !moves?.length
    ? 'white'
    : (moves[moves.length - 1]?.black && moves[moves.length - 1].black !== '#')
      ? 'white'
      : 'black'
  return sideToMove === 'white' ? 'play-white.png' : 'play-black.png'
})

/** Ready lines: hand-with-pawn icon – same as uncompleted (white when White to move, black when Black to move). */
const readyLineCoachIcon = computed(() => {
  if (panelView.value !== 'line' || currentLineType.value !== 'ready') return 'play-white.png'
  const moves = lineViewMoves.value
  const sideToMove = !moves?.length
    ? 'white'
    : (moves[moves.length - 1]?.black && moves[moves.length - 1].black !== '#')
      ? 'white'
      : 'black'
  return sideToMove === 'white' ? 'play-white.png' : 'play-black.png'
})

/** V2.3 Line view: course name for header (line name moves to VariationsHeadline row) */
const currentCourseTitle = computed(() => courses.value[0]?.title ?? 'Course')

// 3 states: Uncompleted (dimmed check) | Ready (green check + animated dot) | Completed (green check + level chip e.g. L1)
// Placeholder line titles until real lines are provided; keyed by section id, counts match course structure.
function buildPlaceholderMoves(total) {
  return Array.from({ length: total }, (_, i) => ({
    id: String(i + 1),
    text: `Line ${i + 1}`,
    completed: false,
  }))
}

// V2.4: real course – 7 chapters, real line titles from course curriculum
const sectionMovesV24 = {
  intro: [
    { id: '1', text: 'Introduction', completed: true, info: true },
  ],
  'learning-the-game': [
    { id: '1', text: 'Learning the Board: Ranks', completed: true, quiz: true, level: 'L2' },
    { id: '2', text: 'Learning the Board: Files', completed: true, quiz: true, level: 'L2' },
    { id: '3', text: 'Learning the Board: Diagonals', completed: true, quiz: true, level: 'L2' },
    { id: '4', text: 'Getting to Know the Squares #1', completed: true, quiz: true, level: 'L2' },
    { id: '5', text: 'Getting to Know the Squares #2', completed: true, quiz: true, level: 'L2' },
    { id: '6', text: 'Getting to Know the Squares #3', completed: true, quiz: true, level: 'L2' },
    { id: '7', text: 'Meet the Rook', completed: true, info: true, level: 'L2' },
    { id: '8', text: 'Meet the Rook - Practice', completed: true, quiz: true, level: 'L1' },
    { id: '9', text: 'Meet the Bishop', completed: true, info: true, level: 'L1' },
    { id: '10', text: 'Meet the Bishop - Practice', completed: true, quiz: true, level: 'L1' },
    { id: '11', text: 'Meet the Queen', completed: true, info: true, level: 'L1' },
    { id: '12', text: 'Meet the Queen - Practice', completed: true, quiz: true, nextLevel: 'L1' },
    { id: '13', text: 'Meet the Knight', completed: true, info: true, nextLevel: 'L1' },
    { id: '14', text: 'Meet the Knight - Practice', completed: true, quiz: true, nextLevel: 'L1' },
    { id: '15', text: 'Meet the King', completed: true, info: true, nextLevel: 'L1' },
    { id: '16', text: 'Meet the King - Practice', completed: true, quiz: true, nextLevel: 'L1' },
    { id: '17', text: 'Meet the Pawn', completed: true, info: true },
    { id: '18', text: 'Meet the Pawn - Practice #1', completed: true, quiz: true },
    { id: '19', text: 'Meet the Pawn - Practice #2', completed: true, quiz: true },
    { id: '20', text: 'Pawn Promotion', completed: true, quiz: true },
  ],
  'the-opening': [
    { id: '1', text: 'The Dream Opening', completed: true, info: true },
    { id: '2', text: 'The Dream Opening - Practice', completed: true, quiz: true },
    { id: '3', text: 'The Dream Opening (Both Colors)', completed: true, info: true },
    { id: '4', text: "Danny's Ten Opening Rules", completed: true, info: true },
    { id: '5', text: 'Leave the Queen at Home!', completed: true },
    { id: '6', text: 'Early Castling in the Ruy Lopez', completed: true },
    { id: '7', text: "Learn the Queen's Gambit", completed: true },
    { id: '8', text: "Don't Try Scholar's Mate!", completed: true },
    { id: '9', text: 'Breaking Principles When Necessary', completed: true },
    { id: '10', text: 'Review #1', completed: false },
    { id: '11', text: 'Review #2', completed: false },
    { id: '12', text: 'Review #3', completed: false },
  ],
  'tactics-strategy': [
    { id: '1', text: 'Tactics: Double Attack #1', completed: false },
    { id: '2', text: 'Tactics: Double Attack #2', completed: false },
    { id: '3', text: 'Tactics: Absolute Pin', completed: false },
    { id: '4', text: 'Tactics: Relative Pin', completed: false },
    { id: '5', text: "Tactics: Relative Pin in the Queen's Gambit", completed: false },
    { id: '6', text: 'Tactics: Skewer', completed: false },
    { id: '7', text: 'Tactics: A Deadly Rook Skewer', completed: false },
    { id: '8', text: 'Tactics: Skewer - The Infamous Endgame Skewer', completed: false },
  ],
  'the-endgame': [
    { id: '1', text: 'Endgame Checkmates: Ladder Mate', completed: false },
    { id: '2', text: 'Endgame Checkmates: The Queen Checkmate', completed: false },
    { id: '3', text: 'Endgame Checkmates: The Rook Mate', completed: false, info: true },
    { id: '4', text: 'The Rook Mate - Practice', completed: false },
    { id: '5', text: 'Pawn Promotion: King on the 6th #1', completed: false },
    { id: '6', text: 'Pawn Promotion: King on the 6th #2', completed: false },
    { id: '7', text: 'Passed Pawns', completed: false, info: true },
    { id: '8', text: 'Outside Passed Pawns', completed: false, info: true },
    { id: '9', text: 'Outside Passed Pawns #2', completed: false, info: true },
    { id: '10', text: 'Outside Passed Pawns #2: How we got there', completed: false, info: true },
    { id: '11', text: 'The Active King', completed: false, info: true },
    { id: '12', text: 'Review #1', completed: false },
    { id: '13', text: 'Review #2', completed: false },
    { id: '14', text: 'Review #3', completed: false },
  ],
  'bringing-it-together': [
    { id: '1', text: 'The Immortal Blitz Game: Wesley So vs. Garry Kasparov, St. Louis, 2022', completed: false, info: true },
    { id: '2', text: 'Final Review #1', completed: false, quiz: true },
    { id: '3', text: 'Final Review #2', completed: false, quiz: true },
    { id: '4', text: 'Final Review #3', completed: false, quiz: true },
    { id: '5', text: 'Course Conclusion', completed: false, info: true },
  ],
}

// V2.3: legacy content – 7 base sections + 7 “Part 2” sections, explicit line names
const sectionMovesV23 = {
  intro: [
    { id: '1', text: 'The Italian Game: e4 e5 Nf3 Nc6', completed: true },
    { id: '2', text: 'Control the Center: d4 d5', completed: true },
    { id: '3', text: 'Opening principles', completed: true },
  ],
  tactical: [
    { id: '1', text: 'Knight fork', completed: true, level: 'L1' },
    { id: '2', text: 'Bishop pin', completed: true },
    { id: '3', text: 'Queen skewer', completed: true },
    { id: '4', text: 'Back-rank mate', completed: true },
    { id: '5', text: 'Double attack', completed: false },
    { id: '6', text: 'Deflection', completed: false },
    { id: '7', text: 'Decoy', completed: false },
    { id: '8', text: 'Removing the guard', completed: false },
    { id: '9', text: 'Interference', completed: false },
    { id: '10', text: 'Clearance', completed: false },
  ],
  additional: [
    { id: '1', text: 'Discovered attack', completed: false },
    { id: '2', text: 'Double check', completed: false },
    { id: '3', text: 'Windmill', completed: false },
  ],
  games: [
    { id: '1', text: 'Fischer vs. Spassky (1972)', completed: false },
    { id: '2', text: 'Carlsen vs. Caruana (2018)', completed: false },
    { id: '3', text: 'Kasparov vs. Deep Blue (1997)', completed: false },
    { id: '4', text: 'Karpov vs. Kasparov (1985)', completed: false },
    { id: '5', text: 'Anand vs. Topalov (2010)', completed: false },
    { id: '6', text: 'Tal vs. Botvinnik (1960)', completed: false },
    { id: '7', text: 'Lasker vs. Capablanca (1921)', completed: false },
    { id: '8', text: 'Kramnik vs. Kasparov (2000)', completed: false },
    { id: '9', text: 'Carlsen vs. Anand (2013)', completed: false },
    { id: '10', text: 'Nakamura vs. So (2016)', completed: false },
    { id: '11', text: 'Topalov vs. Anand (2006)', completed: false },
    { id: '12', text: 'Spassky vs. Petrosian (1969)', completed: false },
    { id: '13', text: 'Caruana vs. Carlsen (2018)', completed: false },
    { id: '14', text: 'Aronian vs. Grischuk (2012)', completed: false },
    { id: '15', text: 'Mamedyarov vs. Radjabov (2019)', completed: false },
    { id: '16', text: 'Anand vs. Bacrot (2006)', completed: false },
    { id: '17', text: 'Sandipan vs. Tiviakov (2007)', completed: false },
    { id: '18', text: 'So vs. Kramnik (2016)', completed: false },
  ],
  other: [
    { id: '1', text: 'Sicilian Defense: 1.e4 c5', completed: false },
    { id: '2', text: 'French Defense: 1.e4 e6', completed: false },
    { id: '3', text: 'Caro-Kann: 1.e4 c6', completed: false },
    { id: '4', text: 'Ruy Lopez: 1.e4 e5 2.Nf3 Nc6 3.Bb5', completed: false },
    { id: '5', text: 'Queen\'s Gambit: 1.d4 d5 2.c4', completed: false },
    { id: '6', text: 'King\'s Indian: 1.d4 Nf6 2.c4 g6', completed: false },
    { id: '7', text: 'Slav Defense: 1.d4 d5 2.c4 c6', completed: false },
    { id: '8', text: 'English Opening: 1.c4', completed: false },
    { id: '9', text: 'Catalan: 1.d4 Nf6 2.c4 e6 3.g3', completed: false },
    { id: '10', text: 'Nimzo-Indian: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4', completed: false },
  ],
  blackmar: [
    { id: '1', text: 'BDG: 1.d4 d5 2.e4', completed: false },
    { id: '2', text: 'Accepting: 2...dxe4', completed: false },
    { id: '3', text: 'Declined: 2...e6', completed: false },
    { id: '4', text: '3.Nc3 Nf6', completed: false },
    { id: '5', text: '3...Nc6', completed: false },
    { id: '6', text: '4.f3 exf3', completed: false },
    { id: '7', text: '5.Nxf3 Bg4', completed: false },
    { id: '8', text: '5...g6', completed: false },
    { id: '9', text: 'Euwe Attack', completed: false },
    { id: '10', text: 'Gunderam Defense', completed: false },
    { id: '11', text: 'Teichmann Variation', completed: false },
    { id: '12', text: 'Rider Attack', completed: false },
    { id: '13', text: 'Bogoljubov Defense', completed: false },
    { id: '14', text: '5.Bc4', completed: false },
    { id: '15', text: '5...e6', completed: false },
    { id: '16', text: '6.Ne2', completed: false },
    { id: '17', text: '7.O-O', completed: false },
    { id: '18', text: '8.Re1', completed: false },
    { id: '19', text: '9.Qe2', completed: false },
    { id: '20', text: '10.Ng3', completed: false },
  ],
  quiz: [
    { id: '1', text: 'Tactics quiz', completed: false },
    { id: '2', text: 'Opening quiz', completed: false },
  ],
}

const sectionMoves = computed(() => (isVideoV2_4.value ? sectionMovesV24 : sectionMovesV23))

// Informational line content (key: sectionId-moveId). Coach message + body HTML for info-only lines.
const infoLineContentByKey = {
  'intro-1': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Chess is a fun and beautiful game that everyone can enjoy. While Chess.com is where you practice and play, Chessable is the place where you can learn and improve your game with courses for all levels and interests.</p>
<p>This is a crash course for players just starting out. Welcome to the very beginning of your chess journey!</p>
<p>Chess International Master and Chess.com Chief Chess Officer Danny Rensch is here to guide you through the very basics of the game.</p>
<p><strong>You will learn:</strong></p>
<p>♟️ The language of chess and how we identify pieces, squares and other elements of a chess board.</p>
<p>♟️ How each piece moves</p>
<p>♟️ How to play good moves in the Opening (the first phase of the game)</p>
<p>♟️ Basic tactics and patterns that will help you win your opponent's pieces</p>
<p>♟️ Basic checkmate patterns to finish off your opponent with</p>
<p>♟️ Fundamental strategic concepts to help guide your play</p>
<p>♟️ Checkmating techniques in the endgame, such as how to checkmate your opponent with only a king and queen</p>
<p>...and more!</p>
<p>To study this course, simply hit the Learn button and start learning! You can read the text in each variation, repeat the concepts demonstrated to you by MoveTrainer to ensure you understand it, and watch the video in each chapter to digest Danny's expert instruction.</p>
<p>At the end of each chapter there are 3 Review variations which will test your understanding of the material in each chapter.</p>
<p>By the end of this course, you will understand chess better than most of your friends and family and 99% of everyone who has ever played the game. Who knows, you may be very well be on your way to chess mastery!</p>
<p>We wish you all the best in your chess journey. Don't forget that all work and no play makes you a dull chess player. Play on Chess.com! Building experience is just as important to improvement as building knowledge. So without further ado, let's dive in!</p>`,
  },
  'learning-the-game-7': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Rooks, sometimes incorrectly referred to as castles due to their shape, are perhaps the easiest piece to understand.</p>
<p>Rooks move as far as they like; up, down, or side to side along either ranks or files. Let's see it moving in a square from e4 up to e8, across to a8, down to a4, and back over to e4.</p>
<p>This is how the rook moves around in straight lines across the board.</p>`,
    hasMoves: true,
  },
  'learning-the-game-9': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Meet the bishop. It moves only diagonally across one color complex - light or dark. Here we have a light-squared bishop. Let's see it moving along the light-squared diagonals.</p>
<p>Notice a bishop must stay on the same color complex (in this case, the light-squares) for the entire game!</p>`,
    hasMoves: true,
  },
  'learning-the-game-11': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>The queen is the most powerful piece on the board.</p>
<p>She has the combined power to move like a bishop and rook and as far as she likes. Let's see her in action roaming around the board.</p>
<p>The queen is the most powerful piece because of the great number of squares she can control, especially from the middle of the board!</p>`,
    hasMoves: true,
    movesLayout: 'inline',
    inlinePieceSymbol: '♛',
  },
  'learning-the-game-13': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>The knight is a little different. It does not move in a straight line, like the rest of the pieces. Instead, it moves in an 'L' shape; two squares in one direction followed by one square in another adjacent direction. The knight is the only piece you might say can jump over other pieces without capturing or disturbing them.</p>
<p>Let's see the knight gallop around a little.</p>
<p>Notice the knight can essentially jump over other pieces (of either color) without capturing or disturbing them.</p>
<p>Knights are considered the most tricky piece because of its unique moving pattern.</p>`,
    hasMoves: true,
    movesLayout: 'inline',
  },
  'learning-the-game-15': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>His majesty, the king moves one square in any direction he wishes - up or down, side to side, or diagonally. While it controls every square around it, its limited mobility makes it substantially less powerful than his royal counterpart, the queen.</p>
<p>Let's see how he moves.</p>
<p>The king's mobility is the most limited, and if you lose the king, you lose the game, as we will soon discuss. Therefore, the king requires protection throughout the game.</p>`,
    hasMoves: true,
    movesLayout: 'inline',
  },
  'learning-the-game-17': {
    coachMessage: 'Read through this line and arrow through the moves.',
    movesInBody: true,
    introBodyHtml: `<p>Pawns move up the board in a straight line, one square at a time. They are the only piece that cannot move backward.</p>
<p><strong>Capturing:</strong> Pawns capture differently than they move – they capture diagonally.</p>
<p><strong>Initial two-square move:</strong> A pawn on its starting square (the 2nd and 7th ranks) has the option to move two squares forward instead of just one.</p>`,
    moveExplanations: [
      'Since there is a pawn diagonally to ours, we may capture it like this!',
      'Since the d-pawn is not on its starting square, it is restricted to moving just one square forward at a time.',
      'Since the a-pawn was sitting on its starting square, it can move up two squares instead of one!',
    ],
    closingBodyHtml: `<p>Note the h-pawns are blocking each other, so neither may move.</p>`,
  },
  'the-opening-1': {
    coachMessage: 'Read through this line and arrow through the moves.',
    movesInBody: true,
    introBodyHtml: `<p>The opening phase of a chess game starts on the first move, and can be said to be finished once the rooks are connected. This means all the other pieces will have joined the action by moving off their starting squares on the back rank.</p>
<p><strong>The goals of the opening phase of the game are the following:</strong></p>
<ol>
<li>Control the center of the board.</li>
<li>Develop all your pieces into the game.</li>
<li>Get your king to safety (usually by castling).</li>
</ol>
<p>Let's walk through the ideal opening moves and explain them one by one.</p>`,
    moveExplanations: [
      'A phenomenal first move - controlling central squares and opening lines for development of the bishop and queen.',
      'If you are allowed, it\'s usually a good idea to take the center with both pawns! This opens lines for the dark-squared bishop and controls more key central squares.',
      'Developing your pieces is essential, as you will learn in my 10 opening rules. The knight moves towards the center, controlling key central squares.',
      'The queen\'s knight develops towards the center.',
      'Likewise, the queen\'s knight moves towards the center, controlling the central e4 and d5-squares. The knights are ideally placed.',
      'An active square for the bishop, playing a role in controlling the center and allowing room for White to castle kingside.',
      'Likewise, a great square for the dark-squared bishop. As long as we are bringing our pieces into play, we are in good shape.',
      'The queen finally joins the action, supporting her forces safely from behind and introducing the possibility of castling queenside!',
    ],
    closingBodyHtml: `<p>The position shown is a dream opening for White. Of course, Black gets to move too but for illustration purposes, each of White's pieces is on its most active square controlling the center of the board and ready to engage in battle. White's next move might be Re1, bringing the last piece into the middle of the board.</p>
<p>Notice in order to finish development and connect the rooks, White had to castle! This serves the dual purpose of bringing the king to safety and finishing development.</p>`,
  },
  'the-opening-3': {
    coachMessage: 'Read through this line and arrow through the moves.',
    movesInBody: true,
    introBodyHtml: `<p>Now let's let Black move too and see what good opening moves look like in a more realistic scenario.</p>`,
    moveExplanations: [
      '<p>A good first move, controlling the center with a pawn, and opening lines for the queen and f1-bishop.</p><p>Black follows suit.</p>',
      '<p>White develops a piece towards the center and at the same time, attacks Black\'s e5 pawn! It\'s helpful when your opening moves serve multiple purposes.</p><p>Black develops a piece towards the center and defends the pawn.</p>',
      '<p>The other knights come out to play.</p>',
      '<p>White develops the bishop to its most active square, controlling the center, also preparing to castle kingside.</p><p>Black plays Bb4.</p>',
      '<p>There are other good moves, such as castling right away, but d3 is good because it bolsters White\'s center and prepares the development of the dark-squared bishop.</p><p>Black follows suit.</p>',
      '<p>White is getting close to finishing development now that most pieces are developed!</p><p>Both sides up to this point have played standard and good developing moves and now it\'s time to round out the opening by getting the king to safety followed by connecting the rooks.</p>',
      '<p>Now both sides have castled, fulfilling the crucial principle of getting the king to safety.</p><p>All that\'s left to finish development is to connect the rooks by bringing in the queen. Of course, there may be better moves to make instead depending on the position, which is one of the reasons the opening can be tricky! For instance, an experienced player may recognize White\'s threat of 8.d5 here.</p><p>However, the point we want you to take away is that as a rule of thumb, when the queen moves into the game and the rooks are connected, the opening is done.</p>',
    ],
    closingBodyHtml: '',
  },
  'the-opening-4': {
    coachMessage: 'Read through this line and arrow through the moves.',
    movesInBody: true,
    introBodyHtml: `<p>I have 10 rules for the opening that I've been teaching students for decades. Now that we understand the goals of the opening, let's talk about them.</p>
<p><strong>1. Develop!</strong></p>
<p><strong>2. Develop!</strong></p>
<p><strong>3. Develop!</strong></p>
<p>Using your full army is important enough to merit 3 spots on this list! In chess, Teamwork makes the dream work. Involve your entire army for full effectiveness!</p>
<p><strong>4. Control the center.</strong></p>
<p>The center is the most important strategic area of the board to control and occupy. From there, your pieces have the best scope to the rest of the board.</p>
<p><strong>5. Don't move the same piece twice.</strong></p>
<p>Observing this rule will help you follow rules 1-3!</p>
<p><strong>6. Get castled early!</strong></p>
<p>You can castle as early as move 4, as you see in this variation. This is a good idea because the action often takes place in the center of the board, meaning the king is most often safer on the edge behind the cover of pawns.</p>
<p><strong>7. Don't bring out the queen too early!</strong></p>
<p>The queen is the most valuable piece, so it pays to keep her at home until the big guns are needed, otherwise she may become a target.</p>
<p><strong>8. Develop a plan!</strong></p>
<p>This one is slightly more advanced because it's about where specifically to put your pieces. Mastering this will come with experience, while following the other rules, you should be paying attention to what your opponent is doing and put your pieces on effective squares accordingly. This leads us to Rule #9...</p>
<p><strong>9. Follow rules 1-8 and try to stop your opponent from doing the same.</strong></p>
<p>It's so easy to get lost in your own ideas and neglect your opponent's. Don't fall into that mindset. As we've seen, the best opening moves are multi-purposed. Not only can they improve our position, but obstruct your opponent's! Doing so is the best way to finish the opening with the best possible position.</p>
<p><strong>10. Connect the rooks!</strong></p>
<p>Don't proceed with your plan of attack until your pieces are developed, your rooks are connected, and ready to swing into the action.</p>
<p>Now, play through the moves in this variation and for each move, stop and consider the role it plays in following these rules.</p>`,
    moveExplanations: [
      '<p>The first suboptimal opening move. Although it\'s not blundering anything, it blocks in Black\'s dark-squared bishop, preventing it from developing to an active square.</p><p>This move is blocking the development of the light-squared bishop. This means more moves are required to get these pieces into the game.</p><p>This move does nothing whatsoever to help develop Black\'s pieces.</p>',
      '<p>Once again, White has played logical moves that observe the goals of the opening and follow Danny\'s rules. Conversely, Black has played a few moves which hinder their own development. Several more moves are necessary from the black side to finish developing. For this reason, White has an advantage out of the opening!</p><p>Rule #9 hasn\'t come into play so much as there is little tension between the pieces, allowing each side to follow their respective opening plans.</p>',
    ],
    closingBodyHtml: `<p>The better the opening rules are followed, the better our position will be in the middlegame, and the better prepared our pieces will be to attack and eventually checkmate the opponent.</p>`,
  },
  'the-endgame-3': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Endgame Checkmates: The Rook Mate. With only a king and rook left, you can force checkmate by driving the enemy king to the edge of the board. The two rooks (or rook and king) work together to shrink the space available to the enemy king until it is checkmated.</p>
<p>This is one of the most important endgame patterns to learn. Let's see how it's done.</p>`,
    hasMoves: true,
  },
  'the-endgame-7': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Passed pawns are pawns that have no enemy pawns in front of them on the same file or on adjacent files. They can advance toward promotion without being blocked by opposing pawns.</p>
<p>Passed pawns are often a major advantage in the endgame. They can tie down the enemy king or create decisive threats. In this lesson we look at how to create and use passed pawns.</p>`,
    hasMoves: true,
  },
  'the-endgame-8': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Outside passed pawns are passed pawns that sit on the wing – far from the main action. They are especially dangerous because they can draw the enemy king away from the center, allowing your own king to invade.</p>
<p>Using an outside passed pawn is a key endgame technique. Let's see how it works.</p>`,
    hasMoves: true,
  },
  'the-endgame-9': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Outside Passed Pawns #2. Here we look at another example of how an outside passed pawn can decide the game. When you have a passed pawn on the a-file or h-file, your opponent's king may have to travel a long way to stop it.</p>
<p>That gives your king time to capture pawns or invade on the other side.</p>`,
    hasMoves: true,
  },
  'the-endgame-10': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Outside Passed Pawns #2: How we got there. Before using an outside passed pawn, you often need to create it. This lesson shows a typical path from a more crowded position to one where the outside passed pawn becomes the hero.</p>
<p>Pay attention to how the pawn structure changes and how the king finds the right square.</p>`,
    hasMoves: true,
  },
  'the-endgame-11': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>The active king. In the endgame, the king is a strong piece. With fewer pieces on the board, it is safe to bring the king toward the center and use it to support pawns, attack enemy pawns, or restrict the opponent's king.</p>
<p>An active king often makes the difference between a draw and a win. Let's see how to activate your king in the endgame.</p>`,
    hasMoves: true,
  },
  'bringing-it-together-1': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Congratulations! By getting this far in the course, you've learned a heck of a lot about chess:</p>
<ul>
<li>♟️ The rules of the game and the language of chess</li>
<li>♟️ How to play good opening moves</li>
<li>♟️ How to navigate the middlegame with some basic strategic concepts</li>
<li>♟️ How to win your opponent's pieces through tactics</li>
<li>♟️ How to checkmate your opponent in the middlegame and endgame</li>
</ul>
<p>and much more!</p>
<p>But for now, they're individual concepts compartmentalized in your brain. Now it's time to see a full game of chess from start to finish and see these principles in action in all their glory.</p>
<p>This game is by Wesley So, a top American Grandmaster who managed to slay the one and only Garry Kasparov, former World Champion and one of the greatest players of all time. Wesley had the White pieces while Kasparov had the Black pieces. We will analyze this game from Wesley's point of view.</p>`,
    hasMoves: true,
  },
  'bringing-it-together-5': {
    coachMessage: 'Read through this line and arrow through the moves.',
    bodyHtml: `<p>Congratulations! You've finished the entire course, and now know all there is to know about chess!</p>
<p>Well, okay, maybe not. 😉 Mastering the game takes years of study and practice. Even the World Chess Champion himself would tell you that he is still working to improve!</p>
<p>But with this course, you're off to a strong start.</p>
<p>Here's what we recommend to keep improving:</p>
<p><strong>Keep practicing tactics!</strong> Tactics are the keys to winning chess games. For your next Chessable course, we recommend 1001 Chess Exercises For Beginners where popular streamer, Fiona Steil-Antoni will introduce and guide you through every tactic you need to know! You can practice Chess.com's Puzzles feature or through many Chessable courses.</p>
<p><strong>Study other Chessable courses.</strong> There are courses on virtually every part of the game, from openings to endgames, taught by the best players and coaches in the world. Check out more courses using the link below.</p>
<p><strong>Play games!</strong> It's important to put what you learn into practice. Chess is very much like a sport - it's not just about what you know, it's also about keeping sharp and putting your skills to the test! You can play games live on Chess.com or against bots.</p>
<p>And most of all, <strong>have fun!</strong> Chess is full of wild, elegant, exciting, creative, and endless possibilities no matter what your level - remember to enjoy the journey!</p>
<p><em>Note: If you'd like to study this course again, for optimal functionality, we recommend using the Delete My Progress option in Chapter Options before doing so.</em></p>`,
    hasMoves: true,
  },
}

// Quiz line content (key: sectionId-moveId): coach header, body, optional intro text
const quizLineContentByKey = {
  'learning-the-game-1': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Squares on a chess board can be divided and understood according to ranks (side to side), files (up and down) and diagonals. Let's talk about ranks. There are 8 ranks on a chess board numbered from 1-8.</p>
<p>Here we see a lone queen sitting on the 3rd rank. We will learn about her highness when we talk about the pieces. For now, to get a better feel for the board, let's try moving her all the way across the 3rd rank to the other side.</p>`,
    readModeCaption: 'The queen shuffles all the way to the other side along the 3rd rank.',
  },
  'learning-the-game-2': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Files are the sets of squares that go up and down on a chess board. There are 8 of them, lettered from a to h. Here, a queen sits on the d-file. Let's move her all the way down to the other side of the d-file.</p>`,
    readModeCaption: 'I think you have the hang of it.',
    readModeMoveWhite: 'Qd1',
  },
  'learning-the-game-3': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>There are lots of diagonals of varying sizes on a chess board.</p>
<p>Here, the queen sits on the a1-h8 diagonal. Let's move her along it to the other side - the h8-square.</p>`,
    readModeCaption: 'Note that all squares on a given diagonal must be of the same color - light or dark.',
    readModeMoveWhite: 'Qh8',
  },
  'learning-the-game-4': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>There are 64 squares on a chess board, each with their own unique letter-number coordinate. Let's practice moving a piece to a given square. Let's start by moving the queen to the d5-square.</p>`,
    readModeCaption: 'Nice job. Notice the d5-square sits on the d-file and the 5th rank.',
    readModeMoveWhite: 'Qd5',
  },
  'learning-the-game-5': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Now try moving the queen to the a2-square.</p>`,
    readModeCaption: 'Yep - most chess pieces can move backwards as well as forwards!',
    readModeMoveWhite: 'Qa2',
  },
  'learning-the-game-6': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Let's do one more. Find the f7-square for the queen.</p>`,
    readModeCaption: 'You got it. Now you understand the basic layout of the chess board! For more practice on coordinate recognition, check out Vision Drills on Chess.com',
    readModeMoveWhite: 'Qf7',
  },
  'learning-the-game-8': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Let's practice moving the rook up to the c7 square.</p>`,
    readModeCaption: 'The rook is a very powerful piece, second only to the queen. Together, they make up the major pieces.',
    readModeMoveWhite: 'Rc7',
  },
  'learning-the-game-10': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Let's practice moving this dark-squared bishop along one of its favorite diagonals to the e5-square.</p>`,
    readModeCaption: 'The bishop and knight are called minor pieces, and are essential components of your army.',
    readModeMoveWhite: 'Be5',
  },
  'learning-the-game-12': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Every chess piece can move backwards except for pawns (which we will cover soon).</p>
<p>Let's move the queen diagonally like a bishop, back to the a2-square.</p>`,
    readModeCaption: 'Remember, the queen can go in any direction she likes, including up and down 1. Qg1 and side to side 1. Qd8 like a rook.',
    readModeCaptionHtml: `<p>Remember, the queen can go in any direction she likes, including up and down <span class="inline-ply-chip" data-move="Qg1">1. Qg1</span> and side to side <span class="inline-ply-chip" data-move="Qd8">1. Qd8</span> like a rook.</p>`,
    readModeMoveWhite: 'Qa2',
  },
  'learning-the-game-14': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>This piece takes the most practice getting used to. Let's move the knight up to c6 in its signature L-shape.</p>`,
    readModeCaption: 'From this square, the knight can jump to 8 different squares (all dark!). Let\'s see them:',
    readModeMoveWhite: 'Nc6',
  },
  'learning-the-game-16': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Let's see the king step one square to the side to the e3-square.</p>`,
    readModeCaption: 'The king can move one square in any direction, like so:',
    readModeMoveWhite: 'Ke3',
  },
  'learning-the-game-18': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>The pawn is not on its starting square, so it may only move one square forward at a time. Try it for yourself!</p>`,
    readModeCaption: 'Pretty simple! Next we will practice capturing with the pawn.',
    readModeMoveWhite: 'd5',
  },
  'learning-the-game-19': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Here Black's rook can be captured by the white pawn!</p>`,
    readModeCaption: 'It\'s always a good thing to take your opponent\'s pieces, especially with a pawn!',
    readModeMoveWhite: 'exf5',
  },
  'learning-the-game-20': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Every pawn contains the hidden potential to transform into a queen, bishop, rook, or knight when it reaches the other side of the board (the 8th rank for a white pawn, or the 1st rank for a black pawn). This is called pawn promotion.</p>
<p>Most often, players opt to promote to a queen because the queen is the most powerful piece. Let's practice promoting a far-advanced pawn to a queen.</p>`,
    readModeCaption: 'Just like that, a new queen enters the game which is great news for White.',
    readModeMoveWhite: 'e8=Q',
  },
  'the-opening-2': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Now let's test your memory. Make the best developing moves possible in the same order you just saw in the previous variation.</p>
<p><strong>Hint:</strong></p>
<ul>
<li>Control the center with pawns.</li>
<li>Knights before bishops.</li>
<li>Bring in the queen to prepare to castle queenside.</li>
</ul>`,
  },
  'bringing-it-together-2': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>Wesley So, Top American Grandmaster, understands opening principles and here plays the best move, demonstrating optimal control of the center. What did he play?</p>`,
    readModeCaption: 'Perfect! Occupying the center with two pawns gives White a great start to the game.',
    readModeMoveWhite: 'd4',
  },
  'bringing-it-together-3': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>White's king is safe in the center for now, so castling immediately isn't strictly necessary. Wesley has a nice space advantage and with his next aggressive move, takes even more space and gives one of his pieces a great square to come forward to. What did he play?</p>`,
    readModeCaptionHtml: `<p>A fantastic idea, giving the d2-knight the c4 square to hop to as a more aggressive post. You don't always want to make so many pawn moves in the opening, but Black has no immediate threats and this pawn move helps White develop.</p>
<p>Think about it. The d2-knight needs to move in order for the dark-squared bishop to develop. So, preparing the excellent c4-square for the knight facilitates queenside development!</p>`,
    readModeMoveWhite: 'c5',
  },
  'bringing-it-together-4': {
    coachTitle: 'Play the correct move',
    coachBody: 'White to play',
    bodyHtml: `<p>After a dominant display of flawless opening and middlegame strategy from Wesley So, he arrived at this position in which all of Black's pieces are tied down or out of the game.</p>
<p>Wesley now brought one more piece into the attack to finish off Kasparov. How can White attack a pinned piece and overwhelm Black's position?</p>`,
    readModeCaption: "Black probably wishes he was castled a long time ago, because his king is being swarmed by too many White pieces. The bishop now attacks the knight on e7 and unfortunately for Black, there's no way to save it!",
    readModeMoveWhite: 'Bc5',
  },
}
// Read mode: toggled by book icon in footer; when ON: coach off, book = crossed, CTA = Back + Continue (for all lines that have it)
const isLineReadMode = ref(false)
function toggleLineReadMode() {
  if (panelView.value === 'line') isLineReadMode.value = !isLineReadMode.value
}
function exitReadMode() {
  isLineReadMode.value = false
}
const isQuizLine = computed(() => !!selectedLine.value?.move?.quiz)
const quizLineContentCurrent = computed(() => {
  const section = selectedLine.value?.section
  const move = selectedLine.value?.move
  if (!section?.id || !move?.id || !move?.quiz) return null
  const key = `${section.id}-${move.id}`
  return quizLineContentByKey[key] || null
})

const infoLineContentCurrent = computed(() => {
  const section = selectedLine.value?.section
  const move = selectedLine.value?.move
  if (!section?.id || !move?.id || !move?.info) return null
  const key = `${section.id}-${move.id}`
  return infoLineContentByKey[key] || { coachMessage: 'Read through this line and arrow through the moves.', bodyHtml: '' }
})

/** Read mode body copy (key: sectionId-moveId). Shown below the move list in read mode – moves first, then this copy. */
const lineReadModeBodyByKey = {
  'the-opening-5': {
    bodyHtml: `<p>Let's learn what the popular opening, the Queen's Gambit, looks like when played well by both sides!</p>
<p>d4, like e4, is a fantastic first move. It controls the center with a pawn, and prepares the development of White's dark-squared bishop.</p>
<p>One of Black's most common replies, following suit by occupying the center with a pawn right away.</p>
<p>White lunges forward with a second pawn towards the center of the board, and threatens to capture Black's d-pawn!</p>
<p>Black decides not to capture on c4 as after White will recapture on c4 with the bishop, and has excellent control of the center with both pawns!</p>
<p>Instead, Black opts to defend their central pawn with 2...e6. This is called the Queen's Gambit Declined.</p>`,
  },
  'the-opening-6': {
    bodyHtml: `<p>Now let's see one of the oldest and most common openings at all levels: the Ruy Lopez, or Spanish opening. Pay special attention to how opening principles are observed, especially rule #5 – castling the king early.</p>
<p>Let's see if you can learn and remember the first moves of this ancient opening.</p>
<p>A perfect move; controlling the center and making way for the queen and bishop.</p>
<p>As we've already seen, this move does many things:</p>
<ol>
<li>Develops a piece</li>
<li>Controls the center</li>
<li>Brings the king one move closer to castling to safety</li>
<li>Attacks a pawn!</li>
</ol>
<p>Black defends.</p>
<p>This is the starting position of the Ruy Lopez Opening which has been played hundreds of thousands of times. In addition to developing a piece and preparing to castle, the point of this move is to attack Black's knight – an important defender of Black's center. In this way, this bishop move indirectly controls the center!</p>`,
  },
  'the-opening-7': {
    bodyHtml: `<p>Let's learn what the popular opening, the Queen's Gambit, looks like when played well by both sides!</p>
<p>d4, like e4, is a fantastic first move. It controls the center with a pawn, and prepares the development of White's dark-squared bishop.</p>
<p>One of Black's most common replies, following suit by occupying the center with a pawn right away.</p>
<p>White lunges forward with a second pawn towards the center of the board, and threatens to capture Black's d-pawn!</p>
<p>Black decides not to capture on c4 as after White will recapture on c4 with the bishop, and has excellent control of the center with both pawns!</p>
<p>Instead, Black opts to defend their central pawn with 2...e6. This is called the Queen's Gambit Declined.</p>`,
  },
  'the-opening-8': {
    bodyHtml: `<p>Let's take a look at another example of what can go wrong if one side insists on going for checkmate with the queen too early.</p>
<p>A strong first move, occupying the center, stopping white from playing d4 next, and facilitating kingside development.</p>
<p>White brings out the queen as early as move 2, threatening to win our central pawn. So, we defend it by developing a piece. Remember, it's important to notice and react appropriately to your opponent's threats.</p>
<p>White is trying to checkmate us on the f7 square. If we don't defend, next would end the game and we would lose.</p>
<p>Let's learn how to defend against this popular try at the beginner level.</p>
<p>White is going for Scholar's Mate with Queen to f7 next, which we saw in the first lesson. This can be a quick way to catch unwitting opponents off guard. If Black isn't careful and plays something like 3...Nf6 attacking the queen, White would be able to give checkmate already on move four with 4. Qxf7#. But we see White's threat and are ready to punish them for breaking the opening rules.</p>
<p>...g6 defends against the checkmate threat on f7, and forces White to waste another move on the queen, otherwise she will be captured.</p>`,
  },
  'the-opening-9': {
    bodyHtml: `<p>Now let's see one of the oldest and most common openings at all levels: the Ruy Lopez, or Spanish opening. Pay special attention to how opening principles are observed, especially rule #5 – castling the king early.</p>
<p>Let's see if you can learn and remember the first moves of this ancient opening.</p>
<p>A perfect move; controlling the center and making way for the queen and bishop.</p>
<p>As we've already seen, this move does many things:</p>
<ol>
<li>Develops a piece</li>
<li>Controls the center</li>
<li>Brings the king one move closer to castling to safety</li>
<li>Attacks a pawn!</li>
</ol>
<p>Black defends.</p>
<p>This is the starting position of the Ruy Lopez Opening which has been played hundreds of thousands of times. In addition to developing a piece and preparing to castle, the point of this move is to attack Black's knight – an important defender of Black's center. In this way, this bishop move indirectly controls the center!</p>`,
  },
  'the-opening-10': {
    bodyHtml: `<p>Let's learn what the popular opening, the Queen's Gambit, looks like when played well by both sides!</p>
<p>d4, like e4, is a fantastic first move. It controls the center with a pawn, and prepares the development of White's dark-squared bishop.</p>
<p>One of Black's most common replies, following suit by occupying the center with a pawn right away.</p>
<p>White lunges forward with a second pawn towards the center of the board, and threatens to capture Black's d-pawn!</p>
<p>Black decides not to capture on c4 as after White will recapture on c4 with the bishop, and has excellent control of the center with both pawns!</p>
<p>Instead, Black opts to defend their central pawn with 2...e6. This is called the Queen's Gambit Declined.</p>`,
  },
  'the-opening-11': {
    bodyHtml: `<p>Let's take a look at another example of what can go wrong if one side insists on going for checkmate with the queen too early.</p>
<p>A strong first move, occupying the center, stopping white from playing d4 next, and facilitating kingside development.</p>
<p>White brings out the queen as early as move 2, threatening to win our central pawn. So, we defend it by developing a piece. Remember, it's important to notice and react appropriately to your opponent's threats.</p>
<p>White is trying to checkmate us on the f7 square. If we don't defend, next would end the game and we would lose.</p>
<p>Let's learn how to defend against this popular try at the beginner level.</p>
<p>White is going for Scholar's Mate with Queen to f7 next, which we saw in the first lesson. This can be a quick way to catch unwitting opponents off guard. If Black isn't careful and plays something like 3...Nf6 attacking the queen, White would be able to give checkmate already on move four with 4. Qxf7#. But we see White's threat and are ready to punish them for breaking the opening rules.</p>
<p>...g6 defends against the checkmate threat on f7, and forces White to waste another move on the queen, otherwise she will be captured.</p>`,
  },
  'the-opening-12': {
    bodyHtml: `<p>Now let's see one of the oldest and most common openings at all levels: the Ruy Lopez, or Spanish opening. Pay special attention to how opening principles are observed, especially rule #5 – castling the king early.</p>
<p>Let's see if you can learn and remember the first moves of this ancient opening.</p>
<p>A perfect move; controlling the center and making way for the queen and bishop.</p>
<p>As we've already seen, this move does many things:</p>
<ol>
<li>Develops a piece</li>
<li>Controls the center</li>
<li>Brings the king one move closer to castling to safety</li>
<li>Attacks a pawn!</li>
</ol>
<p>Black defends.</p>
<p>This is the starting position of the Ruy Lopez Opening which has been played hundreds of thousands of times. In addition to developing a piece and preparing to castle, the point of this move is to attack Black's knight – an important defender of Black's center. In this way, this bishop move indirectly controls the center!</p>`,
  },
  'tactics-strategy-1': {
    bodyHtml: `<p>For our first tactic, let's examine the double attack, also called a fork.</p>
<p>A double attack is when one piece attacks two enemy pieces at the same time. In this position, the rook can attack both the enemy bishop and knight because they are sitting on the same rank!</p>
<p><span class="inline-ply-chip" data-move="Rf7">1. Rf7</span></p>
<p>Rook to f7 double attacks the bishop and knight, and Black cannot save them both. This means on the next move, White can capture one of them.</p>`,
  },
  'tactics-strategy-2': {
    bodyHtml: `<p>Here it's White's move, and there are actually two different double attacks possible.</p>
<p>One of them is Knight to e7, double attacking the king and queen.</p>
<p>A double attack involving the enemy king is particularly effective because it comes with check, meaning your opponent will need to spend a move escaping the check.</p>
<p><span class="inline-ply-chip" data-move="Ne7+">1. Ne7+</span></p>
<p>Double attacking the king and queen is the best move in this position because we win the queen. However, the other double attack in this position is the move <span class="inline-ply-chip" data-move="b4">1. b4</span> which attacks both knights at the same time. Under normal circumstances, Black would not be able to save them both.</p>
<p><span class="inline-ply-chip" data-move="Kf7">1... Kf7</span> <span class="inline-ply-chip" data-move="Nxc8">2. Nxc8</span></p>
<p>We have chosen the better of the two double attacks, and we have won the enemy queen!</p>`,
  },
  'tactics-strategy-3': {
    bodyHtml: `<p>Let's move on to the next tactic: the pin.</p>
<p>A pin occurs when a bishop, rook, or queen attacks an enemy piece, disabling it from moving because there's a better piece behind it. Let's have a look at an example.</p>
<p><span class="inline-ply-chip" data-move="Bb5">1. Bb5</span></p>
<p>What a move! With this move, there are actually two pins in the position:</p>
<ol>
<li>The white rook pins the black knight to the king.</li>
<li>The white bishop pins the black rook to the king.</li>
</ol>
<p>Neither the black rook nor the black knight can legally move, because it's against the rules to put your own king in check! That's why this kind of pin is called an absolute pin, since the black pieces absolutely cannot move.</p>`,
  },
  'tactics-strategy-4': {
    bodyHtml: `<p>The second type of pin is called a relative pin. Let's see what it looks like.</p>
<p><span class="inline-ply-chip" data-move="Bg5">1. Bg5</span></p>
<p>The bishop attacks the knight, and this time the enemy queen sits behind it. In this position, it would be a bad idea to move the black knight, though not illegal. In some rare instances, it can be a good idea to move pieces in relative pins if they create a strong counterattack.</p>
<p><span class="inline-ply-chip" data-move="Nd5">1... Nd5</span> <span class="inline-ply-chip" data-move="Bxd8">2. Bxd8</span></p>
<p>However in most positions, like this one, if the knight were to move, we would simply capture the queen and likely win the game.</p>`,
  },
  'tactics-strategy-5': {
    bodyHtml: `<p>The Queen's Gambit opening features a relative pin like we just saw in the early stages of the game. Do you remember how it goes?</p>
<p><span class="inline-ply-chip" data-move="d4">1. d4</span> – In the Queen's Gambit, White grabs the center with the queen's pawn on the first move.</p>
<p><span class="inline-ply-chip" data-move="d5">1... d5</span> – Black responds in turn.</p>
<p><span class="inline-ply-chip" data-move="c4">2. c4</span> – White puts pressure on Black's center by placing a second pawn in the center.</p>
<p><span class="inline-ply-chip" data-move="e6">2... e6</span> – Black defends their center.</p>
<p><span class="inline-ply-chip" data-move="Nc3">3. Nc3</span> – White develops their queenside pieces, starting with the knight towards the center, again adding pressure to Black's center.</p>
<p><span class="inline-ply-chip" data-move="Nf6">3... Nf6</span> – Black develops a knight and defends the center simultaneously.</p>`,
  },
  'tactics-strategy-6': {
    bodyHtml: `<p>A skewer is in some ways the opposite of a pin. A pin features a weaker piece sitting in front of, and shielding a more powerful piece behind it.</p>
<p>A skewer sees a more powerful piece attacked and forced to retreat, revealing an attack on another vulnerable piece behind it on the same rank, file, or diagonal.</p>
<p>Let's see an example.</p>
<p><span class="inline-ply-chip" data-move="Re1+">1. Re1+</span></p>
<p>In this position, whoever's turn it is to move will win the game due to a skewer.</p>
<p>Fortunately for White, it is their turn, and rook to e1 wins the enemy rook by attacking the king and forcing it to move out of the way.</p>`,
  },
  'tactics-strategy-7': {
    bodyHtml: `<p>Here is an example of a skewer occurring from a more realistic position. Here we can notice the queen and rook are lined up on the same file – prime conditions for a rook skewer.</p>
<p><span class="inline-ply-chip" data-move="Re1">1. Re1</span> – White skewers the queen and rook along the e-file. Black must move the queen.</p>
<p><span class="inline-ply-chip" data-move="Qg6">1... Qg6</span> – Black saves the queen but leaves the rook undefended.</p>
<p><span class="inline-ply-chip" data-move="Rxe8#">2. Rxe8#</span> – White captures the rook with checkmate. The skewer won material and finished the game.</p>`,
  },
  'tactics-strategy-8': {
    bodyHtml: `<p>Skewers are especially common in the endgame when the king is exposed. Here we see a classic example: a pawn promotes with check, and the new queen skewers the enemy king and rook.</p>
<p><span class="inline-ply-chip" data-move="a8=Q+">1. a8=Q+</span> – The pawn promotes to a queen with check. Black's king must move.</p>
<p><span class="inline-ply-chip" data-move="Kf4">1... Kf4</span> – The king steps aside.</p>
<p><span class="inline-ply-chip" data-move="Qxh1">2. Qxh1</span> – The queen captures the rook, winning the game. This is the infamous endgame skewer: the king was forced to move, exposing the piece behind it.</p>`,
  },
  'the-endgame-1': {
    bodyHtml: `<p>Let's learn what the popular opening, the Queen's Gambit, looks like when played well by both sides!</p>
<p>d4, like e4, is a fantastic first move. It controls the center with a pawn, and prepares the development of White's dark-squared bishop.</p>
<p>One of Black's most common replies, following suit by occupying the center with a pawn right away.</p>
<p>White lunges forward with a second pawn towards the center of the board, and threatens to capture Black's d-pawn!</p>
<p>Black decides not to capture on c4 as after White will recapture on c4 with the bishop, and has excellent control of the center with both pawns!</p>
<p>Instead, Black opts to defend their central pawn with 2...e6. This is called the Queen's Gambit Declined.</p>`,
  },
  'the-endgame-2': {
    bodyHtml: `<p>Now let's see one of the oldest and most common openings at all levels: the Ruy Lopez, or Spanish opening. Pay special attention to how opening principles are observed, especially rule #5 – castling the king early.</p>
<p>Let's see if you can learn and remember the first moves of this ancient opening.</p>
<p>A perfect move; controlling the center and making way for the queen and bishop.</p>
<p>As we've already seen, this move does many things:</p>
<ol>
<li>Develops a piece</li>
<li>Controls the center</li>
<li>Brings the king one move closer to castling to safety</li>
<li>Attacks a pawn!</li>
</ol>
<p>Black defends.</p>
<p>This is the starting position of the Ruy Lopez Opening which has been played hundreds of thousands of times.</p>`,
  },
  'the-endgame-3': {
    bodyHtml: `<p>For our first tactic, let's examine the double attack, also called a fork.</p>
<p>A double attack is when one piece attacks two enemy pieces at the same time. In this position, the rook can attack both the enemy bishop and knight because they are sitting on the same rank!</p>
<p>Rook to f7 double attacks the bishop and knight, and Black cannot save them both. This means on the next move, White can capture one of them.</p>`,
  },
  'the-endgame-4': {
    bodyHtml: `<p>Here it's White's move, and there are actually two different double attacks possible.</p>
<p>One of them is Knight to e7, double attacking the king and queen.</p>
<p>A double attack involving the enemy king is particularly effective because it comes with check, meaning your opponent will need to spend a move escaping the check.</p>
<p>Double attacking the king and queen is the best move in this position because we win the queen.</p>`,
  },
  'the-endgame-5': {
    bodyHtml: `<p>Let's move on to the next tactic: the pin.</p>
<p>A pin occurs when a bishop, rook, or queen attacks an enemy piece, disabling it from moving because there's a better piece behind it. Let's have a look at an example.</p>
<p>What a move! With this move, there are actually two pins in the position. Neither the black rook nor the black knight can legally move, because it's against the rules to put your own king in check! That's why this kind of pin is called an absolute pin.</p>`,
  },
  'the-endgame-6': {
    bodyHtml: `<p>The second type of pin is called a relative pin. Let's see what it looks like.</p>
<p>The bishop attacks the knight, and this time the enemy queen sits behind it. In this position, it would be a bad idea to move the black knight, though not illegal. In some rare instances, it can be a good idea to move pieces in relative pins if they create a strong counterattack.</p>
<p>However in most positions, like this one, if the knight were to move, we would simply capture the queen and likely win the game.</p>`,
  },
  'the-endgame-7': {
    bodyHtml: `<p>The Queen's Gambit opening features a relative pin like we just saw in the early stages of the game. Do you remember how it goes?</p>
<p>In the Queen's Gambit, White grabs the center with the queen's pawn on the first move. Black responds in turn. White puts pressure on Black's center by placing a second pawn in the center. Black defends their center.</p>
<p>White develops their queenside pieces, starting with the knight towards the center. Black develops a knight and defends the center simultaneously.</p>`,
  },
  'the-endgame-8': {
    bodyHtml: `<p>A skewer is in some ways the opposite of a pin. A pin features a weaker piece sitting in front of, and shielding a more powerful piece behind it.</p>
<p>A skewer sees a more powerful piece attacked and forced to retreat, revealing an attack on another vulnerable piece behind it on the same rank, file, or diagonal.</p>
<p>In this position, whoever's turn it is to move will win the game due to a skewer. Fortunately for White, it is their turn, and rook to e1 wins the enemy rook by attacking the king and forcing it to move out of the way.</p>`,
  },
  'the-endgame-9': {
    bodyHtml: `<p>Here is an example of a skewer occurring from a more realistic position. Here we can notice the queen and rook are lined up on the same file – prime conditions for a rook skewer.</p>
<p>White skewers the queen and rook along the e-file. Black must move the queen. Black saves the queen but leaves the rook undefended. White captures the rook with checkmate. The skewer won material and finished the game.</p>`,
  },
  'the-endgame-10': {
    bodyHtml: `<p>Skewers are especially common in the endgame when the king is exposed. Here we see a classic example: a pawn promotes with check, and the new queen skewers the enemy king and rook.</p>
<p>The pawn promotes to a queen with check. Black's king must move. The king steps aside. The queen captures the rook, winning the game. This is the infamous endgame skewer: the king was forced to move, exposing the piece behind it.</p>`,
  },
  'the-endgame-11': {
    bodyHtml: `<p>Let's take a look at another example of what can go wrong if one side insists on going for checkmate with the queen too early.</p>
<p>A strong first move, occupying the center, stopping white from playing d4 next, and facilitating kingside development.</p>
<p>White brings out the queen as early as move 2, threatening to win our central pawn. So, we defend it by developing a piece. Remember, it's important to notice and react appropriately to your opponent's threats.</p>
<p>...g6 defends against the checkmate threat on f7, and forces White to waste another move on the queen, otherwise she will be captured.</p>`,
  },
  'the-endgame-12': {
    bodyHtml: `<p>Now let's see one of the oldest and most common openings at all levels: the Ruy Lopez, or Spanish opening. Pay special attention to how opening principles are observed, especially rule #5 – castling the king early.</p>
<p>Let's see if you can learn and remember the first moves of this ancient opening. A perfect move; controlling the center and making way for the queen and bishop. Black defends. This is the starting position of the Ruy Lopez Opening which has been played hundreds of thousands of times.</p>`,
  },
  'the-endgame-13': {
    bodyHtml: `<p>Let's learn what the popular opening, the Queen's Gambit, looks like when played well by both sides!</p>
<p>d4, like e4, is a fantastic first move. It controls the center with a pawn, and prepares the development of White's dark-squared bishop. One of Black's most common replies, following suit by occupying the center with a pawn right away. White lunges forward with a second pawn towards the center of the board. Instead, Black opts to defend their central pawn with 2...e6. This is called the Queen's Gambit Declined.</p>`,
  },
  'the-endgame-14': {
    bodyHtml: `<p>For our first tactic, let's examine the double attack, also called a fork.</p>
<p>A double attack is when one piece attacks two enemy pieces at the same time. In this position, the rook can attack both the enemy bishop and knight because they are sitting on the same rank! Rook to f7 double attacks the bishop and knight, and Black cannot save them both.</p>`,
  },
}
const lineReadModeBodyCurrent = computed(() => {
  const section = selectedLine.value?.section
  const move = selectedLine.value?.move
  if (!section?.id || !move?.id) return null
  const key = `${section.id}-${move.id}`
  return lineReadModeBodyByKey[key] || null
})

/** INFO lines that do not have video: Introduction (intro). */
const lineViewInfoLineHasVideo = computed(() => {
  const id = selectedLine.value?.section?.id
  return id !== 'intro'
})

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
  const baseId = (sectionId || '').replace(/-2$/, '')
  const moves = sectionMoves.value
  if (moves[baseId]) return moves[baseId]
  const shuffled = seededShuffle(uncompletedMoveTitles, sectionId)
  const count = Math.min(total, shuffled.length)
  return shuffled.slice(0, count).map((text, i) => ({
    id: String(i + 1),
    text,
    completed: false,
  }))
}

// V2.4: real course – 6 chapters (start-here removed)
const courseSectionsV24 = [
  { id: 'intro', name: 'Introduction', completed: 0, total: 1, status: 'not_started', videoAvailable: false },
  { id: 'learning-the-game', name: '1) Learning the Game', completed: 0, total: 20, status: 'not_started', videoAvailable: true },
  { id: 'the-opening', name: '2) The Opening', completed: 0, total: 12, status: 'not_started', videoAvailable: true },
  { id: 'tactics-strategy', name: '3) Tactics & Strategy', completed: 0, total: 8, status: 'not_started', videoAvailable: true },
  { id: 'the-endgame', name: '4) The Endgame', completed: 0, total: 14, status: 'not_started', videoAvailable: true },
  { id: 'bringing-it-together', name: '5) Bringing it all Together', completed: 0, total: 5, status: 'not_started', videoAvailable: true },
]

// V2.3: legacy – 7 base sections + 7 Part 2 sections
const courseSectionsV23Base = [
  { id: 'intro', name: 'Introduction', completed: 2, total: 3, status: 'in_progress', videoAvailable: true },
  { id: 'tactical', name: 'Tactical Section', completed: 4, total: 10, status: 'in_progress', videoAvailable: true },
  { id: 'additional', name: 'Additional Tactics', completed: 0, total: 3, status: 'not_started', videoAvailable: true },
  { id: 'games', name: 'The Games - Additional Tactics', completed: 0, total: 18, status: 'not_started', videoAvailable: false },
  { id: 'other', name: 'Other Lines', completed: 0, total: 10, status: 'not_started', videoAvailable: true },
  { id: 'blackmar', name: 'The Blackmar Diemer', completed: 0, total: 20, status: 'not_started', videoAvailable: true },
  { id: 'quiz', name: 'Quiz', completed: 0, total: 2, status: 'not_started', videoAvailable: true },
]
const courseSectionsV23SecondNames = { intro: 'Core Concepts', tactical: 'Pattern Recognition', additional: 'Tactics in Practice', games: 'Master Game Analysis', other: 'Opening Repertoire', blackmar: 'Gambit Lines', quiz: 'Practice Test' }
const courseSectionsV23SecondOverrides = { intro: { completed: 0, status: 'not_started' }, tactical: { completed: 0, status: 'not_started' } }
const courseSectionsV23 = [
  ...courseSectionsV23Base,
  ...courseSectionsV23Base.map((s) => {
    const overrides = courseSectionsV23SecondOverrides[s.id]
    return {
      ...s,
      id: `${s.id}-2`,
      name: courseSectionsV23SecondNames[s.id] ?? `${s.name} (Part 2)`,
      videoAvailable: s.id === 'games' ? false : true,
      ...(overrides || {}),
    }
  }),
]
const courseSections = computed(() => (isVideoV2_4.value ? courseSectionsV24 : courseSectionsV23))

// Count of Ready item Lines (completed moves without level) for Practice button badge
const practiceReadyCount = computed(() => {
  const moves = Object.values(sectionMoves.value).flat()
  return moves.filter(m => m.completed && !m.level).length
})

// ExtraData (Practice Schedule & Level Progress) – placeholder; wire to real data later
const extraDataPracticeIn = ref('1 DAY')
const extraDataLevelBadge = ref('L1')
const extraDataLevelName = ref('Rookie')
const extraDataLevelBadgeNextLevel = ref('L2')
const extraDataLevelNameNextLevel = ref('Keen Learner')

/** Completed lines coach copy: practice wait time – 1 day for L1, 3 days for L2. */
const completedLinePracticeTime = computed(() => {
  const level = selectedLine.value?.move?.level
  return level === 'L2' ? '3 days' : '1 day'
})

/** Level footer "Practice in:" chip – 3 days for Next Level L2, 1 day for L1 (completed and ready lines). */
const displayPracticeIn = computed(() => {
  const move = selectedLine.value?.move
  if (!move) return '1 day'
  const level = move.level || move.nextLevel
  return level === 'L2' ? '3 days' : '1 day'
})

/** On line page: for ready lines, Next Level chip shows move.nextLevel; otherwise use placeholder refs. */
const displayNextLevelBadge = computed(() => {
  const move = selectedLine.value?.move
  if (currentLineType.value === 'ready' && move?.nextLevel) return move.nextLevel
  return extraDataLevelBadgeNextLevel.value
})
const displayNextLevelName = computed(() => {
  const move = selectedLine.value?.move
  if (currentLineType.value === 'ready' && move?.nextLevel) {
    const item = masteryLevelItems.find((m) => m.level === move.nextLevel)
    return item?.title ?? move.nextLevel
  }
  return extraDataLevelNameNextLevel.value
})

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

// Board sync: Line view (selected ply) or Chapter page (hovered line preview for non-ready lines).
watchEffect(() => {
  if (panelView.value === 'line') {
    if (!selectedLine.value) return
    if (currentLineType.value === 'ready') {
      pieces.value = parseFEN(STARTING_FEN)
      lastMove.value = null
      selectedSquare.value = null
      checkmateHighlight.value = null
      return
    }
    if (!lineViewMoves.value?.length) return
    const { fen, lastMove: last } = getPositionAfterPly(lineViewMoves.value, selectedPly.value)
    pieces.value = parseFEN(fen)
    lastMove.value = last
    selectedSquare.value = null
    checkmateHighlight.value = null
    return
  }
  if (panelView.value === 'courses' && hoveredChapterLine.value) {
    const { section, move } = hoveredChapterLine.value
    if (getLineType(move) === 'ready') return
    const moves = getMovesForLine(section, move)
    const { fen, lastMove: last } = getPositionAtEndOfLine(moves)
    pieces.value = parseFEN(fen)
    lastMove.value = last
    selectedSquare.value = null
    checkmateHighlight.value = null
    return
  }
  // Courses, no hover: show default position
  if (panelView.value === 'courses') {
    pieces.value = parseFEN(STARTING_FEN)
    lastMove.value = null
    selectedSquare.value = null
    checkmateHighlight.value = null
  }
})

// Get piece on a specific square
const getPieceOnSquare = (square) => {
  return pieces.value.find(p => p.square === square)
}

// Get piece image path from Chess.com CDN
const getPieceImage = (piece) => {
  return `https://www.chess.com/chess-themes/pieces/neo/300/${piece.type}.png`
}

// Piece letter to design-system glyph name (for move notation)
const PIECE_GLYPH_MAP = {
  Q: 'piece-fill-queen',
  R: 'piece-fill-rook',
  B: 'piece-fill-bishop',
  N: 'piece-fill-knight',
  K: 'piece-fill-king',
  P: 'piece-fill-pawn',
}
const PIECE_ICON_SIZE = 18 // 25% smaller than default 24px
function getPieceIconName(notation) {
  if (!notation || typeof notation !== 'string') return null
  const first = notation.charAt(0)
  if (PIECE_GLYPH_MAP[first]) return PIECE_GLYPH_MAP[first]
  if (first >= 'a' && first <= 'h') return 'piece-fill-pawn' // pawn move e4, exd5
  return null // O-O, O-O-O, etc.
}
function getPieceDisplaySquare(notation) {
  if (!notation || typeof notation !== 'string') return notation
  if (/^[QRBNK]x?[a-h][1-8]/.test(notation)) return notation.slice(1)
  return notation
}
function getDisplayWhiteNotation(pair, idx) {
  if (isQuizLine.value && quizLineContentCurrent.value?.readModeMoveWhite && idx === 0) return quizLineContentCurrent.value.readModeMoveWhite
  return pair?.white
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
// MOVE HANDLING (board is display-only; interaction disabled)
// ============================================
const handleSquareClick = (square) => {
  return // Board interaction disabled on all pages
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
// DRAG & DROP (board is display-only; interaction disabled)
// ============================================
const handleDragStart = (event, square) => {
  return // Board interaction disabled on all pages
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
const isVideoV2 = computed(() => route.path === '/learn/v2')
// V2.2: same as V2 but play button toggles to pause and makes that video sticky
const isVideoV2_2 = computed(() => route.path === '/learn/v2.2')
const v22PlayingSectionId = ref(null) // when set, this section's video shows pause and is sticky
// V2.3: duplicate of V2.2 + sticky chapter title when expanded. V2.4: same layout, real course content.
const isVideoV2_3OrV24 = computed(() => route.path === '/learn/v2.3' || route.path === '/learn/v2.4')
const v23PlayingSectionId = ref(null)
const v23SectionItemRefs = ref(Object.create(null))
function setV23SectionItemRef(sectionId, el) {
  const node = Array.isArray(el) ? el[0] : el
  if (node) {
    v23SectionItemRefs.value[sectionId] = node
  } else {
    delete v23SectionItemRefs.value[sectionId]
  }
}

/** V2.3: do not collapse on scroll – let the sticky unstick naturally so content just scrolls up with no jump. User can collapse by clicking the chapter. */
function onV23Scroll() {
  /* no-op: no programmatic collapse when next chapter touches */
}

let v23ScrollCleanup = null
function setupV23ScrollListener() {
  v23ScrollCleanup?.()
  v23ScrollCleanup = null
  if (!isVideoV2_3OrV24.value || !coursesContentRef.value) return
  const el = coursesContentRef.value
  el.addEventListener('scroll', onV23Scroll, { passive: true })
  v23ScrollCleanup = () => {
    el.removeEventListener('scroll', onV23Scroll)
    v23ScrollCleanup = null
  }
}

const isVideoV3 = computed(() => route.path === '/learn/v3')
const expandedSection = computed(() => {
  const id = [...expandedSectionIds.value][0]
  return id ? (courseSections.value.find((s) => s.id === id) ?? null) : null
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
// When true, hide scroll-up instantly (no leave transition) – used when opening a line
const v3ScrollUpInstantHide = ref(false)
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
    ? courseSections.value.findIndex((s) => s.id === releasedUntil)
    : -1
  const sectionsToConsider = releasedUntilIndex >= 0
    ? courseSections.value.slice(0, releasedUntilIndex + 1)
    : courseSections.value

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
      const currentIndex = courseSections.value.findIndex((s) => s.id === best.id)
      const nextSection = currentIndex >= 0 && currentIndex < courseSections.value.length - 1 ? courseSections.value[currentIndex + 1] : null
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
  const i = courseSections.value.findIndex((s) => s.id === section.id)
  return i >= 0 && i % 2 === 1 ? '#2a2a2a' : '#000000'
}

let v3ScrollCleanup = null
let v3ScrollRaf = null
let v3IntersectionObserver = null

/** V3 (last chapter only): stop scroll when (1) last chapter block is at header, or (2) bottom of last chapter (block + lines) is at viewport bottom. When last chapter is short, set padding so there is no room to scroll past. */
function clampV3Scroll() {
  try {
    if (!isVideoV3.value || !coursesContentRef.value) {
      v3PaddingBottomPx.value = null
      return
    }
    const el = coursesContentRef.value
    const sections = courseSections.value
    if (!sections?.length) {
      v3PaddingBottomPx.value = null
      return
    }
    const lastSection = sections[sections.length - 1]
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
      const toSet = Number.isFinite(newPaddingPx) ? newPaddingPx : null
      if (v3PaddingBottomPx.value !== toSet) {
        v3PaddingBottomPx.value = toSet
      }
    } else {
      if (v3PaddingBottomPx.value !== null) {
        v3PaddingBottomPx.value = null
      }
    }

    const maxScrollTop = Math.max(
      0,
      contentShorterThanViewport ? maxWhenBlockAtTop : Math.max(maxWhenBlockAtTop, bottomLimit)
    )
    v3MaxScrollTop.value = maxScrollTop
    if (el.scrollTop > maxScrollTop) {
      el.scrollTop = maxScrollTop
    }
  } catch (_) {
    v3PaddingBottomPx.value = null
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
  const sectionIds = courseSections.value.map((s) => s.id)
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

// Line view: video with resize, default large; shrink to small on first scroll when content is scrollable
const lineViewVideoFormat = ref('large')
const lineViewVideoSectionRef = ref(null)
const lineViewScrollBodyRef = ref(null)
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
  const rawW = lineViewVideoSectionRef.value?.clientWidth ?? 0
  const scrollBodyW = lineViewScrollBodyRef.value?.clientWidth ?? 0
  const w = (rawW > 0) ? rawW : ((scrollBodyW > 0) ? scrollBodyW : 460)
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

// Line view only: shrink video when user scrolls down (if scrollable); expand back to large when user scrolls to top. INFO: video is scrollable, keep large.
const LINE_VIEW_VIDEO_SMALL_COOLDOWN_MS = 400
let lineViewVideoLastSetToSmallAt = 0
function onLineViewScrollBodyScroll() {
  if (currentLineType.value === 'info') return
  const el = lineViewScrollBodyRef.value
  if (!el || !showVideoSection.value) return
  const scrollable = el.scrollHeight > el.clientHeight
  if (el.scrollTop <= 0) {
    const now = Date.now()
    if (now - lineViewVideoLastSetToSmallAt > LINE_VIEW_VIDEO_SMALL_COOLDOWN_MS) {
      lineViewVideoFormat.value = 'large'
    }
  } else if (scrollable && lineViewVideoFormat.value === 'large') {
    lineViewVideoFormat.value = 'small'
    lineViewVideoLastSetToSmallAt = Date.now()
  }
}

let lineViewScrollElWithListener = null
function attachLineViewScrollListenerIfNeeded() {
  const el = lineViewScrollBodyRef.value
  if (panelView.value !== 'line' || !el) {
    if (lineViewScrollElWithListener) {
      lineViewScrollElWithListener.removeEventListener('scroll', onLineViewScrollBodyScroll)
      lineViewScrollElWithListener = null
    }
    return
  }
  if (lineViewScrollElWithListener !== el) {
    if (lineViewScrollElWithListener) {
      lineViewScrollElWithListener.removeEventListener('scroll', onLineViewScrollBodyScroll)
    }
    el.addEventListener('scroll', onLineViewScrollBodyScroll, { passive: true })
    lineViewScrollElWithListener = el
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
  // In read mode, toggling video must not show the coach (read mode stays on)
  showVideoSection.value = !showVideoSection.value
}

// V2.2: toggle play/pause on video container (shows pause when "playing", makes video sticky)
function toggleV22VideoPlay(sectionId) {
  v22PlayingSectionId.value = v22PlayingSectionId.value === sectionId ? null : sectionId
}
// V2.3: same as V2.2
function toggleV23VideoPlay(sectionId) {
  v23PlayingSectionId.value = v23PlayingSectionId.value === sectionId ? null : sectionId
}

// V2 / V2.2 / V2.3: show video by default (per-chapter blocks rendered below each chapter)
watch([isVideoV2, isVideoV2_2, isVideoV2_3OrV24, isVideoV3], ([v2, v22, v23, v3]) => {
  if (v2 || v22 || v23 || v3) showVideoSection.value = true
}, { immediate: true })

// Line view only: attach scroll listener to shrink video when user scrolls (if content is scrollable)
watchEffect(() => {
  panelView.value
  lineViewScrollBodyRef.value
  nextTick(() => {
    attachLineViewScrollListenerIfNeeded()
  })
})


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

watch([isVideoV2_3OrV24, coursesContentRef], () => {
  setupV23ScrollListener()
}, { immediate: true })

onMounted(() => {
  nextTick(setupV3ScrollListener)
  nextTick(setupV23ScrollListener)
})

onUnmounted(() => {
  v23ScrollCleanup?.()
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
          <div class="chessboard chessboard--no-interaction" ref="boardRef">
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
                type="button"
                class="sidebar-header-back"
                :aria-label="panelView === 'line' ? 'Back to chapter' : 'Back'"
                @click="onHeaderBackClick"
              >
                <CcIcon :name="icons.back" variant="glyph" :size="20" />
              </button>
            </div>
            <div class="sidebar-header-title" :class="{ 'sidebar-header-title--line': panelView === 'line' }">
              <img v-if="panelView === 'courses'" :src="baseUrl + 'icons/book-mark-aqua.png'" alt="" class="sidebar-header-icon" width="24" height="24" aria-hidden="true" />
              <span class="sidebar-header-text" :class="{ 'sidebar-header-text--truncate': panelView === 'line' }">{{ panelView === 'line' ? (isVideoV2_3OrV24 ? (selectedLine?.section?.name ?? 'Chapter') : (selectedLine?.move?.text ?? 'Line')) : 'Courses' }}</span>
            </div>
            <div class="sidebar-header-right" aria-hidden="true" />
          </header>

          <!-- V2.3 Line view only: VariationsHeadline row (check + line title + level chip | prev/next chevrons) -->
          <div v-if="isVideoV2_3OrV24 && panelView === 'line'" class="variations-headline" data-name="VariationsHeadline">
            <span class="variations-headline-border" aria-hidden="true" />
            <button
              type="button"
              class="variations-headline-btn variations-headline-btn--nav"
              aria-label="Previous line"
              :disabled="!hasPrevLine"
              @click="goToPrevLine"
            >
              <CcIcon name="arrow-chevron-left" variant="glyph" :size="16" class="variations-headline-icon" />
            </button>
            <div class="variations-headline-center">
              <div class="variations-headline-check-wrap" :class="{ 'variations-headline-check-wrap--uncompleted': selectedLine?.move && !selectedLine.move.completed }" aria-hidden="true">
                <CcIcon name="mark-check" variant="glyph" :size="16" class="variations-headline-check" />
              </div>
              <span class="variations-headline-title">{{ selectedLine?.move?.text ?? 'Line' }}</span>
            </div>
            <button
              type="button"
              class="variations-headline-btn variations-headline-btn--nav"
              aria-label="Next line"
              :disabled="!hasNextLine"
              @click="goToNextLine"
            >
              <CcIcon name="arrow-chevron-right" variant="glyph" :size="16" class="variations-headline-icon" />
            </button>
          </div>

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
          <section ref="videoSectionRef" v-show="showVideoSection && !isVideoV2 && !isVideoV2_2 && !isVideoV2_3OrV24 && !isVideoV3" class="video-section" data-name="VideoSection">
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
          <template v-if="!showVideoSection || isVideoV2 || isVideoV2_2 || isVideoV2_3OrV24 || isVideoV3">
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

          <div v-show="false" class="course-lines-row">
            <span class="course-lines-count">{{ courseTotalLines }} lines</span>
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
            <div
              v-for="(section, sectionIndex) in courseSections"
              :key="section.id"
              class="section-item"
              :data-section-id="section.id"
              :ref="isVideoV2_3OrV24 ? (el) => setV23SectionItemRef(section.id, el) : undefined"
            >
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
                          <span class="chapter-count">{{ getSectionChapterCountDisplay(section) }}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                  <!-- Video under each chapter – hidden for "The Games..." (id: games) only -->
                  <section v-if="showVideoSection && section.videoAvailable" class="video-section video-section--inline" :data-name="`VideoSection-${section.id}`">
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
                        @mouseenter="setHoveredChapterLine(section, move)"
                        @mouseleave="clearHoveredChapterLine()"
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
                            <span v-else-if="move.completed && move.info" class="move-item-info-wrap" aria-hidden="true">
                              <CcChip label="INFO" color="gray" variant="translucent" :is-uppercase="false" label-class="move-item-info-chip-label" />
                            </span>
                            <span v-else-if="move.completed" class="move-item-indicator-wrap" aria-hidden="true">
                              <span class="move-item-dot" />
                            </span>
                            <span v-else-if="move.info" class="move-item-info-wrap" aria-hidden="true">
                              <CcChip label="INFO" color="gray" variant="translucent" :is-uppercase="false" label-class="move-item-info-chip-label" />
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
                <!-- V2.3: always use wrap so collapse can animate smoothly (no layout jump when next chapter touches) -->
                <div v-if="isVideoV2_3OrV24" class="v23-section-sticky-wrap">
                  <button
                    type="button"
                    class="chapter-v2"
                    :class="{ 'chapter-v2--sticky-title-v23': isSectionExpanded(section.id) }"
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
                        <span class="chapter-count">{{ getSectionChapterCountDisplay(section) }}</span>
                        <span class="chapter-chevron-wrap" aria-hidden="true">
                          <CcIcon name="arrow-chevron-bottom" variant="glyph" :size="16" class="chapter-chevron" />
                        </span>
                      </div>
                    </div>
                  </button>
                  <div
                    class="v23-expandable"
                    :class="{ 'v23-expandable--open': isSectionExpanded(section.id) }"
                  >
                    <div
                      class="v22-chapter-video-block"
                      :class="{ 'v22-chapter-video-block--sticky': (isVideoV2_2 && v22PlayingSectionId === section.id) || (isVideoV2_3OrV24 && v23PlayingSectionId === section.id) }"
                    >
                      <section
                        v-if="(isVideoV2 || isVideoV2_2 || isVideoV2_3OrV24) && showVideoSection && section.videoAvailable && isSectionExpanded(section.id)"
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
                            :aria-label="(isVideoV2_2 && v22PlayingSectionId === section.id) || (isVideoV2_3OrV24 && v23PlayingSectionId === section.id) ? 'Pause video' : 'Play video'"
                            @click="isVideoV2_2 ? toggleV22VideoPlay(section.id) : isVideoV2_3OrV24 ? toggleV23VideoPlay(section.id) : undefined"
                          >
                            <CcIcon
                              :name="(isVideoV2_2 && v22PlayingSectionId === section.id) || (isVideoV2_3OrV24 && v23PlayingSectionId === section.id) ? 'media-control-pause' : 'media-control-play'"
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
                          @mouseenter="setHoveredChapterLine(section, move)"
                          @mouseleave="clearHoveredChapterLine()"
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
                              <span v-else-if="move.completed && move.info" class="move-item-info-wrap" aria-hidden="true">
                                <CcChip label="INFO" color="gray" variant="translucent" :is-uppercase="false" label-class="move-item-info-chip-label" />
                              </span>
                              <span v-else-if="move.completed" class="move-item-indicator-wrap" aria-hidden="true">
                                <span class="move-item-dot" />
                              </span>
                              <span v-else-if="move.info" class="move-item-info-wrap" aria-hidden="true">
                                <CcChip label="INFO" color="gray" variant="translucent" :is-uppercase="false" label-class="move-item-info-chip-label" />
                              </span>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </Transition>
                  </div>
                </div>
                <!-- V2.2 only (no wrap): same structure without v23-section-sticky-wrap -->
                <template v-else>
                <div
                  class="v22-chapter-video-block"
                  :class="{
                    'v22-chapter-video-block--sticky': (isVideoV2_2 && v22PlayingSectionId === section.id) || (isVideoV2_3OrV24 && v23PlayingSectionId === section.id),
                    'v22-chapter-video-block--v23-sticky-title': isVideoV2_3OrV24 && isSectionExpanded(section.id)
                  }"
                >
                  <button
                    type="button"
                    class="chapter-v2"
                    :class="{
                      'chapter-v2--sticky-under-video': showVideoSection && !isVideoV2 && !isVideoV2_2 && !isVideoV2_3OrV24 && isSectionExpanded(section.id),
                      'chapter-v2--sticky-title-v23': isVideoV2_3OrV24 && isSectionExpanded(section.id)
                    }"
                    :style="showVideoSection && !isVideoV2 && !isVideoV2_2 && !isVideoV2_3OrV24 && isSectionExpanded(section.id) ? { '--sticky-under-video-top': videoSectionHeightPx + 'px' } : undefined"
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
                        <span class="chapter-count">{{ getSectionChapterCountDisplay(section) }}</span>
                        <span class="chapter-chevron-wrap" aria-hidden="true">
                          <CcIcon name="arrow-chevron-bottom" variant="glyph" :size="16" class="chapter-chevron" />
                        </span>
                      </div>
                    </div>
                  </button>
                  <section
                    v-if="(isVideoV2 || isVideoV2_2 || isVideoV2_3OrV24) && showVideoSection && section.videoAvailable && isSectionExpanded(section.id)"
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
                        :aria-label="(isVideoV2_2 && v22PlayingSectionId === section.id) || (isVideoV2_3OrV24 && v23PlayingSectionId === section.id) ? 'Pause video' : 'Play video'"
                        @click="isVideoV2_2 ? toggleV22VideoPlay(section.id) : isVideoV2_3OrV24 ? toggleV23VideoPlay(section.id) : undefined"
                      >
                        <CcIcon
                          :name="(isVideoV2_2 && v22PlayingSectionId === section.id) || (isVideoV2_3OrV24 && v23PlayingSectionId === section.id) ? 'media-control-pause' : 'media-control-play'"
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
                        @mouseenter="setHoveredChapterLine(section, move)"
                        @mouseleave="clearHoveredChapterLine()"
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
                            <span v-else-if="move.completed && move.info" class="move-item-info-wrap" aria-hidden="true">
                              <CcChip label="INFO" color="gray" variant="translucent" :is-uppercase="false" label-class="move-item-info-chip-label" />
                            </span>
                            <span v-else-if="move.completed" class="move-item-indicator-wrap" aria-hidden="true">
                              <span class="move-item-dot" />
                            </span>
                            <span v-else-if="move.info" class="move-item-info-wrap" aria-hidden="true">
                              <CcChip label="INFO" color="gray" variant="translucent" :is-uppercase="false" label-class="move-item-info-chip-label" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </template>
              </template>
          </div>
          </div>
          </div>
          </template>
          <template v-else-if="panelView === 'line'">
          <div class="panel-content courses-content line-view-content" :class="`line-view-content--${currentLineType}`">
            <!-- COMPLETED LINES SCREEN – design for lines with level (e.g. L1, L2). Do not mix with ready. -->
            <template v-if="currentLineType === 'completed'">
              <section v-if="!isLineReadMode" class="coach-new" data-name="CoachNew">
                <div class="coach-new-card" data-name="Quiz">
                  <div class="coach-new-inner">
                    <img :src="baseUrl + 'icons/misc/time-rapid.png'" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                    <div class="coach-new-message">
                      <p class="coach-new-body">You've learned this line already. Come back in {{ completedLinePracticeTime }} to practice.</p>
                    </div>
                  </div>
                </div>
              </section>
              <div ref="lineViewScrollBodyRef" class="line-view-scroll-body">
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
                        ><CcIcon v-if="getPieceIconName(pair.white)" :name="getPieceIconName(pair.white)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ getPieceDisplaySquare(pair.white) || pair.white }}</span></span>
                      </div>
                      <div class="ply-classification">
                        <span class="ply-classification-placeholder" aria-hidden="true" />
                        <span
                          class="ply-chip"
                          :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') && pair.black, 'ply-chip--empty': !pair.black }"
                          @click="pair.black && selectPly(idx, 'black')"
                        ><CcIcon v-if="pair.black && getPieceIconName(pair.black)" :name="getPieceIconName(pair.black)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ pair.black ? (getPieceDisplaySquare(pair.black) || pair.black) : '' }}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- READY LINES SCREEN – hand-with-pawn (color by side to move), copy, CTA Practice (primary) + Learn Again (secondary) -->
            <template v-else-if="currentLineType === 'ready'">
              <section v-if="!isLineReadMode" class="coach-new" data-name="CoachNew">
                <div class="coach-new-card" data-name="Quiz">
                  <div class="coach-new-inner">
                    <img :src="baseUrl + 'icons/misc/' + readyLineCoachIcon" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                    <div class="coach-new-message">
                      <p class="coach-new-body">It's time to practice this line!</p>
                    </div>
                  </div>
                </div>
              </section>
              <div ref="lineViewScrollBodyRef" class="line-view-scroll-body">
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
                        ><CcIcon v-if="getPieceIconName(pair.white)" :name="getPieceIconName(pair.white)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ getPieceDisplaySquare(pair.white) || pair.white }}</span></span>
                      </div>
                      <div class="ply-classification">
                        <span class="ply-classification-placeholder" aria-hidden="true" />
                        <span
                          class="ply-chip"
                          :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') && pair.black, 'ply-chip--empty': !pair.black }"
                          @click="pair.black && selectPly(idx, 'black')"
                        ><CcIcon v-if="pair.black && getPieceIconName(pair.black)" :name="getPieceIconName(pair.black)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ pair.black ? (getPieceDisplaySquare(pair.black) || pair.black) : '' }}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <!-- INFORMATIONAL LINES SCREEN – coach + video + text body + moves (table or inline); single Continue Learning button -->
            <template v-else-if="currentLineType === 'info'">
              <section v-if="!isLineReadMode" class="coach-new" data-name="CoachNew">
                <div class="coach-new-card" data-name="Quiz">
                  <div class="coach-new-inner">
                    <img :src="baseUrl + 'icons/misc/circle-blue-info.png'" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                    <div class="coach-new-message">
                      <p class="coach-new-body coach-new-body--info-only">{{ infoLineContentCurrent?.coachMessage }}</p>
                    </div>
                  </div>
                </div>
              </section>
              <div ref="lineViewScrollBodyRef" class="line-view-scroll-body">
                <section ref="lineViewVideoSectionRef" v-show="showVideoSection && lineViewInfoLineHasVideo" class="video-section" :class="{ 'video-section--inline': currentLineType === 'info' }" data-name="VideoSection">
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
                <template v-if="infoLineContentCurrent?.movesInBody && lineViewMoves?.length">
                  <div class="info-line-body cc-paragraph-medium" v-html="infoLineContentCurrent.introBodyHtml" />
                  <template v-for="(pair, idx) in lineViewMoves" :key="idx">
                    <div class="line-view-moves">
                      <div
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
                            ><CcIcon v-if="getPieceIconName(pair.white)" :name="getPieceIconName(pair.white)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ getPieceDisplaySquare(pair.white) || pair.white }}</span></span>
                          </div>
                          <div class="ply-classification">
                            <span class="ply-classification-placeholder" aria-hidden="true" />
                            <span
                              class="ply-chip ply-chip--empty"
                            ><span class="ply-chip-text"></span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="infoLineContentCurrent?.moveExplanations?.[idx]" class="info-line-body cc-paragraph-medium info-line-move-explanation" v-html="infoLineContentCurrent.moveExplanations[idx]"></div>
                  </template>
                  <div class="info-line-body cc-paragraph-medium" v-html="infoLineContentCurrent.closingBodyHtml" />
                </template>
                <template v-else>
                  <div v-if="infoLineContentCurrent?.hasMoves && lineViewMoves?.length" :class="infoLineContentCurrent?.movesLayout === 'inline' ? 'line-view-moves line-view-moves--inline' : 'line-view-moves'">
                    <template v-if="infoLineContentCurrent?.movesLayout === 'inline'">
                      <div class="line-view-moves-inline">
                        <template v-for="(pair, idx) in lineViewMoves" :key="idx">
                          <span
                            v-if="pair.white"
                            class="line-view-move-inline-chip"
                            :class="{ 'line-view-move-inline-chip--selected': isPlySelected(idx, 'white') }"
                            @click="selectPly(idx, 'white')"
                          ><span class="line-view-move-inline-chip-inner">{{ pair.number }}. </span><CcIcon v-if="getPieceIconName(pair.white)" :name="getPieceIconName(pair.white)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="line-view-move-inline-piece-icon" /><span class="line-view-move-inline-chip-inner"> {{ getPieceDisplaySquare(pair.white) }} --</span></span>
                          <span v-if="idx < lineViewMoves.length - 1" class="line-view-moves-inline-sep"> </span>
                        </template>
                      </div>
                    </template>
                    <template v-else>
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
                            ><CcIcon v-if="getPieceIconName(pair.white)" :name="getPieceIconName(pair.white)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ getPieceDisplaySquare(pair.white) || pair.white }}</span></span>
                          </div>
                          <div class="ply-classification">
                            <span class="ply-classification-placeholder" aria-hidden="true" />
                            <span
                              class="ply-chip"
                              :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') && pair.black, 'ply-chip--empty': !pair.black }"
                              @click="pair.black && selectPly(idx, 'black')"
                            ><CcIcon v-if="pair.black && getPieceIconName(pair.black)" :name="getPieceIconName(pair.black)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ pair.black ? (getPieceDisplaySquare(pair.black) || pair.black) : '' }}</span></span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div v-if="infoLineContentCurrent?.bodyHtml" class="info-line-body-wrap" @click="onInlinePlyChipClick">
                    <div class="info-line-body cc-paragraph-medium" v-html="infoLineContentCurrent.bodyHtml" />
                  </div>
                </template>
              </div>
            </template>
            <!-- UNCOMPLETED LINES SCREEN – read mode (no coach, video + content/moves) or default (coach + video/moves or quiz learn) -->
            <template v-else>
              <!-- Read mode ON: no coach; for quiz = video + content + move + caption; else video + moves -->
              <template v-if="isLineReadMode">
                <div ref="lineViewScrollBodyRef" class="line-view-scroll-body">
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
                  <div v-if="isQuizLine && quizLineContentCurrent?.bodyHtml" class="info-line-body-wrap" @click="onInlinePlyChipClick">
                    <div class="info-line-body cc-paragraph-medium" v-html="quizLineContentCurrent.bodyHtml" />
                  </div>
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
                          ><CcIcon v-if="getPieceIconName(getDisplayWhiteNotation(pair, idx))" :name="getPieceIconName(getDisplayWhiteNotation(pair, idx))" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ getPieceDisplaySquare(getDisplayWhiteNotation(pair, idx)) || getDisplayWhiteNotation(pair, idx) }}</span></span>
                        </div>
                        <div class="ply-classification">
                          <span class="ply-classification-placeholder" aria-hidden="true" />
                          <span
                            class="ply-chip"
                            :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') && pair.black, 'ply-chip--empty': !pair.black }"
                            @click="pair.black && selectPly(idx, 'black')"
                          ><CcIcon v-if="pair.black && getPieceIconName(pair.black)" :name="getPieceIconName(pair.black)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ pair.black ? (getPieceDisplaySquare(pair.black) || pair.black) : '' }}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <template v-if="isQuizLine && (quizLineContentCurrent?.readModeCaptionHtml || quizLineContentCurrent?.readModeCaption)">
                    <div v-if="quizLineContentCurrent?.readModeCaptionHtml" class="quiz-line-read-caption-wrap" @click="onInlinePlyChipClick">
                    <p class="quiz-line-read-caption quiz-line-read-caption--html" v-html="quizLineContentCurrent.readModeCaptionHtml"></p>
                  </div>
                    <p v-else class="quiz-line-read-caption">{{ quizLineContentCurrent.readModeCaption }}</p>
                  </template>
                  <div v-if="lineReadModeBodyCurrent?.bodyHtml" class="info-line-body-wrap">
                    <div class="info-line-body cc-paragraph-medium" v-html="lineReadModeBodyCurrent.bodyHtml" />
                  </div>
                </div>
              </template>
              <!-- Quiz learn mode (read mode OFF): coach + text only; no video, no moves -->
              <template v-else-if="isQuizLine && quizLineContentCurrent">
                <section class="coach-new" data-name="CoachNew">
                  <div class="coach-new-card" data-name="Quiz">
                    <div class="coach-new-inner">
                      <img :src="baseUrl + 'icons/misc/play-white.png'" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                      <div class="coach-new-message">
                        <div class="coach-new-header">
                          <span class="coach-new-title">{{ quizLineContentCurrent.coachTitle }}</span>
                        </div>
                        <p class="coach-new-body">{{ quizLineContentCurrent.coachBody }}</p>
                      </div>
                    </div>
                  </div>
                </section>
                <div ref="lineViewScrollBodyRef" class="line-view-scroll-body">
                  <div class="info-line-body-wrap" @click="onInlinePlyChipClick">
                    <div class="info-line-body cc-paragraph-medium" v-html="quizLineContentCurrent.bodyHtml" />
                  </div>
                </div>
              </template>
              <!-- Default uncompleted: hand-with-pawn (white/black by side to move), copy, CTA Learn + Practice disabled -->
              <template v-else>
                <section class="coach-new" data-name="CoachNew">
                  <div class="coach-new-card" data-name="Quiz">
                    <div class="coach-new-inner">
                      <img :src="baseUrl + 'icons/misc/' + uncompletedLineCoachIcon" alt="" class="coach-new-icon" width="32" height="32" aria-hidden="true" />
                      <div class="coach-new-message">
                        <p class="coach-new-body">Let's learn this line together.</p>
                      </div>
                    </div>
                  </div>
                </section>
                <div ref="lineViewScrollBodyRef" class="line-view-scroll-body">
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
                          ><CcIcon v-if="getPieceIconName(pair.white)" :name="getPieceIconName(pair.white)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ getPieceDisplaySquare(pair.white) || pair.white }}</span></span>
                        </div>
                        <div class="ply-classification">
                          <span class="ply-classification-placeholder" aria-hidden="true" />
                          <span
                            class="ply-chip"
                            :class="{ 'ply-chip--selected': isPlySelected(idx, 'black') && pair.black, 'ply-chip--empty': !pair.black }"
                            @click="pair.black && selectPly(idx, 'black')"
                          ><CcIcon v-if="pair.black && getPieceIconName(pair.black)" :name="getPieceIconName(pair.black)" variant="glyph" :customSize="PIECE_ICON_SIZE" class="ply-chip-piece-icon" /><span class="ply-chip-text">{{ pair.black ? (getPieceDisplaySquare(pair.black) || pair.black) : '' }}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </template>

        </div>
        <!-- Footer frame: bg/secondary; inner container has primary + overlay -->
        <div class="panel-footer-frame">
        <div class="panel-footer-container" :class="{ 'panel-footer-container--no-icon-footer': !(panelView === 'courses' || panelView === 'line') }">
          <!-- Level footer: Practice in (completed) or Ready (ready lines) + Next Level – Lines only; hidden on uncompleted -->
          <div v-if="panelView === 'line' && currentLineType !== 'uncompleted' && currentLineType !== 'info'" class="extra-data" data-name="LevelFooter">
            <!-- Completed lines: Practice in + time chip -->
            <div v-if="currentLineType === 'completed'" class="extra-data-practice-in" data-name="PracticeIn">
              <span class="extra-data-label">Practice in:</span>
              <CcChip
                :label="displayPracticeIn"
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
                :label="displayPracticeIn"
                icon="time-clock"
                color="gray"
                variant="translucent"
                :is-uppercase="true"
                label-class="extra-data-time-chip-label"
                class="extra-data-time-chip"
              />
            </div>
            <div class="extra-data-next-level" data-name="NextLevel">
              <span class="extra-data-label">Next Level:</span>
              <div class="extra-data-level-chip" data-name="LevelChip">
                <CcChip
                  :label="displayNextLevelBadge"
                  color="aqua"
                  variant="translucent"
                  :is-uppercase="false"
                  label-class="extra-data-level-chip-label"
                />
                <span class="extra-data-level-name">{{ displayNextLevelName }}</span>
              </div>
            </div>
          </div>
          <!-- Buttons footer: Continue / Practice – Chapter and Lines; Read mode: Back + Continue -->
          <section class="footer-section footer-section-actions" data-name="ButtonsFooter">
            <!-- Read mode ON: Back (S) exits read mode + nav; Continue (P) -->
            <div v-if="panelView === 'line' && isLineReadMode" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="secondary" size="large" class="footer-btn-equal" @click="exitReadMode">Back</CcButton>
                <CcButton variant="primary" size="large" class="footer-btn-equal" @click="hasNextLine ? goToNextLine() : backToCourses()">Continue</CcButton>
              </div>
            </div>
            <!-- Completed lines: Learn Again (secondary) + Practice (disabled, no badge) -->
            <div v-else-if="panelView === 'line' && currentLineType === 'completed'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="secondary" size="large" class="footer-btn-equal">Learn Again</CcButton>
                <CcButton variant="primary" size="large" disabled class="footer-btn-equal">Practice</CcButton>
              </div>
            </div>
            <!-- Ready lines: Practice (primary) + Learn Again (secondary) -->
            <div v-else-if="panelView === 'line' && currentLineType === 'ready'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="primary" size="large" class="footer-btn-equal">Practice</CcButton>
                <CcButton variant="secondary" size="large" class="footer-btn-equal">Learn Again</CcButton>
              </div>
            </div>
            <!-- Quiz line learn mode: single Hint (secondary) -->
            <div v-else-if="panelView === 'line' && currentLineType === 'uncompleted' && isQuizLine" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-full">
                <CcButton variant="secondary" size="large" class="footer-btn-full" @click="handleHint">Hint</CcButton>
              </div>
            </div>
            <!-- Uncompleted lines: Learn (primary/green) + Practice (secondary, disabled, no badge) -->
            <div v-else-if="panelView === 'line' && currentLineType === 'uncompleted'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-split">
                <CcButton variant="primary" size="large" class="footer-btn-equal">Learn</CcButton>
                <CcButton variant="secondary" size="large" disabled class="footer-btn-equal">Practice</CcButton>
              </div>
            </div>
            <!-- Informational lines: single Next Line button -->
            <div v-else-if="panelView === 'line' && currentLineType === 'info'" class="footer-buttons-container">
              <div class="footer-buttons-row footer-buttons-row-full">
                <CcButton variant="primary" size="large" class="footer-btn-full" @click="hasNextLine ? goToNextLine() : backToCourses()">Next Line</CcButton>
              </div>
            </div>
            <div v-else-if="showLessonActions" class="footer-buttons-container">
                <template v-if="questionState === 'solution' && currentQuestionIndex >= totalChallenges - 1">
                  <div class="footer-buttons-row footer-buttons-row-full">
                    <CcButton variant="primary" size="large" :icon="{ name: 'arrow-line-right', variant: 'glyph' }" @click="handleComplete" class="footer-btn-full">Complete</CcButton>
                  </div>
                </template>
                <template v-else-if="questionState === 'wrong'">
                  <!-- Quiz line: single Hint (secondary) instead of Solution + Retry -->
                  <div v-if="isQuizLine" class="footer-buttons-row footer-buttons-row-full">
                    <CcButton variant="secondary" size="large" class="footer-btn-full" @click="handleHint">Hint</CcButton>
                  </div>
                  <div v-else class="footer-buttons-row footer-buttons-row-split">
                    <CcButton variant="secondary" size="large" :icon="{ name: 'circle-fill-question', variant: 'glyph' }" @click="showSolution">Solution</CcButton>
                    <CcButton variant="danger" size="large" :icon="{ name: 'arrow-spin-undo', variant: 'glyph' }" @click="handleRetry">Retry</CcButton>
                  </div>
                </template>
                <template v-else-if="practiceReadyCount === 0">
                  <!-- Practice 0: Continue (green) + Practice (disabled, grey, no badge) -->
                  <div class="footer-buttons-row footer-buttons-row-split">
                    <CcButton variant="primary" size="large" class="footer-btn-equal">Continue</CcButton>
                    <CcButton variant="secondary" size="large" disabled class="footer-btn-equal">Practice</CcButton>
                  </div>
                </template>
                <template v-else>
                  <!-- Continue (secondary) + Practice (primary with badge) -->
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

          <!-- Icon footer (3rd footer): Chapter + Line (completed/ready); hidden on Line uncompleted so CTAs get 12px there -->
          <section v-if="panelView === 'courses' || panelView === 'line'" class="footer-section footer-section-toolbar" data-name="IconFooter">
            <div class="footer-icon-group" data-name="V6 Icon Button Ghost Stack">
              <button type="button" class="footer-icon-btn" aria-label="More options">
                <CcIcon :name="icons.ellipsis" variant="glyph" :size="20" class="footer-icon" />
              </button>
              <button type="button" class="footer-icon-btn" :aria-label="showVideoSection ? 'Hide video' : 'Show video'" :disabled="panelView === 'line' && !isLineReadMode && (currentLineType === 'info' && selectedLine?.section?.id === 'intro' || isQuizLine)" @click="openVideo">
                <CcIcon :name="showVideoSection ? icons.videoOff : icons.videoOn" variant="glyph" :size="20" class="footer-icon" />
              </button>
              <button
                v-if="panelView === 'line' && currentLineType !== 'info' && currentLineType !== 'ready'"
                type="button"
                class="footer-icon-btn"
                :aria-label="isLineReadMode ? 'Read mode off' : 'Read mode'"
                @click="toggleLineReadMode"
              >
                <img v-if="isLineReadMode" :src="baseUrl + 'icons/misc/read-mode-off.svg'" alt="" class="footer-icon footer-icon-img" width="20" height="20" aria-hidden="true" />
                <CcIcon v-else name="document-book-open" variant="glyph" :size="20" class="footer-icon" />
              </button>
            </div>
            <div class="footer-icon-group" data-name="V6 Icon Button Ghost Stack">
              <button
                type="button"
                class="footer-icon-btn"
                :disabled="!(panelView === 'line' && (currentLineType === 'completed' || currentLineType === 'uncompleted' || (currentLineType === 'info' && lineViewMoves?.length)) && hasPreviousPlyInLine())"
                aria-label="Previous"
                @click="panelView === 'line' ? selectPreviousPly() : prevQuestion()"
              >
                <CcIcon name="arrow-chevron-left" variant="glyph" :size="20" class="footer-icon" />
              </button>
              <button
                type="button"
                class="footer-icon-btn"
                :disabled="!(panelView === 'line' && (currentLineType === 'completed' || currentLineType === 'uncompleted' || (currentLineType === 'info' && lineViewMoves?.length)) && hasNextPlyInLine())"
                aria-label="Next"
                @click="onFooterNextClick"
              >
                <CcIcon name="arrow-chevron-right" variant="glyph" :size="20" class="footer-icon" />
              </button>
            </div>
          </section>

          <footer class="panel-footer" />
        </div>
        </div>
        <!-- V3 scroll-up button: wrapper hides instantly when opening a line (no transition delay) -->
        <div class="v3-scroll-up-wrap" :class="{ 'v3-scroll-up-wrap--instant-hide': v3ScrollUpInstantHide }">
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

/* Board is display-only on all pages */
.chessboard--no-interaction {
  pointer-events: none;
  cursor: default;
}

.chessboard--no-interaction .square {
  cursor: default;
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

.chessboard--no-interaction .piece.draggable {
  cursor: default;
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

/* SidebarHeader – left (48px) | title (flex); overlay bg; height 48px; 16px right padding */
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
  padding-right: 16px;
  background: var(--bg-header-overlay, rgba(0, 0, 0, 0.24));
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

/* V2.3 Line view: VariationsHeadline (Figma 56-8135) – back | check + line title + level chip | more */
.variations-headline {
  display: flex;
  align-items: center;
  padding: var(--space-1, 4px);
  position: relative;
  width: 100%;
  height: 48px;
  min-height: 48px;
  flex-shrink: 0;
  background: var(--bg-header-overlay, rgba(0, 0, 0, 0.14));
}
.variations-headline-border {
  position: absolute;
  inset: 0;
  border-bottom: 1px solid var(--border-subtle-white, rgba(255, 255, 255, 0.1));
  pointer-events: none;
}
.variations-headline-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: var(--size-8, 32px);
  height: var(--size-8, 32px);
  min-width: var(--size-8, 32px);
  min-height: var(--size-8, 32px);
  border-radius: var(--radius-sm, 5px);
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
  cursor: pointer;
}
.variations-headline-icon {
  filter: drop-shadow(0 1px rgba(0, 0, 0, 0.2));
}
.variations-headline-btn--nav {
  color: rgba(255, 255, 255, 0.5);
}
.variations-headline-btn--nav:hover:not(:disabled) {
  color: rgba(255, 255, 255, 0.85);
}
.variations-headline-btn--nav:disabled {
  opacity: 0.4;
  cursor: default;
}
.variations-headline-center {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  position: relative;
}
.variations-headline-check-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-5, 20px);
  height: var(--size-5, 20px);
  min-width: var(--size-5, 20px);
  min-height: var(--size-5, 20px);
  border-radius: var(--radius-sm, 5px);
  flex-shrink: 0;
  color: var(--icon-success, #81b64c);
}
.variations-headline-check-wrap--uncompleted {
  opacity: 0.5;
}
.variations-headline-check-wrap--uncompleted .variations-headline-check {
  color: rgba(255, 255, 255, 0.4);
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
}
.variations-headline-check {
  filter: drop-shadow(0 1px rgba(0, 0, 0, 0.2));
}
.variations-headline-title {
  font-family: var(--font-system-semibold, 'Inter', sans-serif);
  font-weight: 600;
  font-size: var(--text-sm-plus, 14px);
  line-height: var(--leading-5, 20px);
  color: rgba(255, 255, 255, 0.72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1 0 0;
  min-width: 1px;
  min-height: 1px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* CoachNew – coach message / ready state (Line view, Figma 32-5549) */
.coach-new {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: 12px;
  padding-bottom: 12px;
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
  display: flex;
  flex-direction: column;
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: 16px;
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
  align-items: baseline;
  gap: 0 6px;
  white-space: normal;
}
.coach-new-header--hidden {
  display: none;
}
.coach-new-body-with-chip .coach-chip-light {
  flex-shrink: 0;
  /* Nudge chip down so its text aligns with body copy (different font-size baselines) */
  transform: translateY(2px);
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
.line-view-moves--inline {
  padding-left: 16px;
  padding-right: 16px;
}
.line-view-moves-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  font-size: var(--text-sm, 13px);
  line-height: 20px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
}
.line-view-move-inline-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: var(--radius-xs, 2px);
  cursor: pointer;
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-weight: 600;
  white-space: nowrap;
}
.line-view-move-inline-chip:hover {
  color: var(--text-primary-bright, #ffffff);
  background: rgba(255, 255, 255, 0.08);
}
.line-view-move-inline-chip--selected {
  background: var(--bg-ply-selected, rgba(255, 255, 255, 0.08));
  box-shadow: 0 2px 0 0 rgba(255, 255, 255, 0.5);
  color: var(--text-primary-bright, #ffffff);
}
.line-view-move-inline-piece-icon {
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  max-width: 18px !important;
  max-height: 18px !important;
}
/* Force 18px for piece icons everywhere: pierce CcIcon and target by container */
.line-view-move-inline-piece-icon :deep(svg),
.ply-chip-piece-icon :deep(svg),
.line-view-move-inline-piece-icon :deep(.cc-icon),
.ply-chip-piece-icon :deep(.cc-icon) {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
}
.line-view-moves-inline .line-view-move-inline-chip :deep(svg),
.line-view-moves-inline .line-view-move-inline-chip :deep(.cc-icon),
.line-view-moves .move-row .ply-chip :deep(svg),
.line-view-moves .move-row .ply-chip :deep(.cc-icon) {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
}
.line-view-moves-inline-sep {
  user-select: none;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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
.ply-chip-piece-icon {
  flex-shrink: 0;
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  max-width: 18px !important;
  max-height: 18px !important;
}
.ply-chip-text {
  flex-shrink: 0;
}
.ply-chip--selected {
  background: var(--bg-ply-selected, rgba(255, 255, 255, 0.08));
  box-shadow: var(--shadow-ply-selected, 0 2px 0 0 rgba(255, 255, 255, 0.5));
  color: var(--text-primary-bright, #ffffff);
}
.ply-chip--empty {
  cursor: default;
  pointer-events: none;
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
  overflow-x: hidden;
  padding: 0 0 var(--space-16) 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
/* Line view: outer container does not scroll; coach stays fixed, only .line-view-scroll-body scrolls */
.panel-content.courses-content.line-view-content {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.line-view-content {
  min-width: 0;
}
/* Line view: scroll only the content below the coach; scrollbar stays inside this area and is always visible */
.line-view-scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: scroll;
  overflow-x: hidden;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
.line-view-scroll-body::-webkit-scrollbar {
  width: 8px;
}
.line-view-scroll-body::-webkit-scrollbar-track {
  background: transparent;
}
.line-view-scroll-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}
.line-view-scroll-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.45);
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

/* Informational line: text-only body (no moves table). Body = DS cc-paragraph-medium (14px / 20px line height). */
.cc-paragraph-medium {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
}
.info-line-body-wrap {
  width: 100%;
  min-width: 0;
}
.quiz-line-read-caption-wrap {
  width: 100%;
  min-width: 0;
}
.info-line-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
  padding: 16px;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
  overflow: visible;
}
.info-line-body p,
.info-line-body .info-line-heading {
  line-height: 20px;
}
.info-line-body p {
  margin: 0 0 20px;
}
.info-line-body p:last-child {
  margin-bottom: 0;
}
.info-line-body .info-line-heading {
  margin: 0 0 10px;
}
.info-line-body .info-line-move-notation {
  margin: 0 0 4px;
}
.info-line-body .info-line-move-notation .inline-ply-chip {
  display: block;
  width: fit-content;
  min-width: 80px;
}
.info-line-body .info-line-divider {
  margin: 20px 0 !important;
}
.info-line-move-explanation {
  margin-top: 4px;
  margin-bottom: 12px;
}
.info-line-move-explanation p {
  margin: 0 0 20px;
}
.info-line-move-explanation p:last-child {
  margin-bottom: 0;
}
.quiz-line-read-caption {
  margin: 16px 0 0;
  padding: 0 var(--space-4, 16px);
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
}
.line-view-moves + .quiz-line-read-caption {
  margin-top: 20px;
}
.quiz-line-read-caption .inline-ply-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: var(--radius-xs, 2px);
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-sm-plus, 14px);
  font-weight: 600;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
  cursor: pointer;
  pointer-events: auto;
  background: var(--bg-ply-selected, rgba(255, 255, 255, 0.08));
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.3);
}
.quiz-line-read-caption .inline-ply-chip:hover {
  color: var(--text-primary-bright, #ffffff);
  background: rgba(255, 255, 255, 0.12);
}
.info-line-body .inline-ply-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 4px;
  border-radius: var(--radius-xs, 2px);
  font-family: var(--font-system-semibold, system-ui, sans-serif);
  font-size: var(--text-sm-plus, 14px);
  font-weight: 600;
  color: var(--text-secondary, rgba(255, 255, 255, 0.72));
  cursor: pointer;
  pointer-events: auto;
  background: var(--bg-ply-selected, rgba(255, 255, 255, 0.08));
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.3);
}
.info-line-body .inline-ply-chip:hover {
  color: var(--text-primary-bright, #ffffff);
  background: rgba(255, 255, 255, 0.12);
}
.info-line-heading {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 18px;
  font-weight: 600;
  line-height: var(--leading-5, 20px);
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 0.5em;
}
.info-line-divider {
  color: rgba(255, 255, 255, 0.35) !important;
  margin: 1em 0 !important;
  letter-spacing: 0.02em;
}

.coach-new-body--info-only {
  margin: 0;
}
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

/* V3 scroll-up wrapper: when opening a line, hide instantly so no transition delay */
.v3-scroll-up-wrap--instant-hide {
  opacity: 0;
  visibility: hidden;
  transition: none;
  pointer-events: none;
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
/* V2.3: wrap extends from chapter row through move list so sticky title's containing block includes all section content – title stays sticky until next section reaches top */
.v23-section-sticky-wrap {
  display: flex;
  flex-direction: column;
}
/* V2.3: expandable area (video + moves) animates height so collapse on scroll has no layout jump */
.v23-expandable {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-out;
}
.v23-expandable--open {
  max-height: 5000px;
  transition: max-height 0.35s ease-in;
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

/* VideoResize – height 16px; bg Material thick dark; bg/subtlest overlay on top */
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
.video-resize::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.04));
  pointer-events: none;
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
  position: relative;
  z-index: 1;
}

/* Progress – Figma node 2-5697 (exact spec: layout, spacing, typography, colors) */
.course-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  gap: 8px;
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

/* V2.3: chapter title stays sticky under header until next chapter row touches it */
.chapter-v2--sticky-title-v23 {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--chapter-selected-bg, #353330);
  box-shadow: 0 1px 0 var(--color-border-subtlest, rgba(255, 255, 255, 0.08));
}
.chapter-v2--sticky-title-v23:hover,
.chapter-v2--sticky-title-v23[aria-expanded="true"] {
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
  font-size: 12px !important;
}

.move-item-info-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.move-item-info-wrap :deep(.move-item-info-chip-label) {
  font-family: var(--font-family-system) !important;
  font-size: 12px !important;
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
  padding: 8px 4px 0 4px;
  background-color: rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
}
.panel-footer-container > * {
  position: relative;
  z-index: 1;
}
/* Uncompleted line (or any state with no level row + no icon footer): align spacing and padding */
.panel-footer-container--no-icon-footer {
  padding: 0 12px 0 12px;
}
.panel-footer-container--no-icon-footer .footer-section-actions {
  margin-top: 12px;
  padding-left: 4px;
  padding-right: 4px;
}

/* Level footer: Practice in / Next Level (Lines page only) */
.extra-data {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 12px 4px 12px;
  margin-top: 0;
  margin-bottom: 0;
  position: relative;
  width: 100%;
  min-width: 0;
  height: fit-content;
  background: unset;
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
  min-width: 0;
  flex-shrink: 0;
  height: 20px;
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
/* Mastery only: Level label + level name – DS text-small-bold (12px / 16px); level name color 72% */
.course-progress-mastery .extra-data-next-level .extra-data-label {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}
.course-progress-mastery .extra-data-level-name {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
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
/* Level footer (Lines page): original size/color – 14px label from .extra-data-label, 14px level name */
.extra-data .extra-data-level-name {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: var(--text-sm-plus, 14px);
  line-height: var(--leading-4, 16px);
  font-weight: 600;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  position: relative;
  flex-shrink: 0;
}
.extra-data-level-name {
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
/* Buttons footer: 2px top when 3rd footer present; 12px when 3rd footer absent (via --no-icon-footer) */
.footer-section-actions {
  justify-content: center;
  padding: 12px;
  gap: 16px;
  width: 100%;
  min-width: 0;
  height: 56px;
  margin: 2px 0 0 0;
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
/* Icon footer: ellipsis, video, prev/next – 4px less gap above (closer to CTAs) */
.footer-section-toolbar {
  justify-content: space-between;
  padding: 12px;
  height: 56px;
  margin-left: 0;
  margin-right: 0;
  margin-top: -4px;
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
.footer-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}
/* Disabled footer icon buttons (video on Welcome, prev/next on ready/uncompleted) */
.footer-section-toolbar .footer-icon-btn:disabled,
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
