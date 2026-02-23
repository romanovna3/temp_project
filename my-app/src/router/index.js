import { createRouter, createWebHistory } from 'vue-router'

// History mode so path-based URLs work on GitHub Pages (404.html serves the app for all paths).
// Locally: base '/'. Production: base '/temp_project/' so URLs are e.g. .../temp_project/courses/v8
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'index', component: () => import('../views/Index.vue') },
    { path: '/courses', name: 'courses', component: () => import('../views/Courses.vue') },
    { path: '/courses/v2', name: 'courses-v2', component: () => import('../views/Courses.vue') },
    { path: '/courses/v2.2', name: 'courses-v2-2', component: () => import('../views/Courses.vue') },
    { path: '/courses/opening-courses-v1', name: 'courses-opening-courses-v1', component: () => import('../views/CoursesWithErrorBoundary.vue') },
    { path: '/learn/opening-courses-v1', name: 'learn-opening-courses-v1', component: () => import('../views/CoursesWithErrorBoundary.vue') },
    { path: '/courses/v2.3', name: 'courses-v2-3', component: () => import('../views/Courses.vue') },
    { path: '/courses/v2.4', name: 'courses-v2-4', component: () => import('../views/CoursesV24.vue') },
    { path: '/courses/v4', name: 'courses-v4', component: () => import('../views/Courses.vue') },
    { path: '/courses/v5', name: 'courses-v5', component: () => import('../views/Courses.vue') },
    { path: '/courses/v6', name: 'courses-v6', component: () => import('../views/Courses.vue') },
    { path: '/courses/v7', name: 'courses-v7', component: () => import('../views/Courses.vue') },
    { path: '/courses/v8', name: 'courses-v8', component: () => import('../views/Courses.vue') },
    { path: '/courses/v3', name: 'courses-v3', component: () => import('../views/Courses.vue') },
  ],
})

// Fix malformed URLs: encoded slashes (#/%2Flearn%2F...) or double slash (#//learn/...) → redirect to correct path
router.beforeEach((to, _from, next) => {
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
