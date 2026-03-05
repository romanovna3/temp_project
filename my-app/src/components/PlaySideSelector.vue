<template>
  <div
    class="play-side-selector"
    data-name="Play Side Selector"
    role="radiogroup"
    aria-label="Play as"
  >
    <div class="play-side-selector__label">
      <p class="play-side-selector__label-text">Play As:</p>
    </div>
    <div class="play-side-selector__icons" data-name="Icons">
      <!-- White (Figma ColorpickerWhiteSm: 208-19855) -->
      <button
        type="button"
        class="play-side-selector__option"
        role="radio"
        :aria-checked="normalizedValue === 'white'"
        aria-label="Play as white"
        data-name=".colorpicker-white-sm"
        data-node-id="205:27360"
        @click="select('white')"
      >
        <div class="play-side-selector__option-bg play-side-selector__option-bg--light" data-node-id="205:27361" />
        <div class="play-side-selector__king play-side-selector__king--white" data-name="piece-hollow-king-1" data-node-id="205:27362" aria-hidden="true">
          <div class="play-side-selector__king-vector" data-name="Vector" data-node-id="I205:27362;286:212">
            <img
              v-if="!kingWhiteImgError"
              alt=""
              class="play-side-selector__king-img"
              :src="kingWhiteAssetUrl"
              @error="kingWhiteImgError = true"
            >
            <svg v-else viewBox="0 0 18.55 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="play-side-selector__king-svg">
              <path d="M9.27 2v3.5h2.5L9.27 11l2.5 2.5H9.27V22H7.28v-8.5H4.78L7.28 11 4.78 8.5h2.5V2h2.49z" fill="#8B8987" />
            </svg>
          </div>
        </div>
      </button>
      <!-- Black (Figma ColorpickerBlackSm: 208-19857) -->
      <button
        type="button"
        class="play-side-selector__option"
        role="radio"
        :aria-checked="normalizedValue === 'black'"
        aria-label="Play as black"
        data-name=".colorpicker-black-sm"
        data-node-id="205:27390"
        @click="select('black')"
      >
        <div class="play-side-selector__option-bg play-side-selector__option-bg--dark" data-node-id="205:27391" />
        <div class="play-side-selector__king play-side-selector__king--black" data-name="piece-hollow-king-1" data-node-id="205:27392" aria-hidden="true">
          <div class="play-side-selector__king-vector" data-name="Vector" data-node-id="I205:27392;286:212">
            <img
              v-if="!kingBlackImgError"
              alt=""
              class="play-side-selector__king-img"
              :src="kingBlackAssetUrl"
              @error="kingBlackImgError = true"
            >
            <svg v-else viewBox="0 0 18.55 22" fill="none" xmlns="http://www.w3.org/2000/svg" class="play-side-selector__king-svg">
              <path d="M9.27 2v3.5h2.5L9.27 11l2.5 2.5H9.27V22H7.28v-8.5H4.78L7.28 11 4.78 8.5h2.5V2h2.49z" fill="#8B8987" />
            </svg>
          </div>
        </div>
      </button>
      <!-- Selection indicator (decorative, positioned relative to icons) -->
      <div
        class="play-side-selector__selected"
        data-name="selected"
        :style="selectedStyle"
        aria-hidden="true"
      >
        <div class="play-side-selector__selected-border" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Figma MCP asset URLs for piece-hollow-king-1 (ColorpickerWhiteSm / ColorpickerBlackSm)
const kingWhiteAssetUrl = 'https://www.figma.com/api/mcp/asset/4722a859-a3e0-47da-acec-1bd7b3a40cc2'
const kingBlackAssetUrl = 'https://www.figma.com/api/mcp/asset/f62eefcb-1c84-4269-8544-3867bfcd78ea'
const kingWhiteImgError = ref(false)
const kingBlackImgError = ref(false)

const props = defineProps({
  modelValue: {
    type: String,
    default: 'white',
    validator: () => true,
  },
})

const emit = defineEmits(['update:modelValue'])

const options = ['white', 'black']
/** Normalize to valid value so stale 'random' or invalid state doesn't break selection indicator */
const normalizedValue = computed(() =>
  options.includes(props.modelValue) ? props.modelValue : 'white'
)
const selectedIndex = computed(() => options.indexOf(normalizedValue.value))

// Selection indicator left: -2px (white), 30px (black)
const selectedLeftPx = computed(() => (selectedIndex.value === 0 ? -2 : 30))

const selectedStyle = computed(() => ({
  left: `${selectedLeftPx.value}px`,
}))

function select(value) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.play-side-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  width: auto;
}

.play-side-selector__label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-weight: 600;
  font-size: 14px;
  line-height: 0;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  white-space: nowrap;
}

.play-side-selector__label-text {
  line-height: 16px;
}

.play-side-selector__icons {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  flex-shrink: 0;
}

/* 44px touch target; visual content stays 24x24 (content box) */
.play-side-selector__option {
  position: relative;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 3px;
  box-sizing: content-box;
}

.play-side-selector__option:focus-visible {
  outline: 2px solid var(--color-border-focus, #81b64c);
  outline-offset: 2px;
}

.play-side-selector__option-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  border-radius: 3px;
  border: 1px solid transparent;
}

.play-side-selector__option-bg--light {
  background: var(--color-gray-200, #e7e6e5);
  border-color: var(--color-transparent-black-10, rgba(0, 0, 0, 0.1));
}

.play-side-selector__option-bg--dark {
  background: var(--color-gray-800, #312e2b);
  border-color: var(--color-transparent-white-10, rgba(255, 255, 255, 0.1));
}

/* White king: absolute left-0 top-0 (Figma ColorpickerWhiteSm) */
.play-side-selector__king--white {
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
}

/* Black king: centered with translate (Figma ColorpickerBlackSm) */
.play-side-selector__king--black {
  position: absolute;
  bottom: 0;
  left: 50%;
  top: 0;
  width: 24px;
  transform: translateX(-50%);
}

/* Vector container: inset 0 11.33% 8.33% 11.38% per Figma */
.play-side-selector__king-vector {
  position: absolute;
  inset: 0 11.33% 8.33% 11.38%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-side-selector__king-img {
  position: absolute;
  display: block;
  max-width: none;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.play-side-selector__king-svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Selection indicator */
.play-side-selector__selected {
  position: absolute;
  top: -2px;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  pointer-events: none;
}

.play-side-selector__selected-border {
  position: absolute;
  inset: -2px;
  border: 2px solid #81b64c;
  border-radius: 6px;
  pointer-events: none;
}
</style>
