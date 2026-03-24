<!--
  Color Toggle / Switch: filter courses by piece color (White / Black).
  variant="toggle" (V3/V4): single track + sliding thumb.
  variant="switch" (V5): two thumb squares side by side; selected has outline (like course card).
  Tooltip: GNS/DS CcTooltip.
-->
<script setup>
import { ref, computed } from 'vue'
import { CcTooltip } from '@chesscom/design-system'

const props = defineProps({
  selectedColor: { type: String, default: 'white' },
  baseUrl: { type: String, default: '' },
  /** 'toggle' = sliding toggle (V3/V4); 'switch' = two squares, outline on selected (V5) */
  variant: { type: String, default: 'toggle' },
  /** When true (e.g. Your Openings): show third "Both" tile (white|black split), accept 'both' in selectedColor */
  allowBoth: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selectedColor', 'toggle'])

/** GNS: teams.design.public.icons.glyphs → piece-hollow-king-1.svg (inline; matches DS glyph paths). */

const kingIconSrc = computed(() => `${props.baseUrl || ''}icons/king-outline.svg`)

/** Sliding toggle: tooltip follows pointer (left half = White, right half = Black). */
const toggleHoverSide = ref('white')

const toggleTooltipText = computed(() =>
  toggleHoverSide.value === 'black' ? 'Openings for Black' : 'Openings for White'
)

function onTogglePointerMove(event) {
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
  const { left, width } = el.getBoundingClientRect()
  toggleHoverSide.value = event.clientX - left < width / 2 ? 'white' : 'black'
}

const isSwitch = computed(() => props.variant === 'switch')

/** Outline on the active color tile only; 'both' = no filter → no ring on any tile. */
const effectiveSelectedForOutline = computed(() =>
  props.selectedColor === 'both' ? null : props.selectedColor
)

function select(color) {
  if (color === 'both') {
    if (props.selectedColor === 'both') return
    emit('update:selectedColor', 'both')
    emit('toggle', 'both')
    return
  }
  if (props.selectedColor === color) {
    emit('update:selectedColor', 'both')
    emit('toggle', 'both')
    return
  }
  emit('update:selectedColor', color)
  emit('toggle', color)
}

function onToggleClick(event) {
  const button = event.currentTarget
  if (!button || !(button instanceof HTMLElement)) return

  const thumb = button.querySelector('.color-toggle__thumb')
  const thumbRect = thumb?.getBoundingClientRect()

  const clickedThumb =
    thumbRect &&
    event.clientX >= thumbRect.left &&
    event.clientX <= thumbRect.right &&
    event.clientY >= thumbRect.top &&
    event.clientY <= thumbRect.bottom

  if (clickedThumb) {
    const next =
      props.selectedColor === 'white'
        ? 'black'
        : props.selectedColor === 'black'
          ? 'white'
          : 'black'
    emit('update:selectedColor', next)
    emit('toggle', next)
    return
  }

  const rect = button.getBoundingClientRect()
  const x = event.clientX - rect.left
  const isLeftHalf = x < rect.width / 2
  if (isLeftHalf) {
    if (props.selectedColor === 'white') {
      emit('update:selectedColor', 'both')
      emit('toggle', 'both')
    } else {
      emit('update:selectedColor', 'white')
      emit('toggle', 'white')
    }
  } else {
    if (props.selectedColor === 'black') {
      emit('update:selectedColor', 'both')
      emit('toggle', 'both')
    } else {
      emit('update:selectedColor', 'black')
      emit('toggle', 'black')
    }
  }
}

function onToggleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (props.selectedColor === 'white') {
      emit('update:selectedColor', 'black')
      emit('toggle', 'black')
    } else if (props.selectedColor === 'black') {
      emit('update:selectedColor', 'white')
      emit('toggle', 'white')
    } else {
      emit('update:selectedColor', 'white')
      emit('toggle', 'white')
    }
  }
}
</script>

<template>
  <span class="color-toggle-wrap" :class="{ 'color-toggle-wrap--switch': isSwitch }">
    <!-- V5 Switch: two squares side by side; selected has outline (same as course card square-outline) -->
    <span
      v-if="isSwitch"
      class="color-switch"
      role="group"
      aria-label="Filter by piece color"
      data-name="Color Switch"
    >
      <button
        type="button"
        class="color-switch__option"
        :class="{ 'color-switch__option--selected': effectiveSelectedForOutline === 'white' }"
        aria-label="Openings for White"
        :aria-pressed="selectedColor === 'white'"
        @click="select('white')"
      >
        <span class="color-switch__outline">
          <span class="color-switch__thumb color-switch__thumb--white" aria-hidden="true">
            <svg
              class="color-switch__king-svg"
              viewBox="0 0 19 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              data-name="piece-hollow-king-1"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </span>
      </button>
      <CcTooltip
        for-previous-element
        class="practice-in-tooltip-no-fade color-toggle-tooltip"
        :delay="0"
        position="top"
        anchor="center"
      >
        <span class="color-toggle-tooltip__text">Openings for White</span>
      </CcTooltip>
      <button
        type="button"
        class="color-switch__option"
        :class="{ 'color-switch__option--selected': effectiveSelectedForOutline === 'black' }"
        aria-label="Openings for Black"
        :aria-pressed="selectedColor === 'black'"
        @click="select('black')"
      >
        <span class="color-switch__outline">
          <span class="color-switch__thumb color-switch__thumb--black" aria-hidden="true">
            <svg
              class="color-switch__king-svg"
              viewBox="0 0 19 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              data-name="piece-hollow-king-1"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </span>
      </button>
      <CcTooltip
        for-previous-element
        class="practice-in-tooltip-no-fade color-toggle-tooltip"
        :delay="0"
        position="top"
        anchor="center"
      >
        <span class="color-toggle-tooltip__text">Openings for Black</span>
      </CcTooltip>
      <button
        v-if="allowBoth"
        type="button"
        class="color-switch__option"
        aria-label="Openings for White and Black"
        :aria-pressed="selectedColor === 'both'"
        @click="select('both')"
      >
        <span class="color-switch__outline">
          <span class="color-switch__thumb color-switch__thumb--both" aria-hidden="true">
            <span class="color-switch__thumb-half color-switch__thumb-half--left" aria-hidden="true" />
            <span class="color-switch__thumb-half color-switch__thumb-half--right" aria-hidden="true" />
            <svg
              class="color-switch__king-svg color-switch__king-svg--overlay"
              viewBox="0 0 19 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              data-name="piece-hollow-king-1"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                d="M4.87 17.47L3.37 17.57C3.27 16.24 0 14.7 0 11.17C0 7.24 3.57 5.34 6.77 6.27L6.64 7.07H4.61V2.27H6.88V0H11.68V2.27H13.95V7.07H11.88L11.78 6.3C15.15 5.27 18.55 7.27 18.55 11.2C18.55 14.63 15.22 16.3 15.15 17.53L13.65 17.46C13.75 15.26 17.05 14.13 17.05 11.19C17.05 7.66 13.45 6.46 10.58 8.52L10.15 5.55H12.45V3.75H10.18V1.48H8.38V3.75H6.11V5.55H8.41L7.94 8.52C5.34 6.52 1.51 7.62 1.51 11.15C1.51 14.18 4.71 15.18 4.88 17.45L4.87 17.47ZM3.4 19.97V20.5H15.13V19.97C15.13 18.24 14.16 18.1 9.26 18.1C4.36 18.1 3.39 18.23 3.39 19.97H3.4ZM1.9 22V19.97C1.9 17.24 3.27 16.6 9.27 16.6C15.27 16.6 16.64 17.23 16.64 19.97V22H1.9ZM12.34 13.9H10.71V11.1C12.38 9.73 14.04 10.3 14.04 11.47C14.04 12.24 13.07 13.17 12.34 13.9ZM7.84 11.07V13.9H6.21C5.48 13.17 4.54 12.27 4.54 11.57C4.54 10.4 6.21 9.84 7.84 11.07Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </span>
      </button>
    </span>
    <!-- V3/V4 Toggle: single track + sliding thumb -->
    <template v-else>
      <button
        type="button"
        class="color-toggle"
        aria-label="Filter by piece color"
        :aria-pressed="selectedColor === 'white'"
        data-name="Color Toggle"
        @click="onToggleClick"
        @keydown="onToggleKeydown"
        @pointerenter="onTogglePointerMove"
        @pointermove="onTogglePointerMove"
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
      <CcTooltip
        for-previous-element
        class="practice-in-tooltip-no-fade color-toggle-tooltip"
        :delay="0"
        position="top"
        anchor="center"
      >
        <span class="color-toggle-tooltip__text">{{ toggleTooltipText }}</span>
      </CcTooltip>
    </template>
  </span>
</template>

<style scoped>
.color-toggle-wrap {
  display: inline-flex;
  flex-shrink: 0;
}

/* Hit area: button must fully cover the visible toggle (56×30); no padding/overflow that shrink it */
.color-toggle {
  position: relative;
  box-sizing: border-box;
  width: 56px;
  min-width: 56px;
  height: 30px;
  min-height: 30px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  display: block;
  overflow: visible;
  /* Stack above any sibling that might extend over the thumb (e.g. search field) */
  z-index: 1;
  isolation: isolate;
}

/* Thumb and icon must not block pointer events – click goes through to the button */
.color-toggle__thumb,
.color-toggle__thumb svg,
.color-toggle__thumb img {
  pointer-events: none;
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

/* Thumb fully inside button: left/top 0, size 30×30; translateX(26px) keeps right edge at 56 */
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

/* V5 Switch: two squares side by side; selected has outline (same as course card square-outline) */
.color-switch {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.color-switch__option {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
}

.color-switch__option:focus-visible {
  outline: none;
}

.color-switch__option:focus-visible .color-switch__outline {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}

/* Outline 44×44; thumb 40×40; selection ring 3px; gap 4px; tile inset stroke. */
.color-switch__outline {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  box-sizing: border-box;
  border-radius: calc(var(--radius-5, 5px) + 2px);
  transition: box-shadow 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.color-switch__option--selected .color-switch__outline {
  box-shadow: 0 0 0 3px rgba(129, 182, 76, 1);
}

.color-switch__thumb {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  box-sizing: border-box;
  border-radius: var(--radius-5, 5px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Tile colors: Colorpicker pattern. Inside stroke only (inset box-shadow, no outer border). */
.color-switch__thumb--white {
  background-color: #e7e6e5;
  border: none;
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.08);
}

.color-switch__thumb--black {
  background-color: #312e2b;
  border: none;
  box-shadow:
    inset 0 0 0 1px var(--color-border-default, rgba(255, 255, 255, 0.1)),
    0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Both: left white, right black; same inset stroke per half; king centered on top */
.color-switch__thumb--both {
  position: relative;
  background: none;
  border: none;
  box-shadow: none;
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-5, 5px);
}

.color-switch__thumb-half {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  box-sizing: border-box;
}

.color-switch__thumb-half--left {
  left: 0;
  background-color: #e7e6e5;
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.08);
}

.color-switch__thumb-half--right {
  right: 0;
  background-color: #312e2b;
  box-shadow:
    inset 0 0 0 1px var(--color-border-default, rgba(255, 255, 255, 0.1)),
    0 1px 2px rgba(0, 0, 0, 0.2);
}

.color-switch__king-svg--overlay {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

/* GNS piece-hollow-king-1.svg – 32×32 in tile */
.color-switch__king-svg {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #8b8987;
  pointer-events: none;
  display: block;
}
</style>

<style>
/* GNS/DS tooltip: background + arrow use semantic token teams.design.public.tokens.semantic.color (--color-bg-base). */
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip {
  --tooltipBackground: var(--color-bg-base, #1a1918);
}
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip .cc-tooltip-content {
  transition: opacity 0.2s var(--motion-ease-out-gentle, ease-out) !important;
  transition-property: opacity !important;
}
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip .cc-tooltip-content.cc-tooltip-visible {
  opacity: 1 !important;
}
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip .cc-tooltip-inner {
  background-color: var(--color-bg-base, #1a1918) !important;
  box-shadow: none !important;
}
/* Arrow (position=top → arrow at bottom): use same DS token so arrow matches bubble */
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip .cc-tooltip-content::after,
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip .cc-tooltip-content::before,
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip [class*="arrow"]::after,
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip [class*="arrow"]::before {
  border-top-color: var(--color-bg-base, #1a1918) !important;
}
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip [class*="arrow"] {
  border-top-color: var(--color-bg-base, #1a1918) !important;
  background-color: var(--color-bg-base, #1a1918) !important;
}
/* Text: DS paragraph-medium bold */
.cc-tooltip-component.practice-in-tooltip-no-fade.color-toggle-tooltip .cc-tooltip-inner .color-toggle-tooltip__text {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: var(--text-paragraph-medium, 14px);
  line-height: var(--leading-5, 20px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, rgba(255, 255, 255, 0.95));
  white-space: nowrap;
}
</style>
