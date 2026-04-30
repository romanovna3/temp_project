import { INTRO_1_ASSISTED_STEPS } from './intro1AssistedLearning.js'
import { INTRO_2_ASSISTED_STEPS } from './intro2AssistedLearning.js'
import { INFORMATIONAL_DREAM_OPENING } from './informationalDreamOpening.js'
import { parseUnassistedQuizPath, UNASSISTED_QUIZZES } from './unassistedQuizzes.js'

const dreamOpeningLineTitle = INFORMATIONAL_DREAM_OPENING.lineHeaderTitle

/**
 * Opening-line order (line-header chevrons): video → informational → quiz → intro segments in product flow.
 * URLs: `/move-trainer/page-{1..10}/{slug}` — `lineHeader` in `MoveListHeader`; `kind` drives layout.
 */
const RAW_LINES = [
  { slug: 'video-1', lineHeader: dreamOpeningLineTitle, kind: 'video' },
  { slug: 'informational-1', lineHeader: dreamOpeningLineTitle, kind: 'informational' },
  { slug: 'quiz-1', lineHeader: 'The Dream Opening - Practice', kind: 'quiz' },
  { slug: 'informational-2', lineHeader: "Danny's Ten Opening Rules", kind: 'informational' },
  { slug: 'intro-1', lineHeader: 'Leave the Queen at Home!', kind: 'intro' },
  { slug: 'intro-2', lineHeader: "Don't Try Scholar's Mate", kind: 'intro' },
  { slug: 'quiz-2', lineHeader: 'Review #1', kind: 'quiz' },
  { slug: 'quiz-3', lineHeader: 'Review #2', kind: 'quiz' },
  { slug: 'quiz-4', lineHeader: 'Review #3', kind: 'quiz' },
  { slug: 'intro-3', lineHeader: 'Tactics: Double Attack #1', kind: 'intro' },
]

export const MOVE_TRAINER_LINE_ORDER = RAW_LINES.map((entry, i) => ({
  path: `/move-trainer/page-${i + 1}/${entry.slug}`,
  name: `move-trainer-${entry.slug}`,
  lineHeader: entry.lineHeader,
  kind: entry.kind,
}))

/** Separate entry URL for Move Trainer 2 — same experience as intro-1 (`move-trainer-intro-1`). */
export const MOVE_TRAINER_2_PATH = '/move-trainer/move-trainer-2'

/** Move Trainer 3 — shell matches Opening Courses V3 (layout, board, panel chrome); content TBD. */
export const MOVE_TRAINER_3_PATH = '/move-trainer/move-trainer-3'

const MOVE_TRAINER_2_EQUIVALENT_PATH =
  MOVE_TRAINER_LINE_ORDER.find((e) => e.name === 'move-trainer-intro-1')?.path
  ?? '/move-trainer/page-5/intro-1'

/**
 * Map alternate landing URLs (e.g. Move Trainer 2) to the canonical move-trainer path for logic/navigation.
 * @param {string} routePath
 */
export function canonicalMoveTrainerPath(routePath) {
  const n = normalizeAppPath(routePath).replace(/\/$/, '') || '/'
  const alias = MOVE_TRAINER_2_PATH.replace(/\/$/, '')
  if (n === alias) return MOVE_TRAINER_2_EQUIVALENT_PATH
  return normalizeAppPath(routePath)
}

/** @type {Record<string, { steps: { id: string, coachMessage: string }[] }>} */
export const ASSISTED_INTRO_ROUTES = {
  'intro-1': { steps: INTRO_1_ASSISTED_STEPS },
  'intro-2': { steps: INTRO_2_ASSISTED_STEPS },
}

/** Strip Vite `import.meta.env.BASE_URL` so paths match `MOVE_TRAINER_LINE_ORDER` (e.g. deployed under a subpath). */
export function normalizeAppPath(p) {
  const raw = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL != null
    ? String(import.meta.env.BASE_URL)
    : '/'
  const base = raw.replace(/\/$/, '')
  if (base && base !== '/' && p.startsWith(base)) {
    return p.slice(base.length) || '/'
  }
  return p
}

function basePathForIntroSlug(introSlug) {
  const cfg = ASSISTED_INTRO_ROUTES[introSlug]
  if (!cfg) return ''
  return MOVE_TRAINER_LINE_ORDER.find(e => e.name === `move-trainer-${introSlug}`)?.path ?? ''
}

export function buildIntroAssistedPath(introSlug, stepId) {
  const base = basePathForIntroSlug(introSlug)
  return base && stepId ? `${base}/${stepId}` : ''
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Match assisted URLs with any `page-#` segment (router uses `page-:pageNum`), not only the canonical line path.
 * @returns {{ basePath: string, stepId: string, introSlug: string, steps: { id: string, coachMessage: string }[] } | null}
 */
export function parseIntroAssistedPath(currentPath) {
  const path = normalizeAppPath(currentPath).replace(/\/$/, '')
  for (const introSlug of Object.keys(ASSISTED_INTRO_ROUTES)) {
    const { steps } = ASSISTED_INTRO_ROUTES[introSlug]
    const re = new RegExp(`^(/move-trainer/page-\\d+/${escapeRegExp(introSlug)})/([^/]+)$`)
    const m = path.match(re)
    if (!m) continue
    const basePath = m[1]
    const stepId = m[2]
    if (!steps.some(s => s.id === stepId)) continue
    return { basePath, stepId, introSlug, steps }
  }
  return null
}

/** @param {'intro-1' | 'intro-2'} introSlug */
export function firstIntroAssistedPath(introSlug) {
  const cfg = ASSISTED_INTRO_ROUTES[introSlug]
  const id = cfg?.steps[0]?.id
  return id ? buildIntroAssistedPath(introSlug, id) : null
}

/** @deprecated use parseIntroAssistedPath */
export function parseIntro1AssistedPath(currentPath) {
  const p = parseIntroAssistedPath(currentPath)
  return p?.introSlug === 'intro-1' ? { basePath: p.basePath, stepId: p.stepId } : null
}

/** @deprecated use firstIntroAssistedPath('intro-1') */
export function firstIntro1AssistedPath() {
  return firstIntroAssistedPath('intro-1')
}

/** @deprecated use buildIntroAssistedPath('intro-1', stepId) */
export function buildIntro1AssistedPath(stepId) {
  return buildIntroAssistedPath('intro-1', stepId)
}

/** @param {{ path: string, name?: string }} route */
export function moveTrainerCurrentLine(route) {
  const path = canonicalMoveTrainerPath(route.path).replace(/\/$/, '')
  const assisted = parseIntroAssistedPath(path)
  if (assisted) {
    const baseIdx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.name === `move-trainer-${assisted.introSlug}`)
    if (baseIdx < 0) return null
    const base = MOVE_TRAINER_LINE_ORDER[baseIdx]
    return {
      ...base,
      path,
      kind: 'assisted-learning',
      assistedStepId: assisted.stepId,
      assistedIntroSlug: assisted.introSlug,
      index: baseIdx,
    }
  }

  let uq = parseUnassistedQuizPath(path)
  if (!uq && route.name === 'move-trainer-line-quiz-step') {
    const slug = String(route.params?.slug ?? '')
    const step = parseInt(String(route.params?.step ?? '1'), 10)
    if (slug && /^quiz-\d+$/.test(slug) && !Number.isNaN(step) && step >= 1) {
      uq = {
        slug,
        step,
        hasUnassistedConfig: Object.prototype.hasOwnProperty.call(UNASSISTED_QUIZZES, slug),
      }
    }
  }
  if (uq && uq.hasUnassistedConfig) {
    const baseIdx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.name === `move-trainer-${uq.slug}`)
    if (baseIdx < 0) return null
    return {
      ...MOVE_TRAINER_LINE_ORDER[baseIdx],
      path,
      index: baseIdx,
      unassistedStep: uq.step,
    }
  }

  let idx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.path === path)
  if (idx < 0 && route.name) {
    idx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.name === route.name)
  }
  if (idx < 0) return null
  return { ...MOVE_TRAINER_LINE_ORDER[idx], index: idx }
}

/** Intro-1 assisted flow: quiz (`aq-1`) advances only by playing on the board; branches then linear aq-2 → aq-3 → next line. */
function intro1AssistedNextPath(assisted) {
  const id = assisted.stepId
  if (id === 'aq-1') return null
  if (id === 'aq-1-correct' || id === 'aq-1-incorrect') return buildIntroAssistedPath('intro-1', 'aq-2')
  if (id === 'aq-2') return buildIntroAssistedPath('intro-1', 'aq-3')
  if (id === 'aq-3') {
    const baseIdx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.name === 'move-trainer-intro-1')
    if (baseIdx >= 0 && baseIdx < MOVE_TRAINER_LINE_ORDER.length - 1) {
      return MOVE_TRAINER_LINE_ORDER[baseIdx + 1].path
    }
    return null
  }
  return null
}

function intro1AssistedPrevPath(assisted) {
  const id = assisted.stepId
  if (id === 'aq-1') return null
  if (id === 'aq-1-correct' || id === 'aq-1-incorrect') return buildIntroAssistedPath('intro-1', 'aq-1')
  if (id === 'aq-2') return buildIntroAssistedPath('intro-1', 'aq-1')
  if (id === 'aq-3') return buildIntroAssistedPath('intro-1', 'aq-2')
  return null
}

export function moveTrainerNextPath(currentPath) {
  const path = canonicalMoveTrainerPath(currentPath)
  const uq = parseUnassistedQuizPath(path)
  if (uq && uq.hasUnassistedConfig) {
    const cfg = UNASSISTED_QUIZZES[uq.slug]
    const line = MOVE_TRAINER_LINE_ORDER.find(e => e.name === `move-trainer-${uq.slug}`)
    if (cfg && line && uq.step >= cfg.steps.length) {
      const baseIdx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.name === `move-trainer-${uq.slug}`)
      if (baseIdx >= 0 && baseIdx < MOVE_TRAINER_LINE_ORDER.length - 1) {
        return MOVE_TRAINER_LINE_ORDER[baseIdx + 1].path
      }
      return null
    }
  }
  const assisted = parseIntroAssistedPath(path)
  if (assisted) {
    if (assisted.introSlug === 'intro-1') {
      return intro1AssistedNextPath(assisted)
    }
    const i = assisted.steps.findIndex(s => s.id === assisted.stepId)
    if (i >= 0 && i < assisted.steps.length - 1) {
      return buildIntroAssistedPath(assisted.introSlug, assisted.steps[i + 1].id)
    }
    const baseIdx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.name === `move-trainer-${assisted.introSlug}`)
    if (baseIdx >= 0 && baseIdx < MOVE_TRAINER_LINE_ORDER.length - 1) {
      return MOVE_TRAINER_LINE_ORDER[baseIdx + 1].path
    }
    return null
  }

  const idx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.path === path)
  if (idx < 0 || idx >= MOVE_TRAINER_LINE_ORDER.length - 1) return null
  return MOVE_TRAINER_LINE_ORDER[idx + 1].path
}

export function moveTrainerPrevPath(currentPath) {
  const path = canonicalMoveTrainerPath(currentPath)
  const uq = parseUnassistedQuizPath(path)
  if (uq && uq.hasUnassistedConfig && uq.step > 1) {
    const line = MOVE_TRAINER_LINE_ORDER.find(e => e.name === `move-trainer-${uq.slug}`)
    if (line) {
      if (uq.step === 2) return line.path
      return `${line.path}/${uq.step - 1}`
    }
  }
  const assisted = parseIntroAssistedPath(path)
  if (assisted) {
    if (assisted.introSlug === 'intro-1') {
      const p = intro1AssistedPrevPath(assisted)
      if (p) return p
      return assisted.basePath
    }
    const i = assisted.steps.findIndex(s => s.id === assisted.stepId)
    if (i > 0) return buildIntroAssistedPath(assisted.introSlug, assisted.steps[i - 1].id)
    return assisted.basePath
  }

  const idx = MOVE_TRAINER_LINE_ORDER.findIndex(e => e.path === path)
  if (idx <= 0) return null
  return MOVE_TRAINER_LINE_ORDER[idx - 1].path
}
