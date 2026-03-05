<script setup>
/**
 * Aqua notification badge – same style as the Practice tab badge (course page).
 * Use next to progress bar or mastery bar on course cards (e.g. "ready for Practice" count).
 * Specs: 12px system font, 30px radius (pill), aqua like L1/L2 chips.
 */
defineProps({
  count: { type: [Number, String], default: 0 },
})
</script>

<template>
  <span class="aqua-badge" data-name="Notification Badge" :aria-label="count != null ? `Ready for practice: ${count}` : undefined">
    <span class="aqua-badge__text">{{ count }}</span>
  </span>
</template>

<style scoped>
.aqua-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  padding: 1px 4px;
  border-radius: 30px;
  background-color: rgba(38, 194, 163, 0.2);
  flex-shrink: 0;
}

.aqua-badge__text {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--color-aqua-300, #26c2a3);
  text-align: center;
}
</style>
