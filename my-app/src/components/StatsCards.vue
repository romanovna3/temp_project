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
      data-name="Stats"
    >
      <p class="stats-card__label">{{ card.label }}</p>
      <div class="stats-card__value-row" data-name="Rank">
        <p v-if="!card.showLock" class="stats-card__value">{{ card.value }}</p>
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

<!-- Styles live in Courses.vue (.stats-cards-row, .stats-card, etc.) so V6 overrides apply when used -->
