<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  projectTitle: { type: String, default: '' },
  error: { type: String, default: '' },
})

const emit = defineEmits(['close', 'submit'])

const password = ref('')
const inputRef = ref(null)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      password.value = ''
      await nextTick()
      inputRef.value?.focus?.()
    }
  }
)

function onSubmit() {
  emit('submit', password.value)
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="ppm-backdrop"
      role="presentation"
      aria-hidden="true"
      @click.self="$emit('close')"
    />
    <div
      v-if="open"
      class="ppm-wrap"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ppm-dialog-title"
      @keydown="onKeydown"
    >
      <div class="ppm-dialog">
        <h2 id="ppm-dialog-title" class="ppm-title">
          Enter password
        </h2>
        <p v-if="projectTitle" class="ppm-sub">{{ projectTitle }}</p>
        <form class="ppm-form" @submit.prevent="onSubmit">
          <label class="ppm-label" for="ppm-password">Password</label>
          <p v-if="error" class="ppm-error" role="alert">{{ error }}</p>
          <input
            id="ppm-password"
            ref="inputRef"
            v-model="password"
            class="ppm-input"
            type="password"
            autocomplete="current-password"
            autocapitalize="off"
            spellcheck="false"
          />
          <div class="ppm-actions">
            <button type="button" class="ppm-btn ppm-btn--ghost" @click="$emit('close')">
              Cancel
            </button>
            <button type="submit" class="ppm-btn ppm-btn--primary">Unlock</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ppm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
}
.ppm-wrap {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-24, 24px);
  pointer-events: none;
}
.ppm-dialog {
  pointer-events: auto;
  width: 100%;
  max-width: 400px;
  padding: var(--space-24, 24px);
  border-radius: var(--radius-xl, 12px);
  background: var(--color-bg-primary, #312e2b);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}
.ppm-title {
  margin: 0 0 var(--space-8, 8px);
  font-size: 18px;
  font-weight: 600;
  font-family: "SF Compact Display", sans-serif;
  color: rgba(255, 255, 255, 0.95);
}
.ppm-sub {
  margin: 0 0 var(--space-16, 16px);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
}
.ppm-error {
  margin: 0 0 var(--space-4, 4px);
  font-size: 13px;
  color: #f87171;
}
.ppm-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
}
.ppm-label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}
.ppm-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  font-size: 16px;
  border-radius: var(--radius-md, 6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
}
.ppm-input:focus {
  outline: 2px solid var(--color-aqua-300, #26c2a3);
  outline-offset: 1px;
}
.ppm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-8, 8px);
  margin-top: var(--space-16, 16px);
}
.ppm-btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: var(--radius-md, 6px);
  cursor: pointer;
  border: none;
  font-family: inherit;
}
.ppm-btn--ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
}
.ppm-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
}
.ppm-btn--primary {
  background: var(--color-aqua-300, #26c2a3);
  color: #1a1a1a;
}
.ppm-btn--primary:hover {
  filter: brightness(1.05);
}
</style>
