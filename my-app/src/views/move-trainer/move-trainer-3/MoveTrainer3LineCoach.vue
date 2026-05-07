<script setup>
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import MoveListHeader from '@move-trainer/components/MoveListHeader.vue'
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
</script>

<template>
  <div class="move-trainer-3-line-header">
    <MoveListHeader
      :title="lineHeaderTitle"
      :prev-disabled="moveTrainerLineNav.prevDisabled"
      :next-disabled="moveTrainerLineNav.nextDisabled"
    />
  </div>
  <div class="move-trainer-3-coach">
    <CoachBubble
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
</template>

<style scoped>
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
  /* CoachBubble `.tip` uses `top: var(--coach-tip-top, 50px)` — align tip to MT3 spec (20px). */
  --coach-tip-top: 20px;
}

.move-trainer-3-coach :deep(.tip) {
  height: 33px;
}

/* MT3-only: reduce minimum bubble height per spec */
.move-trainer-3-coach :deep(.bubble-content) {
  min-height: 64px;
}

/* CoachBubble “single-bubble-hug” informational variant explicitly drops min-height to 0 — override for MT3. */
.move-trainer-3-coach :deep(.coach-container--single-bubble-hug .bubble-content.bubble-content--informational-message) {
  min-height: 64px;
  justify-content: center;
}

/* When intro uses `start-position`, CoachBubble anchors the tip with `bottom`; override to match same offsets. */
.move-trainer-3-coach :deep(.coach-container.start-position .tip) {
  top: 20px;
  bottom: auto;
}
</style>
