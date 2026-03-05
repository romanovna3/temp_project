<template>
  <div class="pick-your-color-v3" data-name="Pick your color V3">
    <span class="pick-your-color-v3__label">Play As:</span>
    <div class="pick-your-color-v3__icons">
      <button
        type="button"
        class="pick-your-color-v3__icon-wrap"
        :class="{ 'pick-your-color-v3__icon-wrap--selected': normalizedValue === 'white' }"
        aria-label="Play as white"
        :aria-pressed="normalizedValue === 'white'"
        :disabled="disabled"
        @click="select('white')"
      >
        <div class="pick-your-color-v3__icon" aria-hidden="true">
          <div class="pick-your-color-v3__icon-bg pick-your-color-v3__icon-bg--white" />
          <svg class="pick-your-color-v3__king-svg" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
          </svg>
        </div>
      </button>
      <button
        type="button"
        class="pick-your-color-v3__icon-wrap"
        :class="{ 'pick-your-color-v3__icon-wrap--selected': normalizedValue === 'black' }"
        aria-label="Play as black"
        :aria-pressed="normalizedValue === 'black'"
        :disabled="disabled"
        @click="select('black')"
      >
        <div class="pick-your-color-v3__icon" aria-hidden="true">
          <div class="pick-your-color-v3__icon-bg pick-your-color-v3__icon-bg--black" />
          <svg class="pick-your-color-v3__king-svg" viewBox="0 0 19 22" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <path d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z" fill="var(--fill-0, #8B8987)" />
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'PickYourColorV3' })

const props = defineProps({
  modelValue: {
    type: String,
    default: 'white',
    validator: (v) => v === 'white' || v === 'black',
  },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const normalizedValue = computed(() =>
  (props.modelValue === 'white' || props.modelValue === 'black') ? props.modelValue : 'white'
)

function select(value) {
  if (props.disabled) return
  emit('update:modelValue', value)
}
</script>

<style scoped>
.pick-your-color-v3 {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  min-height: 40px;
}

.pick-your-color-v3__label {
  flex-shrink: 0;
  font-family: var(--font-family-system, 'Inter', system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
}

.pick-your-color-v3__icons {
  display: flex;
  align-items: center;
  gap: 1px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Outer frame: 3px larger than icon → 24 + 6 = 30px. Padding 3px so icon (24px) sits inside with 3px space; outline goes on this wrap. */
.pick-your-color-v3__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 32px;
  width: 32px;
  min-width: 32px;
  height: 32px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
}

.pick-your-color-v3__icon-wrap:hover:not(:disabled) {
  opacity: 0.9;
}

.pick-your-color-v3__icon-wrap--selected {
  border-color: var(--color-border-focus, #81b64c);
}

.pick-your-color-v3__icon-wrap:disabled {
  cursor: default;
  opacity: 0.6;
}

/* Icon 24×24 centered inside the 30×30 wrap (3px space from outline) */
.pick-your-color-v3__icon {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.pick-your-color-v3__icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  border-style: solid;
}

.pick-your-color-v3__icon-bg--white {
  background-color: #e7e6e5;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.1);
}

.pick-your-color-v3__icon-bg--black {
  background-color: #312e2b;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.1);
}

.pick-your-color-v3__king-svg {
  position: absolute;
  inset: 0;
  width: 24px;
  height: 24px;
  display: block;
  pointer-events: none;
}
</style>
