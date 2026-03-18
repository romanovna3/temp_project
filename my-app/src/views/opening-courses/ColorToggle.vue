<!--
  Color Toggle / Switch: filter courses by piece color (White / Black).
  variant="toggle" (V3/V4): single track + sliding thumb.
  variant="switch" (V5): two thumb squares side by side; selected has outline (like course card).
  Tooltip: GNS/DS CcTooltip.
-->
<script setup>
import { computed } from 'vue'
import { CcIcon, CcTooltip } from '@chesscom/design-system'

const props = defineProps({
  selectedColor: { type: String, default: 'white' },
  baseUrl: { type: String, default: '' },
  /** 'toggle' = sliding toggle (V3/V4); 'switch' = two squares, outline on selected (V5) */
  variant: { type: String, default: 'toggle' },
})

const emit = defineEmits(['update:selectedColor', 'toggle'])

/** GNS: teams.design.public.icons.glyphs → piece-hollow-king-1.svg (CcIcon glyph). */

const kingIconSrc = computed(() => `${props.baseUrl || ''}icons/king-outline.svg`)

const tooltipText = computed(() =>
  props.selectedColor === 'white' ? 'Openings for White' : 'Openings for Black'
)

const isSwitch = computed(() => props.variant === 'switch')

function select(color) {
  if (props.selectedColor === color) return
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
    const next = props.selectedColor === 'white' ? 'black' : 'white'
    emit('update:selectedColor', next)
    emit('toggle', next)
    return
  }

  const rect = button.getBoundingClientRect()
  const x = event.clientX - rect.left
  const isLeftHalf = x < rect.width / 2
  if (isLeftHalf) {
    if (props.selectedColor !== 'white') {
      emit('update:selectedColor', 'white')
      emit('toggle', 'white')
    }
  } else {
    if (props.selectedColor !== 'black') {
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
        :class="{ 'color-switch__option--selected': selectedColor === 'white' }"
        aria-label="Openings for White"
        :aria-pressed="selectedColor === 'white'"
        @click="select('white')"
      >
        <span class="color-switch__outline">
          <span class="color-switch__thumb color-switch__thumb--white" aria-hidden="true">
            <CcIcon
              name="piece-hollow-king-1"
              variant="glyph"
              :custom-size="28"
              class="color-switch__king-icon"
              aria-hidden="true"
            />
          </span>
        </span>
      </button>
      <button
        type="button"
        class="color-switch__option"
        :class="{ 'color-switch__option--selected': selectedColor === 'black' }"
        aria-label="Openings for Black"
        :aria-pressed="selectedColor === 'black'"
        @click="select('black')"
      >
        <span class="color-switch__outline">
          <span class="color-switch__thumb color-switch__thumb--black" aria-hidden="true">
            <CcIcon
              name="piece-hollow-king-1"
              variant="glyph"
              :custom-size="28"
              class="color-switch__king-icon"
              aria-hidden="true"
            />
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
    </template>
    <CcTooltip
      for-previous-element
      class="practice-in-tooltip-no-fade color-toggle-tooltip"
      :delay="0"
      position="top"
      anchor="center"
    >
      <span class="color-toggle-tooltip__text">{{ tooltipText }}</span>
    </CcTooltip>
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
  gap: var(--space-8, 8px);
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

/* GNS: teams.design.public.tokens.semantic.dimensions (radius-5, space-8), color.border (border-success, border-default). No color-picker component in GNS; tile visuals follow Colorpicker pattern. */
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
  box-shadow: 0 0 0 2px var(--color-border-success);
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

/* Tile colors: Colorpicker pattern (#e7e6e5 / #312e2b). Borders: GNS border-default (transparent-white-10) where applicable. */
.color-switch__thumb--white {
  background-color: #e7e6e5;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.color-switch__thumb--black {
  background-color: #312e2b;
  border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.1));
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* GNS glyph piece-hollow-king-1 – Colorpicker fill (#8B8987) */
.color-switch__king-icon {
  flex-shrink: 0;
  color: #8b8987;
  pointer-events: none;
}
.color-switch__king-icon :deep(svg) {
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
