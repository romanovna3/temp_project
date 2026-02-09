import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'index', component: () => import('../views/Index.vue') },
    { path: '/learn', name: 'learn', component: () => import('../views/Learn.vue') },
    { path: '/learn/v2', name: 'learn-v2', component: () => import('../views/Learn.vue') },
    { path: '/learn/v2.2', name: 'learn-v2-2', component: () => import('../views/Learn.vue') },
    { path: '/learn/opening-courses-v1', name: 'learn-opening-courses-v1', component: () => import('../views/Learn.vue') },
    { path: '/learn/v2.3', name: 'learn-v2-3', component: () => import('../views/Learn.vue') },
    { path: '/learn/v2.4', name: 'learn-v2-4', component: () => import('../views/Learn.vue') },
    { path: '/learn/v3', name: 'learn-v3', component: () => import('../views/Learn.vue') },
  ],
})

export default router
