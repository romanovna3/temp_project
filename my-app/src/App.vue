<script setup>
import { ref, onErrorCaptured } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const routeError = ref(null)
const router = useRouter()

onErrorCaptured((err) => {
  console.error('[App.vue] Route component error:', err)
  routeError.value = err
  return false
})

function clearRouteError() {
  routeError.value = null
}

router.afterEach(() => {
  clearRouteError()
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component v-if="!routeError" :is="Component" />
    <div
      v-else
      class="route-error-fallback"
      role="alert"
    >
      <p class="route-error-fallback__title">Something went wrong</p>
      <p class="route-error-fallback__text">This page couldn't load. Try going back or refresh.</p>
      <p v-if="routeError?.message" class="route-error-fallback__detail">{{ routeError.message }}</p>
      <p class="route-error-fallback__hint">Check the browser console (F12) for the full error.</p>
      <button type="button" class="route-error-fallback__btn" @click="router.push({ name: 'courses-opening-courses-v1' }); clearRouteError()">
        Back to courses
      </button>
    </div>
  </RouterView>
</template>

<style scoped>
.route-error-fallback {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  background: var(--color-bg-base, #312e2b);
  color: var(--color-text-default, #fff);
  font-family: system-ui, sans-serif;
}
.route-error-fallback__title { font-size: 1.25rem; font-weight: 600; margin: 0; }
.route-error-fallback__text { margin: 0; opacity: 0.9; }
.route-error-fallback__detail { margin: 0; font-size: 0.75rem; opacity: 0.8; max-width: 80ch; word-break: break-word; }
.route-error-fallback__hint { margin: 0; font-size: 0.7rem; opacity: 0.7; }
.route-error-fallback__btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  background: var(--color-bg-subtle, #4a4845);
  color: inherit;
  border: none;
  border-radius: 6px;
}
.route-error-fallback__btn:hover { background: var(--color-bg-subtlest, #5c5a57); }
</style>
