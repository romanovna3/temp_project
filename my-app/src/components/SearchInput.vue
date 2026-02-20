<template>
  <div class="search-input" data-name="Input Field - Search">
    <div class="search-input__field" :class="{ 'is-active': isFocused || hasContent }">
      <div class="search-input__inner">
        <div class="search-input__content">
          <div class="search-input__icon" aria-hidden="true">
            <CcIcon name="tool-magnifier-blank" variant="glyph" :size="20" class="search-input__icon-svg" />
          </div>
          <input
            ref="inputRef"
            v-model="model"
            type="search"
            class="search-input__input"
            :placeholder="placeholder"
            :aria-label="ariaLabel"
            autocomplete="off"
            @focus="onFocus"
            @blur="onBlur"
            @keydown.enter.prevent="emit('enter')"
          />
        </div>
      </div>
      <div class="search-input__border" aria-hidden="true" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search' },
  ariaLabel: { type: String, default: 'Search' },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'enter'])

const inputRef = ref(null)
const isFocused = ref(false)
const model = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const hasContent = computed(() => (props.modelValue || '').length > 0)

function onFocus(e) {
  isFocused.value = true
  emit('focus', e)
}
function onBlur(e) {
  isFocused.value = false
  emit('blur', e)
}

defineExpose({ focus: () => inputRef.value?.focus(), blur: () => inputRef.value?.blur() })
</script>

<style scoped>
.search-input {
  width: 100%;
}

.search-input__field {
  position: relative;
  height: 40px;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.08);
  width: 100%;
  box-shadow: none;
}

.search-input__inner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: clip;
  border-radius: inherit;
  height: 100%;
  width: 100%;
}

.search-input__content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
  height: 100%;
  width: 100%;
}

.search-input__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-input__icon-svg {
  color: rgba(255, 255, 255, 0.5);
}

.search-input__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: none;
  background: none;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 14px;
  line-height: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.72);
  outline: none;
}

.search-input__input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Remove search input browser chrome */
.search-input__input[type="search"]::-webkit-search-decoration,
.search-input__input[type="search"]::-webkit-search-cancel-button,
.search-input__input[type="search"]::-webkit-search-results-button,
.search-input__input[type="search"]::-webkit-search-results-decoration {
  display: none;
}

/* Border overlay */
.search-input__border {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  pointer-events: none;
}

/* Hover: only when not active */
.search-input__field:hover:not(.is-active) .search-input__border {
  border-color: rgba(255, 255, 255, 0.2);
}

/* Active: focused + has text (overrides hover) */
.search-input__field.is-active .search-input__border {
  border-color: rgba(255, 255, 255, 0.4);
}

.search-input__field.is-active {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.search-input__field.is-active .search-input__input,
.search-input__field.is-active .search-input__input::placeholder {
  color: rgba(255, 255, 255, 0.72);
}

.search-input__field.is-active .search-input__icon-svg {
  color: rgba(255, 255, 255, 0.5);
}
</style>
