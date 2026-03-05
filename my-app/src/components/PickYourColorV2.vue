<!-- Pick Your Color V2 – frozen snapshot. To use in app: have PickYourColor.vue import this instead of V3. -->
<template>
  <div class="pick-your-color" :class="{ 'pick-your-color--single': isSingleColor }">
    <!-- Single color: label + icon only, no chevron, no dropdown -->
    <div v-if="isSingleColor" class="pick-your-color__static" data-name="Pick your color">
      <div class="pick-your-color__icon" data-name="Icon" aria-hidden="true">
        <template v-if="singleColorValue === 'white'">
          <div class="pick-your-color__icon-bg pick-your-color__icon-bg--white" data-name=".colorpicker-white-sm" />
          <svg
            class="pick-your-color__king-svg pick-your-color__king-svg--white"
            viewBox="0 0 19 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-name="piece-hollow-king-1"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
          </svg>
        </template>
        <template v-else>
          <div class="pick-your-color__icon-bg pick-your-color__icon-bg--black" data-name=".colorpicker-black-sm" />
          <svg
            class="pick-your-color__king-svg pick-your-color__king-svg--black"
            viewBox="0 0 19 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-name="piece-hollow-king-1"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
          </svg>
        </template>
      </div>
      <p class="pick-your-color__label">{{ singleColorLabel }}</p>
    </div>
    <button
      v-else
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
        <!-- White king V2: Colorpicker White Small – light gray bg + hollow king #8B8987 -->
        <template v-if="normalizedValue === 'white'">
          <div class="pick-your-color__icon-bg pick-your-color__icon-bg--white" data-name=".colorpicker-white-sm" />
          <svg
            class="pick-your-color__king-svg pick-your-color__king-svg--white"
            viewBox="0 0 19 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-name="piece-hollow-king-1"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
          </svg>
        </template>
        <!-- Black king V2: Colorpicker Black Small – dark bg #312E2B + hollow king #8B8987 -->
        <template v-else>
          <div class="pick-your-color__icon-bg pick-your-color__icon-bg--black" data-name=".colorpicker-black-sm" />
          <svg
            class="pick-your-color__king-svg pick-your-color__king-svg--black"
            viewBox="0 0 19 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            data-name="piece-hollow-king-1"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
          </svg>
        </template>
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
      v-show="!isSingleColor && isOpen"
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
          <!-- Same icon as trigger: pick-your-color__icon -->
          <div class="pick-your-color__icon" data-name="Icon">
            <template v-if="opt.value === 'white'">
              <div class="pick-your-color__icon-bg pick-your-color__icon-bg--white" data-name=".colorpicker-white-sm" />
              <svg class="pick-your-color__king-svg pick-your-color__king-svg--white" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg" data-name="piece-hollow-king-1" preserveAspectRatio="xMidYMid meet">
                <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
              </svg>
            </template>
            <template v-else>
              <div class="pick-your-color__icon-bg pick-your-color__icon-bg--black" data-name=".colorpicker-black-sm" />
              <svg class="pick-your-color__king-svg pick-your-color__king-svg--black" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg" data-name="piece-hollow-king-1" preserveAspectRatio="xMidYMid meet">
                <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
              </svg>
            </template>
          </div>
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

defineOptions({ name: 'PickYourColorV2' })

const props = defineProps({
  modelValue: {
    type: String,
    default: 'white',
    validator: () => true,
  },
  disabled: { type: Boolean, default: false },
  /** When set to 'white' or 'black', show only that color: label + icon, no chevron, no dropdown. */
  playSideOnly: {
    type: String,
    default: null,
    validator: (v) => v == null || v === 'white' || v === 'black',
  },
})

const emit = defineEmits(['update:modelValue'])

// Figma MCP asset URL – chevron only. White & black = V2 Colorpicker (bg + same king SVG).
const imgChevronUrl = 'https://www.figma.com/api/mcp/asset/89a655e1-387b-4a48-a21b-e4651d5aeb4c'

const imgChevronError = ref(false)

const options = [
  { value: 'white', label: 'Play for white' },
  { value: 'black', label: 'Play for black' },
]

const normalizedValue = computed(() =>
  options.some((o) => o.value === props.modelValue) ? props.modelValue : 'white'
)

const isSingleColor = computed(() =>
  props.playSideOnly === 'white' || props.playSideOnly === 'black'
)
const singleColorValue = computed(() => (props.playSideOnly === 'black' ? 'black' : 'white'))
const singleColorLabel = computed(() =>
  singleColorValue.value === 'white' ? 'Play for white' : 'Play for black'
)

const labelText = computed(() => {
  const opt = options.find((o) => o.value === normalizedValue.value)
  return opt ? opt.label : 'Play for white'
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

/* Single-color: same layout and font as dropdown trigger, no chevron, no interaction */
.pick-your-color__static {
  display: flex;
  align-items: center;
  gap: 8px;
  height: fit-content;
  padding: 0 2px;
  min-height: 40px;
  box-sizing: border-box;
  font-family: var(--font-family-system, 'Inter', system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
}
.pick-your-color__static .pick-your-color__label {
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  opacity: 0.85;
}

/* Trigger: flex, gap 8px, no padding, rounded 3px – per Figma */
.pick-your-color__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: fit-content;
  padding: 0 2px;
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

/* Icon 24×24 */
.pick-your-color__icon {
  position: relative;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

/* V2 White: Colorpicker White Small – light gray bg + hollow king */
.pick-your-color__icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  border-style: solid;
}

.pick-your-color__icon-bg--white {
  background-color: #e7e6e5;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
}

.pick-your-color__icon-bg--black {
  background-color: #312e2b;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
}

/* White king SVG: fill 24×24, viewBox scales path and centers (xMidYMid meet) */
.pick-your-color__king-svg {
  position: absolute;
  inset: 0;
  width: 24px;
  height: 24px;
  display: block;
  pointer-events: none;
}

/* Random: half light / half dark circle (unused in V2) */
.pick-your-color__random-icon {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
}

.pick-your-color__random-half {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
}

.pick-your-color__random-half--light {
  left: 0;
  background: #e7e6e5;
}

.pick-your-color__random-half--dark {
  right: 0;
  background: #312e2b;
}

/* Label: 14px, 72% default → 85% on hover */
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

/* Chevron 12×12 */
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

/* Panel – opens above the trigger */
.pick-your-color__panel {
  position: absolute;
  bottom: 100%;
  left: -14px;
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

/* Option: same style as trigger (font, color, icon) */
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

.pick-your-color__option-icon .pick-your-color__icon {
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
