<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'PresetBarSelect' })

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: 'Select' },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const triggerRef = ref(null)
const panelRef = ref(null)

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt ? opt.label : props.modelValue
})

const selectedIndex = computed(() => props.options.findIndex((o) => o.value === props.modelValue))

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function select(option) {
  emit('update:modelValue', option.value)
  close()
}

function onTriggerClick() {
  isOpen.value ? close() : open()
}

function onKeydown(e) {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open()
    }
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const next = Math.min(selectedIndex.value + 1, props.options.length - 1)
    emit('update:modelValue', props.options[next].value)
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = Math.max(selectedIndex.value - 1, 0)
    emit('update:modelValue', props.options[prev].value)
    return
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    close()
    triggerRef.value?.focus()
  }
}

function onClickOutside(e) {
  if (!triggerRef.value || !panelRef.value) return
  const el = e.target
  if (triggerRef.value.contains(el) || panelRef.value.contains(el)) return
  close()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div class="preset-bar-select">
    <button
      ref="triggerRef"
      type="button"
      class="preset-bar-select__trigger"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-controls="isOpen ? 'preset-bar-select-panel' : undefined"
      @click="onTriggerClick"
      @keydown="onKeydown"
    >
      <span class="preset-bar-select__label">{{ selectedLabel }}</span>
      <span class="preset-bar-select__chevron" aria-hidden="true" />
    </button>
    <div
      v-show="isOpen"
      ref="panelRef"
      id="preset-bar-select-panel"
      class="preset-bar-select__panel"
      role="listbox"
      :aria-activedescendant="undefined"
      tabindex="-1"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        type="button"
        class="preset-bar-select__option"
        :class="{ 'preset-bar-select__option--selected': option.value === modelValue }"
        role="option"
        :aria-selected="option.value === modelValue"
        @click="select(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.preset-bar-select {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  min-width: 90px;
  height: 32px;
}
.preset-bar-select__trigger {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  min-width: 0;
  padding: 4px 6px 4px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 600;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  outline: none;
  text-align: left;
}
.preset-bar-select__trigger:hover,
.preset-bar-select__trigger:focus-visible {
  background: rgba(0, 0, 0, 0.25);
}
.preset-bar-select__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preset-bar-select__chevron {
  width: 32px;
  flex-shrink: 0;
  height: 100%;
  border-left: 1px solid rgba(38, 36, 34, 0.15);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='rgba(255,255,255,0.7)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}
.preset-bar-select__panel {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 100%;
  padding: 4px 0;
  background: #1f1e1d;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}
.preset-bar-select__option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: left;
  cursor: pointer;
  outline: none;
}
.preset-bar-select__option:hover,
.preset-bar-select__option:focus-visible {
  background: rgba(255, 255, 255, 0.08);
}
.preset-bar-select__option--selected {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 1);
}
</style>
