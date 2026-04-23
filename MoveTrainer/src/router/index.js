import { createRouter, createWebHistory } from 'vue-router'
import MoveTrainerView from '../views/MoveTrainerView.vue'
import { MOVE_TRAINER_LINE_ORDER } from '../data/moveTrainerLineOrder.js'

/** Assisted-learning steps (`…/intro-1/aq-1`, `…/intro-2/aq-1`, …) — same view, quiz-like layout. */
const introAssistedRoutes = [
  {
    path: '/move-trainer/page-:pageNum/intro-1/:assistedStep',
    name: 'move-trainer-intro-1-assisted',
    component: MoveTrainerView,
  },
  {
    path: '/move-trainer/page-:pageNum/intro-2/:assistedStep',
    name: 'move-trainer-intro-2-assisted',
    component: MoveTrainerView,
  },
]

/** Unassisted quiz: `/page-3/quiz-1/2` (numeric `step` only; intro assisted uses `aq-1` etc. and does not match). */
const unassistedQuizStepRoute = {
  path: '/move-trainer/page-:pageNum/:slug(quiz-1|quiz-2|quiz-3|quiz-4)/:step(\\d+)',
  name: 'move-trainer-line-quiz-step',
  component: MoveTrainerView,
}

const moveTrainerRoutes = MOVE_TRAINER_LINE_ORDER.map(({ path, name }) => ({
  path,
  name,
  component: MoveTrainerView,
}))

const firstPath = MOVE_TRAINER_LINE_ORDER[0].path
const intro1Path = MOVE_TRAINER_LINE_ORDER.find(e => e.name === 'move-trainer-intro-1')?.path ?? firstPath

/** Old flat URLs → new `/move-trainer/page-#/{slug}` */
const legacyFlatRedirects = MOVE_TRAINER_LINE_ORDER.map((e) => {
  const slug = e.path.split('/').pop()
  return { path: `/move-trainer/${slug}`, redirect: e.path }
})

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: firstPath },
    { path: '/move-trainer', redirect: firstPath },
    unassistedQuizStepRoute,
    ...introAssistedRoutes,
    ...moveTrainerRoutes,
    ...legacyFlatRedirects,
    { path: '/move-trainer/introduction-1', redirect: firstPath },
    { path: '/move-trainer/info-1', redirect: intro1Path },
    { path: '/move-trainer/intro', redirect: firstPath },
    { path: '/move-trainer/game-review', redirect: firstPath },
  ],
})
