import { createRouter, createWebHistory } from 'vue-router'
import { isUnlocked } from '../lib/protectedProjects.js'
import { MOVE_TRAINER_LINE_ORDER } from '@move-trainer/data/moveTrainerLineOrder.js'

// History mode so path-based URLs work on GitHub Pages (404.html serves the app for all paths).
// Locally: base '/'. Production: base '/temp_project/' so URLs are e.g. .../temp_project/courses/v8
/** Same MoveTrainer assisted URLs (`…/intro-1/aq-1`, `…/intro-2/aq-1`). */
const introAssistedRoutes = [
  {
    path: '/move-trainer/page-:pageNum/intro-1/:assistedStep',
    name: 'move-trainer-intro-1-assisted',
    component: () => import('../views/move-trainer/GameReviewLayoutPage.vue'),
  },
  {
    path: '/move-trainer/page-:pageNum/intro-2/:assistedStep',
    name: 'move-trainer-intro-2-assisted',
    component: () => import('../views/move-trainer/GameReviewLayoutPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'index', component: () => import('../views/Index.vue') },
    {
      path: '/move-trainer/move-trainer-2',
      name: 'move-trainer-2-landing',
      component: () => import('../views/move-trainer/move-trainer-2/MoveTrainer2Landing.vue'),
    },
    {
      path: '/move-trainer/move-trainer-3',
      component: () => import('../views/move-trainer/move-trainer-3/MoveTrainer3Shell.vue'),
      children: [
        {
          path: '',
          name: 'move-trainer-3-landing',
          component: () => import('../views/move-trainer/move-trainer-3/MoveTrainer3RouteStub.vue'),
        },
        {
          path: 'play-move',
          name: 'move-trainer-3-play-move',
          component: () => import('../views/move-trainer/move-trainer-3/MoveTrainer3RouteStub.vue'),
        },
        ...['opponents-move-1', 'opponents-move-2', 'opponents-move-3', 'opponents-move-4', 'opponents-move-5', 'opponents-move-6'].map(
          (seg) => ({
            path: seg,
            name: `move-trainer-3-${seg}`,
            component: () => import('../views/move-trainer/move-trainer-3/MoveTrainer3RouteStub.vue'),
          }),
        ),
      ],
    },
    ...introAssistedRoutes,
    ...MOVE_TRAINER_LINE_ORDER.map((e) => ({
      path: e.path,
      name: e.name,
      component: () => import('../views/move-trainer/GameReviewLayoutPage.vue'),
    })),
    ...MOVE_TRAINER_LINE_ORDER.map((e) => ({
      path: `/move-trainer/${e.path.split('/').pop()}`,
      redirect: e.path,
    })),
    {
      path: '/move-trainer/introduction-1',
      redirect: MOVE_TRAINER_LINE_ORDER[0].path,
    },
    {
      path: '/move-trainer/info-1',
      redirect: MOVE_TRAINER_LINE_ORDER.find((en) => en.name === 'move-trainer-intro-1').path,
    },
    { path: '/move-trainer/intro', redirect: MOVE_TRAINER_LINE_ORDER[0].path },
    { path: '/move-trainer/game-review', redirect: MOVE_TRAINER_LINE_ORDER[0].path },
    {
      path: '/empty',
      name: 'empty',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/EmptyPage.vue'),
    },
    {
      path: '/courses',
      name: 'courses',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/Courses.vue'),
    },
    {
      path: '/courses/v2',
      name: 'courses-v2',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/CoursesV2.vue'),
    },
    {
      path: '/courses/v2.2',
      name: 'courses-v2-2',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/CoursesV22.vue'),
    },
    { path: '/courses/opening-courses-v1', name: 'courses-opening-courses-v1', component: () => import('../views/CoursesWithErrorBoundary.vue') },
    { path: '/learn/opening-courses-v1', name: 'learn-opening-courses-v1', component: () => import('../views/CoursesWithErrorBoundary.vue') },
    // Singular "course" → redirect so /#/course/opening-courses-v1 works
    { path: '/course/opening-courses-v1', redirect: '/courses/opening-courses-v1' },
    { path: '/courses/opening-courses-v2', name: 'courses-opening-courses-v2', component: () => import('../views/OpeningCoursesV2WithErrorBoundary.vue') },
    { path: '/learn/opening-courses-v2', name: 'learn-opening-courses-v2', component: () => import('../views/OpeningCoursesV2WithErrorBoundary.vue') },
    { path: '/course/opening-courses-v2', redirect: '/courses/opening-courses-v2' },
    { path: '/courses/opening-courses-v3', name: 'courses-opening-courses-v3', component: () => import('../views/OpeningCoursesV3WithErrorBoundary.vue') },
    { path: '/learn/opening-courses-v3', name: 'learn-opening-courses-v3', component: () => import('../views/OpeningCoursesV3WithErrorBoundary.vue') },
    { path: '/course/opening-courses-v3', redirect: '/courses/opening-courses-v3' },
    {
      path: '/courses/v2.3',
      name: 'courses-v2-3',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/CoursesV23.vue'),
    },
    { path: '/courses/v2.4', name: 'courses-v2-4', component: () => import('../views/CoursesV24.vue') },
    { path: '/courses/v4', name: 'courses-v4', component: () => import('../views/CoursesV4.vue') },
    { path: '/courses/v5', name: 'courses-v5', component: () => import('../views/CoursesV5.vue') },
    { path: '/courses/v6', name: 'courses-v6', component: () => import('../views/CoursesV6.vue') },
    {
      path: '/courses/v7',
      name: 'courses-v7',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/CoursesV7.vue'),
    },
    { path: '/courses/v8', name: 'courses-v8', component: () => import('../views/CoursesV8.vue') },
    { path: '/courses/v9', name: 'courses-v9', component: () => import('../views/CoursesV9.vue') },
    { path: '/courses/opening-courses-oc', name: 'courses-opening-courses-oc', component: () => import('../views/CoursesV9OC.vue') },
    { path: '/courses/opening-courses-oc/:courseId', name: 'courses-opening-courses-oc-course', component: () => import('../views/CoursesV9OC.vue') },
    { path: '/courses/sicilian-defense', name: 'courses-sicilian-defense', component: () => import('../views/CoursesV9OC.vue') },
    { path: '/learn/opening-courses-oc', name: 'learn-opening-courses-oc', component: () => import('../views/CoursesV9OC.vue') },
    { path: '/learn/opening-courses-oc/:courseId', name: 'learn-opening-courses-oc-course', component: () => import('../views/CoursesV9OC.vue') },
    { path: '/learn/sicilian-defense', name: 'learn-sicilian-defense', component: () => import('../views/CoursesV9OC.vue') },
    {
      path: '/courses/v3',
      name: 'courses-v3',
      meta: { protectedProjectId: 'folder-previous-versions' },
      component: () => import('../views/CoursesV3.vue'),
    },
    { path: '/courses/v10', name: 'courses-v10', component: () => import('../views/CoursesV10.vue') },
  ],
})

// Password-gated routes: redirect to home with ?unlock= so Index can show the modal
router.beforeEach((to, from, next) => {
  const pid = to.meta?.protectedProjectId
  if (pid && !isUnlocked(pid)) {
    next({ path: '/', query: { ...to.query, unlock: pid } })
    return
  }
  // Fix malformed URLs: encoded slashes (#/%2Flearn%2F...) or double slash (#//learn/...) → redirect to correct path
  let path = to.fullPath
  // Decode encoded slashes
  if (path.includes('%2F') || path.includes('%2f')) {
    path = path.replace(/%2[fF]/g, '/')
  }
  // Normalize leading double (or multiple) slashes to single slash
  if (path.startsWith('//')) {
    path = '/' + path.replace(/^\/+/, '')
  }
  if (path !== to.fullPath) {
    next(path)
    return
  }
  next()
})

export default router
