import { Chess } from 'chess.js'

/** Default start; each step can override. */
export const UNASSISTED_DEFAULT_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

function fenAfter1E4() {
  const c = new Chess()
  c.move({ from: 'e2', to: 'e4' })
  return c.fen()
}

/**
 * Unassisted `kind: 'quiz'` lines: step URLs `…/slug` (step 1) and `…/slug/2`…
 */
export const UNASSISTED_QUIZZES = {
  'quiz-1': {
    steps: [
      {
        id: 1,
        fen: UNASSISTED_DEFAULT_START_FEN,
        sideToMove: 'w',
        correct: { from: 'e2', to: 'e4' },
        notation: '1. e4',
      },
      {
        id: 2,
        fen: fenAfter1E4(),
        sideToMove: 'b',
        correct: null,
        notation: null,
        coachMessage: 'Next question placeholder — more moves will be added here.',
      },
    ],
  },
}

/**
 * @param {string} slug e.g. `quiz-1`
 * @param {number} step 1-based
 */
export function getUnassistedQuizStep(slug, step) {
  const cfg = UNASSISTED_QUIZZES[slug]
  if (!cfg) return null
  return cfg.steps[step - 1] ?? null
}

/**
 * @returns {{ slug: string, step: number, hasUnassistedConfig: boolean } | null} step 1-based; `…/quiz-1` → 1, `…/quiz-1/2` → 2
 */
export function parseUnassistedQuizPath(currentPath) {
  const path = String(currentPath).replace(/\/$/, '')
  const re = /^\/move-trainer\/page-\d+\/(quiz-\d+)(?:\/(\d+))?$/
  const m = path.match(re)
  if (!m) return null
  const slug = m[1]
  const step = m[2] ? parseInt(m[2], 10) : 1
  if (Number.isNaN(step) || step < 1) return null
  return {
    slug,
    step,
    hasUnassistedConfig: Object.prototype.hasOwnProperty.call(UNASSISTED_QUIZZES, slug),
  }
}
