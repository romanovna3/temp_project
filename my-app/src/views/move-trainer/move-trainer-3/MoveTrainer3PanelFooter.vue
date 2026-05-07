<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CcButton, CcIcon, CcProgressBar } from '@chesscom/design-system'
import PanelFooterV10 from '@move-trainer/components/PanelFooterV10.vue'
import {
  footerNavBackDisabled,
  footerNavForwardDisabled,
  goBack,
  goForward,
  toggleVideoToolbar,
  requestMoveTrainer3StartLearning,
  moveTrainer3StartLearningNonce,
  moveTrainer3BlackMovesCompleted,
  moveTrainer3BlackMovesTotal,
} from './moveTrainer3IntroStore.js'

const route = useRoute()

const isPlayMoveLayout = computed(() => {
  const p = route.path
  if (p === '/move-trainer/move-trainer-3/play-move') return true
  try {
    return decodeURIComponent(p) === '/move-trainer/move-trainer-3/play-move'
  } catch {
    return false
  }
})

function onStartLearning() {
  requestMoveTrainer3StartLearning()
}

function onHint() {
  /* Placeholder — Play Move hint flow TBD */
}
</script>

<template>
  <PanelFooterV10 class="move-trainer-3-panel-footer-v10">
    <template #actions>
      <div class="move-trainer-3-footer-actions-stack">
        <div
          v-if="moveTrainer3StartLearningNonce > 0 && isPlayMoveLayout"
          class="mt3-learn-progress-slot footer-progress-bar-wrap"
        >
          <CcProgressBar
            v-if="moveTrainer3BlackMovesTotal > 0"
            :completed-steps="moveTrainer3BlackMovesCompleted"
            :total-step-count="moveTrainer3BlackMovesTotal"
            :is-change-animated="true"
          />
        </div>
        <div class="footer-buttons-row footer-buttons-row-split">
          <template v-if="isPlayMoveLayout">
            <CcButton
              variant="secondary"
              size="large"
              class="footer-btn-equal"
              disabled
              :icon="{ name: 'media-camera-video-on' }"
            >
              Video
            </CcButton>
            <CcButton
              variant="secondary"
              size="large"
              class="footer-btn-equal"
              :icon="{ name: 'device-bulb-glow', variant: 'glyph' }"
              @click="onHint"
            >
              Hint
            </CcButton>
          </template>
          <template v-else>
            <CcButton
              variant="secondary"
              size="large"
              class="footer-btn-equal"
              :icon="{ name: 'media-camera-video-on' }"
              @click="toggleVideoToolbar"
            >
              Video
            </CcButton>
            <CcButton
              variant="primary"
              size="large"
              class="footer-btn-equal"
              @click="onStartLearning"
            >
              Start Learning
            </CcButton>
          </template>
        </div>
      </div>
    </template>
    <template #toolbar>
      <div class="footer-icon-group">
        <button type="button" class="footer-icon-btn" aria-label="More options">
          <CcIcon name="mark-ellipsis-horizontal" variant="glyph" :size="20" class="footer-icon" />
        </button>
        <button type="button" class="footer-icon-btn" aria-label="Open line notes">
          <CcIcon name="document-book-open" variant="glyph" :size="20" class="footer-icon" />
        </button>
        <button type="button" class="footer-icon-btn" aria-label="Line information">
          <CcIcon name="circle-fill-info" variant="glyph" :size="20" class="footer-icon" />
        </button>
      </div>
      <div class="footer-icon-group">
        <button
          type="button"
          class="footer-icon-btn"
          aria-label="Previous move"
          :disabled="footerNavBackDisabled"
          @click="goBack"
        >
          <CcIcon name="arrow-chevron-left" variant="glyph" :size="20" class="footer-icon" />
        </button>
        <button
          type="button"
          class="footer-icon-btn"
          aria-label="Next move"
          :disabled="footerNavForwardDisabled"
          @click="goForward"
        >
          <CcIcon name="arrow-chevron-right" variant="glyph" :size="20" class="footer-icon" />
        </button>
      </div>
    </template>
  </PanelFooterV10>
</template>

<style scoped>
.move-trainer-3-panel-footer-v10 {
  width: 100%;
}

.move-trainer-3-footer-actions-stack {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
}

.footer-progress-bar-wrap {
  width: 100%;
  padding: 0 0 14px;
  box-sizing: border-box;
  flex-shrink: 0;
  background: unset;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

</style>

<!--
  Move Trainer 3 only — track tint + sizing for CcProgressBar (step-based API).
  Do not reuse for Move Trainer 2 assisted quiz or other footers (see .cursor/rules/footer-variants-isolation.mdc).
-->
<style>
.move-trainer-3-panel-footer-v10.panel-footer-v10-root .panel-footer-container {
  padding-top: 12px;
}

.mt3-learn-progress-slot.footer-progress-bar-wrap .cc-progress-bar-component {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  overflow: hidden;
}
</style>
