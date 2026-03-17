<!--
  Color Toggle: filter courses by piece color (White / Black).
  Entire control is one <button>; all inner elements have pointer-events: none so only the button receives clicks.
  Native title used for tooltip to avoid CcTooltip overlay blocking clicks on thumb/icon.
-->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedColor: { type: String, default: 'white' },
  baseUrl: { type: String, default: '' },
})

const emit = defineEmits(['update:selectedColor', 'toggle'])

const kingIconSrc = computed(() => `${props.baseUrl || ''}icons/king-outline.svg`)

const tooltipTitle = computed(() =>
  props.selectedColor === 'white' ? 'Courses for White' : 'Courses for Black'
)

function selectWhite() {
  if (props.selectedColor === 'white') return
  emit('update:selectedColor', 'white')
  emit('toggle', 'white')
}

function selectBlack() {
  if (props.selectedColor === 'black') return
  emit('update:selectedColor', 'black')
  emit('toggle', 'black')
}

function onToggleClick(event) {
  const el = event.currentTarget
  if (!el || !(el instanceof HTMLElement)) return
  const rect = el.getBoundingClientRect()
  const x = event.clientX - rect.left
  const mid = rect.width / 2
  if (x < mid) {
    selectWhite()
  } else {
    selectBlack()
  }
}

function onToggleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (props.selectedColor === 'white') {
      selectBlack()
    } else {
      selectWhite()
    }
  }
}
</script>

<template>
  <span class="color-toggle-wrap">
    <button
      type="button"
      class="color-toggle"
      :title="tooltipTitle"
      aria-label="Filter by piece color"
      :aria-pressed="selectedColor === 'white' ? 'true' : 'false'"
      data-name="Color Toggle"
      @click="onToggleClick"
      @keydown="onToggleKeydown"
    >
      <span class="color-toggle__track" aria-hidden="true" />
      <span
        class="color-toggle__thumb"
        :class="{ 'color-toggle__thumb--black': selectedColor === 'black' }"
        aria-hidden="true"
      >
        <img
          :src="kingIconSrc"
          alt=""
          class="color-toggle__king-icon"
          aria-hidden="true"
        />
      </span>
    </button>
  </span>
</template>

<style scoped>
.color-toggle-wrap {
  display: inline-flex;
  flex-shrink: 0;
}

.color-toggle {
  position: relative;
  width: 56px;
  height: 30px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  display: block;
}

/* Critical: every descendant must not capture pointer – only the button receives clicks.
   :deep() ensures the rule applies to all descendants regardless of scoped attribute, so no
   overlay or global CSS can make thumb/icon capture events. */
.color-toggle :deep(*),
.color-toggle :deep(*::before),
.color-toggle :deep(*::after) {
  pointer-events: none !important;
}

.color-toggle:focus-visible {
  outline: 2px solid var(--color-border-focus, rgba(255, 255, 255, 0.6));
  outline-offset: 2px;
}

.color-toggle__track {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 26px;
  border-radius: 14.5px;
  background: rgba(116, 116, 116, 0.4);
  display: block;
}

.color-toggle__thumb {
  position: absolute;
  left: 0;
  top: 0;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: #ffffff;
  border: 1px solid var(--color-transparent-white-10, rgba(255, 255, 255, 0.1));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.28s ease, border-color 0.28s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-toggle__thumb--black {
  transform: translateX(26px);
  background: #2d2d2d;
  border-color: var(--color-transparent-white-10, rgba(255, 255, 255, 0.1));
}

.color-toggle__king-icon {
  width: 20px;
  height: auto;
  max-height: 24px;
  object-fit: contain;
  user-select: none;
}
</style>

<!-- Unscoped fallback so pointer-events rule wins over any global/DS styles -->
<style>
.color-toggle-wrap .color-toggle *,
.color-toggle-wrap .color-toggle *::before,
.color-toggle-wrap .color-toggle *::after {
  pointer-events: none !important;
}
</style>
