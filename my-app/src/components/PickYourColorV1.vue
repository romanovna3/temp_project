<!-- Pick Your Color V1 – frozen. Same as V2 (dropdown) but icons from GNS color library: piece-white-king, piece-black-king. -->
<template>
  <div class="pick-your-color pick-your-color--v1">
    <button
      ref="triggerRef"
      type="button"
      class="pick-your-color__trigger"
      aria-label="Select piece color"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      :aria-controls="isOpen ? 'pick-your-color-panel' : undefined"
      data-name="Pick your color"
      @click="onTriggerClick"
      @keydown="onKeydown"
    >
      <div class="pick-your-color__icon" data-name="Icon" aria-hidden="true">
        <CcIcon
          :name="normalizedValue === 'white' ? 'piece-white-king' : 'piece-black-king'"
          variant="color"
          :size="24"
          class="pick-your-color__icon-ds"
        />
      </div>
      <p class="pick-your-color__label">
        {{ labelText }}
      </p>
      <div class="pick-your-color__chevron" data-name="chevron" :class="{ 'pick-your-color__chevron--open': isOpen }" aria-hidden="true">
        <div class="pick-your-color__chevron-inner" data-name="Vector">
          <img
            v-if="!imgChevronError"
            alt=""
            class="pick-your-color__chevron-img"
            :src="imgChevronUrl"
            @error="imgChevronError = true"
          >
          <svg v-else class="pick-your-color__chevron-svg" viewBox="0 0 9 5.66" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l3.5 3.5L8 1" stroke="rgba(255,255,255,0.72)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>
        </div>
      </div>
    </button>
    <div
      v-show="isOpen"
      ref="panelRef"
      id="pick-your-color-panel"
      class="pick-your-color__panel"
      role="listbox"
      aria-label="Piece color options"
      tabindex="-1"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="pick-your-color__option"
        :class="{ 'pick-your-color__option--selected': opt.value === normalizedValue }"
        role="option"
        :aria-selected="opt.value === normalizedValue"
        @click="select(opt.value)"
      >
        <span class="pick-your-color__option-icon" aria-hidden="true">
          <CcIcon
            :name="opt.value === 'white' ? 'piece-white-king' : 'piece-black-king'"
            variant="color"
            :size="24"
            class="pick-your-color__option-icon-ds"
          />
        </span>
        <span class="pick-your-color__option-label">{{ opt.label }}</span>
        <span v-if="opt.value === normalizedValue" class="pick-your-color__option-check" aria-hidden="true">
          <CcIcon name="mark-check" variant="glyph" :size="16" class="pick-your-color__option-check-icon" />
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CcIcon } from '@chesscom/design-system'

defineOptions({ name: 'PickYourColorV1' })

const props = defineProps({
  modelValue: {
    type: String,
    default: 'white',
    validator: () => true,
  },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const imgChevronUrl = 'https://www.figma.com/api/mcp/asset/89a655e1-387b-4a48-a21b-e4651d5aeb4c'

const imgChevronError = ref(false)

const options = [
  { value: 'white', label: 'play for white' },
  { value: 'black', label: 'play for black' },
]

const normalizedValue = computed(() =>
  options.some((o) => o.value === props.modelValue) ? props.modelValue : 'white'
)

const labelText = computed(() => {
  const opt = options.find((o) => o.value === normalizedValue.value)
  return opt ? opt.label : 'play for white'
})

const isOpen = ref(false)
const triggerRef = ref(null)
const panelRef = ref(null)

const selectedIndex = computed(() => options.findIndex((o) => o.value === normalizedValue.value))

function open() {
  if (props.disabled) return
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function select(value) {
  emit('update:modelValue', value)
  close()
}

function onTriggerClick() {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

function onKeydown(e) {
  if (props.disabled) return
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
    const next = Math.min(selectedIndex.value + 1, options.length - 1)
    emit('update:modelValue', options[next].value)
    return
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prev = Math.max(selectedIndex.value - 1, 0)
    emit('update:modelValue', options[prev].value)
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

<style scoped>
.pick-your-color {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
}

.pick-your-color__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border-radius: 3px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-family: var(--font-family-system, 'Inter', system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  cursor: pointer;
  outline: none;
  text-align: left;
  min-height: 40px;
  box-sizing: border-box;
}

.pick-your-color__trigger:hover:not(:disabled) .pick-your-color__label,
.pick-your-color__trigger:hover:not(:disabled) .pick-your-color__chevron,
.pick-your-color__trigger:focus-visible .pick-your-color__label,
.pick-your-color__trigger:focus-visible .pick-your-color__chevron {
  opacity: 0.85;
}

.pick-your-color__trigger:disabled {
  cursor: default;
  opacity: 0.6;
}

.pick-your-color__icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pick-your-color__icon-ds {
  flex-shrink: 0;
}

.pick-your-color__label {
  flex-shrink: 0;
  margin: 0;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
  opacity: 0.72;
}

.pick-your-color__chevron {
  position: relative;
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  opacity: 0.72;
  transition: transform 0.2s ease;
}

.pick-your-color__chevron--open {
  transform: rotate(180deg);
}

.pick-your-color__chevron-inner {
  position: absolute;
  inset: 26.41% 12.5% 26.42% 12.49%;
}

.pick-your-color__chevron-img {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pick-your-color__chevron-svg {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pick-your-color__panel {
  position: absolute;
  bottom: 100%;
  left: -10px;
  margin-bottom: 4px;
  width: 240px;
  padding: 8px 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #1a1816;
  border: none;
  border-radius: 5px;
  box-shadow: none;
  z-index: 100;
}

.pick-your-color__option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 5px 12px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 1);
  font-size: 14px;
  font-weight: 600;
  font-family: var(--font-family-system, 'Inter', system-ui, sans-serif);
  line-height: 16px;
  text-align: left;
  cursor: pointer;
  outline: none;
}

.pick-your-color__option:hover .pick-your-color__option-label,
.pick-your-color__option:focus-visible .pick-your-color__option-label {
  opacity: 0.85;
}

.pick-your-color__option-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pick-your-color__option-icon-ds {
  flex-shrink: 0;
}

.pick-your-color__option-label {
  white-space: nowrap;
  opacity: 0.72;
}

.pick-your-color__option-check {
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.pick-your-color__option-check-icon {
  color: var(--color-border-focus, #81b64c);
  fill: var(--color-border-focus, #81b64c);
}
</style>
