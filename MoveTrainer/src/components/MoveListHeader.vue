<script setup>
import { CcIcon } from '@chesscom/design-system'

defineProps({
  title: { type: String, required: true },
  prevDisabled: { type: Boolean, default: false },
  nextDisabled: { type: Boolean, default: false },
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <header class="move-list-header">
    <div class="move-list-header__leading">
      <button
        type="button"
        class="move-list-header__icon-btn"
        aria-label="Previous opening line"
        :disabled="prevDisabled"
        @click="emit('prev')"
      >
        <CcIcon name="arrow-chevron-left" variant="glyph" :size="20" />
      </button>
      <span class="move-list-header__dot" aria-hidden="true" />
    </div>
    <p class="move-list-header__title cc-paragraph-medium-bold">
      {{ title }}
    </p>
    <div class="move-list-header__trailing">
      <button
        type="button"
        class="move-list-header__icon-btn"
        aria-label="Next opening line"
        :disabled="nextDisabled"
        @click="emit('next')"
      >
        <CcIcon name="arrow-chevron-right" variant="glyph" :size="20" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.move-list-header {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding-top: var(--space-8, 8px);
  padding-bottom: var(--space-8, 8px);
  padding-left: 5px;
  padding-right: 5px;
  margin: 0;
  background: rgba(39, 37, 34, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.move-list-header__leading {
  display: flex;
  align-items: center;
  gap: var(--space-8, 8px);
  flex-shrink: 0;
  min-width: 0;
}

.move-list-header__trailing {
  flex-shrink: 0;
}

.move-list-header__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--font-family-system, system-ui, sans-serif);
  color: var(--color-text-default, rgba(255, 255, 255, 0.92));
  text-align: left;
}

.move-list-header__dot {
  display: block;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  border-radius: var(--radius-full, 9999px);
  background: rgba(255, 255, 255, 0.25);
}

.move-list-header__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4, 4px);
  margin: 0;
  border: none;
  border-radius: var(--radius-sm, 4px);
  background: transparent;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
  cursor: pointer;
}

.move-list-header__icon-btn:hover {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.04));
}

.move-list-header__icon-btn:focus-visible {
  outline: 2px solid var(--color-border-active, rgba(255, 255, 255, 0.4));
  outline-offset: 2px;
}

.move-list-header__icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.move-list-header__icon-btn:disabled:hover {
  background: transparent;
}
</style>
