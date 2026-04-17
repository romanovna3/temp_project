<script setup>
import { CcIcon } from '@chesscom/design-system'
import { MOVE_CLASSIFICATIONS } from '../data/classifications.js'

defineProps({
  moves: { type: Array, required: true },
  result: { type: String, default: '' },
})

function classificationIcon(key) {
  const cls = MOVE_CLASSIFICATIONS[key]
  return cls ? cls.icon : null
}

function classificationColor(key) {
  if (!key) return null
  return `var(--color-classification-${key})`
}
</script>

<template>
  <div class="move-list">
    <div
      v-for="(move, idx) in moves"
      :key="move.num"
      class="move-row"
      :class="{ 'alt-row': idx % 2 === 1 }"
    >
      <div class="plys">
        <span class="move-number">{{ move.num }}.</span>

        <!-- White ply -->
        <div v-if="move.white" class="ply-cell">
          <div class="classification-slot">
            <CcIcon
              v-if="move.white.classification"
              :name="classificationIcon(move.white.classification)"
              variant="color"
              :size="16"
            />
          </div>
          <div
            class="ply"
            :class="{ 'ply-selected': move.white.selected }"
          >
            <div class="piece-notation">
              <span
                v-if="move.white.piece"
                class="piece-glyph"
                :style="move.white.classification ? { color: classificationColor(move.white.classification) } : {}"
              >{{ move.white.piece }}</span>
              <span
                class="notation"
                :style="move.white.classification ? { color: classificationColor(move.white.classification) } : {}"
              >{{ move.white.san }}</span>
            </div>
          </div>
        </div>

        <!-- Black ply -->
        <div v-if="move.black" class="ply-cell">
          <div class="classification-slot">
            <CcIcon
              v-if="move.black.classification"
              :name="classificationIcon(move.black.classification)"
              variant="color"
              :size="16"
            />
          </div>
          <div
            class="ply"
            :class="{ 'ply-selected': move.black.selected }"
          >
            <div class="piece-notation">
              <span
                v-if="move.black.piece"
                class="piece-glyph"
                :style="move.black.classification ? { color: classificationColor(move.black.classification) } : {}"
              >{{ move.black.piece }}</span>
              <span
                class="notation"
                :style="move.black.classification ? { color: classificationColor(move.black.classification) } : {}"
              >{{ move.black.san }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game result -->
    <div v-if="result" class="move-row">
      <div class="plys">
        <span class="move-number result-text">{{ result }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.move-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: clip;
}

.move-row {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 var(--space-24, 24px);
  overflow: clip;
  flex-shrink: 0;
}

.move-row.alt-row {
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.02));
}

.plys {
  display: flex;
  align-items: center;
}

.move-number {
  width: 24px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.result-text {
  width: auto;
}

.ply-cell {
  display: flex;
  align-items: center;
  gap: var(--space-4, 4px);
  width: 100px;
  flex-shrink: 0;
}

.classification-slot {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.ply {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2, 2px) var(--space-4, 4px);
  border-radius: var(--radius-xs, 2px);
  overflow: clip;
}

.ply-selected {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.05));
  box-shadow: 0 2px 0 0 var(--color-icon-default, rgba(255, 255, 255, 0.5));
}

.piece-notation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 18px;
}

.piece-glyph {
  font-family: 'ChessNote', sans-serif;
  font-size: 14px;
  line-height: 16px;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  width: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 18px;
}

.notation {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-default, rgba(255, 255, 255, 0.72));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  height: 18px;
  white-space: nowrap;
}
</style>
