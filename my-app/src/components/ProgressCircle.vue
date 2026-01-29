<script setup>
/**
 * Production Circular Progress Bar – Item List (Figma node 3-6240).
 * Dynamic arc from progress (0–100). Track ring + progress arc; 100% = solid circle + checkmark.
 * Completed state: green circle + mark-check glyph inside with green shadow.
 */
import { computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const props = defineProps({
  /** 0–100; completion percentage. Drives arc and completed state. */
  progress: { type: Number, default: 0 },
  /** Optional size in px (default 24). */
  size: { type: Number, default: 24 },
})

const VIEWBOX = 24
const CENTER = 12
/** Track and progress arc: same ring, center radius 10, stroke 4. */
const R = 10
const STROKE_WIDTH = 4
const CIRCUMFERENCE = 2 * Math.PI * R

const clampedProgress = computed(() => {
  const p = Number(props.progress)
  if (Number.isNaN(p)) return 0
  return Math.min(100, Math.max(0, p))
})

const showTrackOnly = computed(() => clampedProgress.value === 0)
const showArc = computed(() => clampedProgress.value > 0 && clampedProgress.value < 100)
const showCompleted = computed(() => clampedProgress.value >= 100)

/** Stroke-dasharray: visible length = (progress/100)*circumference, gap = rest. */
const arcStrokeDashArray = computed(() => {
  const pct = clampedProgress.value / 100
  const dash = CIRCUMFERENCE * pct
  return `${dash} ${CIRCUMFERENCE}`
})
/** Start at 12 o'clock: circle is rotated -90deg so path start is at top; offset 0 keeps arc from top. */
const arcStrokeDashOffset = computed(() => '0')
/** Checkmark icon size inside completed circle (~2/3 of circle so it sits inside). */
const checkIconSize = computed(() => Math.max(12, Math.round(props.size * (2 / 3))))
</script>

<template>
  <span
    class="progress-circle"
    role="progressbar"
    :aria-valuenow="clampedProgress"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="`Progress: ${clampedProgress}%`"
    :style="{ width: size + 'px', height: size + 'px' }"
    data-name="Progress Circle"
  >
    <svg
      class="progress-circle-svg"
      viewBox="0 0 24 24"
      fill="none"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Track: circular ring, white 10% opacity (always present except in completed state we use solid circle) -->
      <circle
        v-if="showTrackOnly || showArc"
        id="track"
        :cx="CENTER"
        :cy="CENTER"
        :r="R"
        fill="none"
        stroke="var(--fill-0, white)"
        stroke-opacity="0.1"
        :stroke-width="STROKE_WIDTH"
      />

      <!-- Progress arc: 0 < progress < 100, clockwise from 12 o'clock (same width as track) -->
      <circle
        v-if="showArc"
        id="completed"
        :cx="CENTER"
        :cy="CENTER"
        :r="R"
        fill="none"
        stroke="#81B64C"
        :stroke-width="STROKE_WIDTH"
        :stroke-dasharray="arcStrokeDashArray"
        :stroke-dashoffset="arcStrokeDashOffset"
        transform="rotate(-90 12 12)"
      />

      <!-- Completed (100%): green circle background -->
      <rect
        v-if="showCompleted"
        id="completed"
        width="24"
        height="24"
        rx="12"
        fill="var(--fill-0, #81B64C)"
      />
    </svg>
    <!-- Completed (100%): mark-check glyph inside with green shadow -->
    <span v-if="showCompleted" class="progress-circle-completed" aria-hidden="true">
      <CcIcon
        name="mark-check"
        variant="glyph"
        :size="checkIconSize"
        class="progress-circle-completed-icon"
      />
    </span>
  </span>
</template>

<style scoped>
.progress-circle {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}
.progress-circle-svg {
  display: block;
  width: 100%;
  height: 100%;
}
/* Completed state: mark-check glyph (white) with green shadow */
.progress-circle-completed {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.progress-circle-completed-icon {
  color: white;
  filter: drop-shadow(0 1px 0 #45753C);
}
</style>
