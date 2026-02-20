<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import Courses from './Courses.vue'

const router = useRouter()
const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false // prevent propagation so the tab doesn't crash
})
</script>

<template>
  <Courses v-if="!error" />
  <div
    v-else
    class="courses-error-fallback"
    role="alert"
  >
    <p class="courses-error-fallback__title">Something went wrong</p>
    <p class="courses-error-fallback__text">This page couldn't load. Try going back or refresh.</p>
    <button
      type="button"
      class="courses-error-fallback__btn"
      @click="router.push('/')"
    >
      Go to home
    </button>
  </div>
</template>

<style scoped>
.courses-error-fallback {
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
.courses-error-fallback__title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}
.courses-error-fallback__text {
  margin: 0;
  opacity: 0.9;
}
.courses-error-fallback__btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  background: var(--color-bg-subtle, #4a4845);
  color: inherit;
  border: none;
  border-radius: 6px;
}
.courses-error-fallback__btn:hover {
  background: var(--color-bg-subtlest, #5c5a57);
}
</style>
