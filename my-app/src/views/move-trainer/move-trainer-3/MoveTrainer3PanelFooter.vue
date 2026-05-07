<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { CcButton, CcIcon } from '@chesscom/design-system'
import PanelFooterV10 from '@move-trainer/components/PanelFooterV10.vue'
import {
  footerNavBackDisabled,
  footerNavForwardDisabled,
  goBack,
  goForward,
  toggleVideoToolbar,
  requestMoveTrainer3StartLearning,
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
</style>
