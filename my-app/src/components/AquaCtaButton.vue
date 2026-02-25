<script setup>
/**
 * V6 Button (Aqua - Enabled State)
 * Primary action button with aqua/teal gradient, multi-layer shadows, and optional notification badge.
 * Spec: Figma V6 Button – gradient background, 10px radius, 4-layer inset shadow, Chess Sans Bold, badge #10777c.
 * Required by Courses.vue and CoursesV9.vue (footer Design A/B).
 */
defineProps({
  label: { type: String, default: 'Practice' },
  badge: { type: [Number, String], default: undefined },
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="aqua-cta-button"
    :class="{ 'aqua-cta-button--disabled': disabled }"
    :disabled="disabled"
    :aria-label="badge != null ? `${label} (${badge})` : label"
    data-name="V6 Button"
    @click="$emit('click')"
  >
    <!-- Gradient background (replaces Figma asset; aqua/teal theme) -->
    <span class="aqua-cta-button__bg" aria-hidden="true" />
    <!-- Inset shadow overlay: 4-layer bevel (top highlight + bottom darken + soft glows) -->
    <span class="aqua-cta-button__inset" aria-hidden="true" />
    <!-- Label -->
    <span class="aqua-cta-button__text">{{ label }}</span>
    <!-- Badge frame + notification badge -->
    <span
      v-if="badge != null && String(badge).length"
      class="aqua-cta-button__badge-frame"
      data-name="Badge Frame"
    >
      <span class="aqua-cta-button__badge" data-name="Notification Badge">
        <span class="aqua-cta-button__badge-text">{{ badge }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
/* Colors from spec */
.aqua-cta-button {
  --aqua-dark: #10777c;
  --aqua-mint: #62f6ca;
  --aqua-mid: #26c2a3;
}

.aqua-cta-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 48px;
  min-height: 44px;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  overflow: clip;
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  color: #fff;
  text-align: center;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: filter 0.15s ease, box-shadow 0.15s ease;
  /* External drop shadow: 2 layers */
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.14),
    0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

.aqua-cta-button:hover:not(.aqua-cta-button--disabled) {
  filter: brightness(1.05);
  box-shadow:
    0 2px 4px 0 rgba(0, 0, 0, 0.14),
    0 4px 8px 0 rgba(0, 0, 0, 0.1);
}

.aqua-cta-button:active:not(.aqua-cta-button--disabled) {
  filter: brightness(0.95);
  box-shadow:
    0 1px 2px 0 rgba(0, 0, 0, 0.2),
    0 2px 4px 0 rgba(0, 0, 0, 0.15);
}

.aqua-cta-button--disabled,
.aqua-cta-button:disabled {
  cursor: default;
  opacity: 0.6;
  filter: none;
}

/* Background: aqua/teal gradient (2-stop: dark to mid) */
.aqua-cta-button__bg {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(0deg, rgba(16, 152, 136, 1) 0%, rgba(38, 194, 163, 1) 100%);
  pointer-events: none;
}

/* Inset shadow overlay: 4-layer bevel */
.aqua-cta-button__inset {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 1px 0 0 rgba(98, 246, 202, 0.4),
    inset 0 -1px 0 0 var(--aqua-dark),
    inset 0 2px 4px 0 rgba(98, 246, 202, 0.5),
    inset 0 -2px 4px 0 rgba(38, 194, 163, 0.5);
}

.aqua-cta-button__text {
  position: relative;
  flex-shrink: 0;
  font-feature-settings: 'liga' 0;
}

/* Badge frame: 2px left padding */
.aqua-cta-button__badge-frame {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-left: 2px;
  position: relative;
  flex-shrink: 0;
}

/* Notification badge: white 72%, 10px radius */
.aqua-cta-button__badge {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  padding: 1px 4px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
  flex-shrink: 0;
  position: relative;
}

.aqua-cta-button__badge-text {
  font-family: var(--font-family-heading, 'Chess Sans', sans-serif);
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  letter-spacing: 0.6px;
  color: var(--aqua-dark);
  text-align: center;
  text-transform: uppercase;
  flex-shrink: 0;
}
</style>
