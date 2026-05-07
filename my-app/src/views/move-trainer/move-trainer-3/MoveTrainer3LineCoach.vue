<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import MoveListHeader from '@move-trainer/components/MoveListHeader.vue'
import davidCoachAvatarUrl from '@move-trainer/assets/coaches/coach-david.png?url'
import {
  lineHeaderTitle,
  moveTrainerLineNav,
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

    <!-- Intro: line header + default slot (move list) scroll together below the coach -->
    <div v-if="!isPlayMoveLayout" class="move-trainer-3-below-coach-scroll">
      <div class="move-trainer-3-line-header">
        <MoveListHeader
          :title="lineHeaderTitle"
          :prev-disabled="moveTrainerLineNav.prevDisabled"
          :next-disabled="moveTrainerLineNav.nextDisabled"
        />
      </div>
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

.move-trainer-3-line-header {
  flex-shrink: 0;
  width: 100%;
}

/* Move Trainer 3 / Opening panel: 45px band, centered row, default header vertical padding (8px). */
.move-trainer-3-line-header :deep(.move-list-header) {
  box-sizing: border-box;
  height: 45px;
  min-height: 45px;
  justify-content: center;
  align-items: center;
  margin-top: 0;
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
