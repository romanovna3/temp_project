<script setup>
import { CcButton, CcIcon } from '@chesscom/design-system'
import EvalGraph from './EvalGraph.vue'
import { MOVE_CLASSIFICATIONS } from '../data/classifications.js'

const props = defineProps({
  players: { type: Object, required: true },
  timeControl: { type: Object, required: true },
  advancedStats: { type: Array, required: true },
  classificationCounts: { type: Object, required: true },
  plies: { type: Array, required: true },
  highlightBestWorst: { type: Boolean, default: false },
})

const emit = defineEmits(['start-review', 'go-to-ply'])

const OVERVIEW_CLASSIFICATIONS = ['brilliant', 'great', 'miss', 'blunder']
</script>

<template>
  <div class="overview-panel">
    <!-- Scrollable content -->
    <div class="overview-scroll">
      <!-- Eval graph (static, no playhead) -->
      <div class="overview-eval-graph">
        <EvalGraph
          :plies="plies"
          :active-ply="0"
          :highlight-best-worst="highlightBestWorst"
          :limit-one-per-type="true"
          @select-ply="(ply) => emit('go-to-ply', ply)"
        />
      </div>

      <!-- Stats grid -->
      <div class="stats-section">
        <!-- Players + Accuracy + Game Rating -->
        <div class="stats-grid">
          <!-- Header row: empty | player name | player name -->
          <div class="stats-row header-row">
            <div class="label-col" />
            <div class="player-col">
              <span class="player-name">{{ players.white.name }}</span>
            </div>
            <div class="player-col">
              <span class="player-name">{{ players.black.name }}</span>
            </div>
          </div>

          <!-- Players row: "Players" | avatar | avatar -->
          <div class="stats-row players-row">
            <div class="label-col">
              <span class="row-label">Players</span>
            </div>
            <div class="player-col">
              <div class="avatar-frame" :class="{ winner: players.white.isWinner }">
                <img :src="players.white.avatar" :alt="players.white.name" class="avatar-img" />
              </div>
            </div>
            <div class="player-col">
              <div class="avatar-frame" :class="{ winner: players.black.isWinner }">
                <img :src="players.black.avatar" :alt="players.black.name" class="avatar-img" />
              </div>
            </div>
          </div>

          <!-- Accuracy row -->
          <div class="stats-row">
            <div class="label-col">
              <span class="row-label">Accuracy</span>
            </div>
            <div class="player-col">
              <div class="stat-badge" :class="players.white.isWinner ? 'badge-winner' : 'badge-default'">
                {{ players.white.accuracy }}
              </div>
            </div>
            <div class="player-col">
              <div class="stat-badge" :class="players.black.isWinner ? 'badge-winner' : 'badge-default'">
                {{ players.black.accuracy }}
              </div>
            </div>
          </div>

          <!-- Game Rating row -->
          <div class="stats-row">
            <div class="label-col">
              <span class="row-label">Game Rating</span>
            </div>
            <div class="player-col">
              <div class="stat-badge" :class="players.white.isWinner ? 'badge-winner' : 'badge-default'">
                {{ players.white.rating }}
              </div>
            </div>
            <div class="player-col">
              <div class="stat-badge" :class="players.black.isWinner ? 'badge-winner' : 'badge-default'">
                {{ players.black.rating }}
              </div>
            </div>
          </div>
        </div>

        <div class="divider" />

        <!-- Classification counts -->
        <div class="classification-grid">
          <div
            v-for="key in OVERVIEW_CLASSIFICATIONS"
            :key="key"
            class="classification-row"
          >
            <div class="label-col">
              <span class="row-label">{{ MOVE_CLASSIFICATIONS[key].label }}</span>
            </div>
            <div class="count-col">
              <span class="count-value" :style="{ color: `var(--color-classification-${key})` }">
                {{ classificationCounts.white[key] || 0 }}
              </span>
              <div class="count-icon">
                <cc-icon
                  :name="MOVE_CLASSIFICATIONS[key].icon"
                  variant="color"
                  :size="24"
                />
              </div>
            </div>
            <div class="count-col">
              <span class="count-value" :style="{ color: `var(--color-classification-${key})` }">
                {{ classificationCounts.black[key] || 0 }}
              </span>
            </div>
          </div>
          <div class="chevron-row">
            <CcIcon name="arrow-chevron-bottom" :size="20" />
          </div>
        </div>

        <div class="divider" />

        <!-- Advanced Stats -->
        <div class="advanced-stats">
          <div class="advanced-heading">Advanced Stats</div>
          <div class="advanced-grid">
            <div
              v-for="stat in advancedStats"
              :key="stat.label"
              class="advanced-row"
            >
              <div class="label-col">
                <span class="row-label">{{ stat.label }}</span>
              </div>
              <div class="stat-icon-col">
                <cc-icon :name="stat.icon" variant="color" :size="18" />
              </div>
              <div class="rating-col">
                <span class="rating-value">{{ stat.rating }}</span>
                <span class="rating-change" :class="stat.change >= 0 ? 'change-up' : 'change-down'">
                  <CcIcon
                    :name="stat.change >= 0 ? 'arrow-line-top-3' : 'arrow-line-down-3'"
                    :size="12"
                  />
                  {{ Math.abs(stat.change) }}
                </span>
              </div>
            </div>
          </div>
          <CcButton variant="ghost" :icon="{ name: 'graph-bars-hollow-3' }" class="view-stats-btn">
            View All Stats
          </CcButton>
        </div>
      </div>
    </div>

    <!-- Pinned bottom buttons -->
    <div class="overview-bottom">
      <CcButton variant="secondary" size="large" :icon="{ name: timeControl.icon }" class="time-control-btn">
        {{ timeControl.label }}
      </CcButton>
      <CcButton variant="primary" size="large" class="start-review-btn" @click="emit('start-review')">
        Start Review
      </CcButton>
    </div>
  </div>
</template>

<style scoped>
.overview-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.overview-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: clip;
  display: flex;
  flex-direction: column;
  gap: var(--space-16, 16px);
  padding: 0 var(--space-24, 24px) var(--space-8, 8px);
}

.overview-eval-graph {
  flex-shrink: 0;
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.05));
  border-radius: var(--radius-l, 5px);
}

/* Stats section */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-16, 16px);
}

.stats-grid,
.classification-grid,
.advanced-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.stats-grid {
  gap: var(--space-12, 12px);
}

.stats-row,
.classification-row,
.advanced-row {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.header-row {
  min-height: 24px;
}

.players-row {
  min-height: 64px;
}

/* 3-column layout */
.label-col {
  flex: 1;
  min-width: 72px;
  overflow: hidden;
}

.player-col {
  flex: 1;
  min-width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12, 12px);
}

.count-col {
  flex: 1;
  min-width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stat-icon-col {
  flex: 1;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rating-col {
  flex: 1;
  min-width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4, 4px);
}

/* Text styles */
.player-name {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--color-text-boldest, white);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.row-label {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--color-text-boldest, white);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Avatar */
.avatar-frame {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-m, 3px);
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-frame.winner {
  border: 4px solid var(--color-border-win, #81b64c);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Stat badges */
.stat-badge {
  width: 64px;
  padding: var(--space-8, 8px);
  border-radius: var(--radius-l, 5px);
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  font-feature-settings: 'lnum' 1, 'tnum' 1;
}

.badge-winner {
  background: var(--color-neutrals-white, white);
  color: var(--color-text-inverse, #312e2b);
}

.badge-default {
  background: var(--color-transparent-white-5, rgba(255, 255, 255, 0.05));
  color: var(--color-text-boldest, white);
}

/* Divider */
.divider {
  height: 1px;
  background: var(--color-border-default, rgba(255, 255, 255, 0.08));
  flex-shrink: 0;
}

/* Classification counts */
.count-value {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  text-align: center;
  font-feature-settings: 'lnum' 1, 'tnum' 1;
}

.count-icon {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.chevron-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  color: var(--color-icon-default, rgba(255, 255, 255, 0.72));
}

/* Advanced Stats */
.advanced-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advanced-heading {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 800;
  line-height: 20px;
  color: var(--color-text-boldest, white);
  padding: 4px 0;
  font-feature-settings: 'liga' 0;
  text-align: center;
}

.rating-value {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-boldest, white);
  font-feature-settings: 'lnum' 1, 'tnum' 1;
}

.rating-change {
  display: flex;
  align-items: center;
  gap: var(--space-4, 4px);
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  font-feature-settings: 'lnum' 1, 'tnum' 1;
}

.change-up {
  color: var(--color-text-win, #81b64c);
}

.change-down {
  color: var(--color-text-loss, #fa412d);
}

.view-stats-btn {
  width: 100%;
}

/* Bottom buttons */
.overview-bottom {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  padding: var(--space-4, 4px) var(--space-24, 24px) var(--space-24, 24px);
  flex-shrink: 0;
}

.time-control-btn {
  width: 100%;
}

.start-review-btn {
  width: 100%;
  height: 64px;
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 800;
  line-height: 28px;
}

/* Responsive overrides are applied by parent panel class */
</style>
