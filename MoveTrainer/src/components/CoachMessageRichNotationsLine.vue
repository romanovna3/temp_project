<script setup>
/**
 * One rich coach paragraph: `text` segments + `move` chips — same structure and styling as
 * The Dream Opening (`INFORMATIONAL_DREAM_OPENING.segments` in `informationalDreamOpening.js`).
 * Use for informational copy and for quiz / any other coach line that should match without duplicating markup.
 */
defineProps({
  segments: { type: Array, default: null },
  /** Board / selection ply: highlights the matching `move` chip. */
  activePly: { type: Number, default: 0 },
  /**
   * Quiz / static preview: chips look active but are not focusable and do not emit.
   * Informational: keep `false` so footers and chips can jump the line.
   */
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['selectPly'])
</script>

<template>
  <p v-if="segments?.length" class="coach-message coach-message--rich cc-text-speech">
    <template v-for="(seg, idx) in segments" :key="idx">
      <span v-if="seg.type === 'text'" class="coach-segment-text">{{ seg.text }}</span>
      <button
        v-else-if="seg.type === 'move'"
        type="button"
        class="coach-inline-move"
        :data-coach-move-ply="seg.ply"
        :class="{ 'coach-inline-move--active': activePly === seg.ply }"
        :aria-label="`Go to move ${seg.san ?? seg.label}`"
        :disabled="readonly"
        :tabindex="readonly ? -1 : undefined"
        @click="emit('selectPly', seg.ply)"
      >
        {{ seg.san ?? seg.label }}
      </button>
    </template>
  </p>
</template>

<style scoped>
/* Same rules as the informational coach bubble; single place to tune inline move rows. */
.coach-message.cc-text-speech {
  margin: 0;
  color: var(--coach-bubble-fg, #312e2b);
  white-space: pre-line;
}

/**
 * Inline move chips (light speech bubble): same affordance as MoveList `.ply` on dark panel,
 * inverted for light speech bubble — subtle fill + hover; active matches selected ply.
 */
.coach-message--rich {
  white-space: pre-line;
}

.coach-inline-move {
  display: inline;
  margin: 0;
  padding: 1px 4px;
  border: none;
  border-radius: var(--radius-xs, 4px);
  font: inherit;
  line-height: inherit;
  color: var(--coach-bubble-fg, #312e2b);
  background: rgba(49, 46, 43, 0.06);
  cursor: pointer;
  vertical-align: baseline;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.coach-inline-move:hover:not(:disabled) {
  background: rgba(49, 46, 43, 0.1);
}

.coach-inline-move:focus-visible {
  outline: 2px solid rgba(49, 46, 43, 0.35);
  outline-offset: 2px;
}

.coach-inline-move:disabled {
  cursor: default;
}

.coach-inline-move--active {
  background: rgba(49, 46, 43, 0.14);
  font-weight: 600;
}
</style>
