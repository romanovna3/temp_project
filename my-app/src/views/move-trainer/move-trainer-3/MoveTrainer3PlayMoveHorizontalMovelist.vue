<script setup>
/**
 * Play Move + OM shell — inline PG notation for all plies unlocked so far (`footerNavMaxPly`).
 * `activePlyIndex` tracks the scrub cursor (`currentPly`), not how many pills are shown.
 */
import { computed } from 'vue'

const props = defineProps({
  /** Flattened main-line plies with moveNum, color, san, piece (optional). */
  plies: { type: Array, required: true },
  /** Index (0-based in `plies`) of the position being viewed; highlight that SAN pill. */
  activePlyIndex: { type: Number, default: -1 },
})

const PIECE_GLYPH_TO_SAN_LETTER = Object.freeze({
  k: 'K',
  K: 'K',
  q: 'Q',
  Q: 'Q',
  r: 'R',
  R: 'R',
  b: 'B',
  B: 'B',
  n: 'N',
  N: 'N',
})

function sanDisplayForPieceIcon(san, pieceGlyph) {
  if (!pieceGlyph || !san) return san
  const letter = PIECE_GLYPH_TO_SAN_LETTER[pieceGlyph]
  if (!letter || !san.startsWith(letter)) return san
  return san.slice(1)
}

const hasMoves = computed(() => props.plies.length > 0)
</script>

<template>
  <div
    v-if="hasMoves"
    class="mt3-play-horizontal-movelist"
    aria-label="Moves played in this line"
  >
    <template v-for="(ply, idx) in plies" :key="idx">
      <span v-if="ply.color === 'white'" class="mt3-hml-move-num cc-paragraph-medium">{{ ply.moveNum }}.</span>
      <span
        class="mt3-hml-san"
        :class="{ 'mt3-hml-san--selected': idx === activePlyIndex }"
      >
        <span v-if="ply.piece" class="mt3-hml-piece">{{ ply.piece }}</span>
        <span class="mt3-hml-san-text">{{ sanDisplayForPieceIcon(ply.san, ply.piece) }}</span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.mt3-play-horizontal-movelist {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0 6px;
  width: 100%;
  min-height: 32px;
  padding: 0 0 10px;
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  flex-shrink: 0;
}

.mt3-hml-move-num {
  flex-shrink: 0;
  font-family: var(--font-family-system, system-ui, sans-serif);
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.mt3-hml-san {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  padding: var(--space-2, 2px) var(--space-4, 4px);
  border-radius: 3px;
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
  white-space: nowrap;
}

.mt3-hml-san--selected {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.05));
  box-shadow: 0 2px 0 0 var(--color-icon-default, rgba(255, 255, 255, 0.5));
  color: var(--color-text-default, rgba(255, 255, 255, 0.92));
}

.mt3-hml-piece {
  font-family: 'ChessNote', sans-serif;
  font-size: 14px;
  line-height: 16px;
  width: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.mt3-hml-san-text {
  white-space: nowrap;
}
</style>
