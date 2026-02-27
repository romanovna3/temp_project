<script setup>
import { CcIcon } from '@chesscom/design-system'

defineOptions({ name: 'StatsCards' })

defineProps({
  cards: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="stats-cards-row" data-name="StatsCardsRow">
    <div
      v-for="(card, index) in cards"
      :key="index"
      class="stats-card"
      :class="{ 'stats-card--lock': card.showLock }"
      data-name="Stats"
    >
      <div class="stats-card__label-row">
        <CcIcon
          v-if="card.icon"
          :name="card.icon"
          variant="glyph"
          :size="12"
          class="stats-card__label-icon"
          aria-hidden="true"
        />
        <p class="stats-card__label">{{ card.label }}</p>
      </div>
      <div class="stats-card__value-row" data-name="Rank">
        <template v-if="!card.showLock">
          <div class="stats-card__value-baseline">
            <span class="stats-card__value">{{ card.value }}</span>
            <span v-if="card.total != null" class="stats-card__total"> / {{ card.total }}</span>
          </div>
        </template>
        <span v-else class="stats-card__lock" aria-hidden="true">
          <CcIcon name="tool-lock-blank" variant="glyph" :size="20" class="stats-card__lock-icon" />
        </span>
        <div v-if="card.change" class="stats-card__change-wrap" data-name="Rank">
          <p class="stats-card__change">{{ card.change }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Stats cards: 2 per row, 2 rows (4 total), fill width */
.stats-cards-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  padding: 8px 16px 12px;
}
.stats-card {
  min-width: 0;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 3px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: stretch;
}
.stats-card__label-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  flex-shrink: 0;
}
.stats-card__label-icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  margin: 3px 0;
  color: rgba(255, 255, 255, 0.5);
}
.stats-card__label {
  font-family: var(--font-family-system, system-ui, -apple-system, BlinkMacSystemFont, sans-serif);
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
  text-align: left;
  margin: 0;
  flex-shrink: 0;
}
.stats-card__value-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  min-width: 40px;
  overflow: clip;
  border-radius: 3px;
  flex-shrink: 0;
  width: 100%;
}
.stats-card__value-baseline {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
  gap: 4px;
}
.stats-card__value {
  font-family: 'Chess Sans', sans-serif;
  font-weight: 700;
  font-size: 28px;
  line-height: 32px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  flex-shrink: 0;
  font-feature-settings: 'liga' 0;
}
.stats-card__total {
  font-family: var(--font-family-system, system-ui, -apple-system, BlinkMacSystemFont, sans-serif);
  font-weight: 600;
  font-size: 12px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  flex-shrink: 0;
}
.stats-card__change-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.stats-card__change {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: #81b64c;
  margin: 0;
  flex-shrink: 0;
}
.stats-card__lock {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* Card with lock: 10px gap between label and lock icon */
.stats-card--lock {
  gap: 10px;
}
.stats-card__lock-icon {
  color: var(--icon-disabled, rgba(255, 255, 255, 0.4));
}
</style>
