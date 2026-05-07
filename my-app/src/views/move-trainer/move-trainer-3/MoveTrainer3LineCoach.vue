<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import davidCoachAvatarUrl from '@move-trainer/assets/coaches/coach-david.png?url'
import {
  coachHeaderIcon,
  coachHeaderText,
  coachEvalText,
  coachWhiteAdvantage,
  coachMessage,
  coachTurnStripText,
  bubbleStartPosition,
  coachAvatarIconPx,
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
</script>

<template>
  <div class="move-trainer-3-intro-stack">
    <div class="move-trainer-3-coach">
      <CoachBubble
        :coach-avatar-src="davidCoachAvatarUrl"
        :header-icon="coachHeaderIcon"
        :header-text="coachHeaderText"
        :eval-text="coachEvalText"
        :white-advantage="coachWhiteAdvantage"
        :message="coachMessage"
        :coach-avatar-icon-px="coachAvatarIconPx"
        :turn-strip-text="coachTurnStripText"
        :show-tip="true"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        :fill-available-height="false"
        :start-position="bubbleStartPosition"
      />
    </div>

    <!-- Intro: default slot (move list) scrolls below the coach -->
    <div v-if="!isPlayMoveLayout" class="move-trainer-3-below-coach-scroll">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.move-trainer-3-intro-stack {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

.move-trainer-3-coach {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  padding: 8px 16px 16px 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  --coach-tip-top: 20px;
}

.move-trainer-3-coach :deep(.tip) {
  height: 33px;
}

.move-trainer-3-coach :deep(.bubble-content) {
  min-height: 64px;
}

.move-trainer-3-coach :deep(.coach-container--single-bubble-hug .bubble-content.bubble-content--informational-message) {
  min-height: 64px;
  justify-content: center;
}

/*
 * DS caps informational body at ~116px which forces inner scroll. MT3: grow with copy downward only;
 * max-height + footer clamp scroll comes later.
 */
.move-trainer-3-coach :deep(.bubble-content.bubble-content--informational-message) {
  max-height: none;
}

.move-trainer-3-coach :deep(.coach-container--single-bubble-hug .bubble-wrapper--informational-single) {
  margin-top: 16px;
  margin-bottom: 0;
}

.move-trainer-3-coach :deep(.coach-container.start-position .tip) {
  top: 20px;
  bottom: auto;
}

.move-trainer-3-below-coach-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: clip;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
