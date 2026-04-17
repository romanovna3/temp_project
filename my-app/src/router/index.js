import { createRouter, createWebHistory } from 'vue-router'
import { isUnlocked } from '../lib/protectedProjects.js'

// History mode so path-based URLs work on GitHub Pages (404.html serves the app for all paths).
// Locally: base '/'. Production: base '/temp_project/' so URLs are e.g. .../temp_project/courses/v8
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'index', component: () => import('../views/Index.vue') },
    {
      path: '/move-trainer/game-review',
      name: 'move-trainer-game-review',
      component: () => import('../views/move-trainer/GameReviewLayoutPage.vue'),
    },
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
