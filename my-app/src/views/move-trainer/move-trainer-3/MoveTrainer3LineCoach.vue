<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import davidCoachAvatarUrl from '@move-trainer/assets/coaches/coach-david.png?url'
import {
  MOVE_TRAINER_3_INTRO_COACH_MESSAGE,
  MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE,
  coachHeaderIcon,
  coachHeaderText,
  coachEvalText,
  coachWhiteAdvantage,
  coachTurnStripText,
  coachPlayMoveLeadBold,
  coachPlayMoveTurnLabel,
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

const coachBodyMessage = computed(() =>
  isPlayMoveLayout.value ? MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE : MOVE_TRAINER_3_INTRO_COACH_MESSAGE,
)
</script>

<template>
  <div class="move-trainer-3-intro-stack">
    <div
      class="move-trainer-3-coach"
      :class="{ 'move-trainer-3-coach--play-move-fill': isPlayMoveLayout }"
    >
      <CoachBubble
        :coach-avatar-src="davidCoachAvatarUrl"
        :header-icon="coachHeaderIcon"
        :header-text="coachHeaderText"
        :eval-text="coachEvalText"
        :white-advantage="coachWhiteAdvantage"
        :message="coachBodyMessage"
        :coach-avatar-icon-px="coachAvatarIconPx"
        :turn-strip-text="coachTurnStripText"
        :intro-combined-lead-bold="isPlayMoveLayout ? coachPlayMoveLeadBold : ''"
        :intro-combined-turn-strip-regular="isPlayMoveLayout ? coachPlayMoveTurnLabel : ''"
        :show-tip="true"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        :fill-available-height="isPlayMoveLayout"
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

/* Play Move: fill panel main above footer; CoachBubble handles inner scroll + fade gradients */
.move-trainer-3-coach--play-move-fill {
  flex: 1 1 0;
  min-height: 0;
  flex-shrink: 1;
}

.move-trainer-3-coach--play-move-fill :deep(.coach-container.coach-container--fill-available) {
  flex: 1 1 0;
  min-height: 0;
}

.move-trainer-3-coach--play-move-fill :deep(.coach-avatar) {
  align-self: flex-start;
}

.move-trainer-3-coach :deep(.tip) {
  height: 33px;
}

/*
 * Same top inset for the white bubble on intro + Play Move (fill layout defaulted to 8px).
 * Keeps one consistent “start line” for the speech bubble regardless of height mode.
 */
.move-trainer-3-coach :deep(.bubble-wrapper.bubble-wrapper--informational-single) {
  margin-top: 16px;
  margin-bottom: 0;
}

/* Intro only: hug-height bubble + DS max-height cap for short copy */
.move-trainer-3-coach:not(.move-trainer-3-coach--play-move-fill) :deep(.bubble-content) {
  min-height: 64px;
}

.move-trainer-3-coach:not(.move-trainer-3-coach--play-move-fill)
  :deep(.coach-container--single-bubble-hug .bubble-content.bubble-content--informational-message) {
  min-height: 64px;
  justify-content: center;
}

/* Play Move: softer bottom fade when copy scrolls (pseudo sits above panel — see CoachBubble z-index). */
.move-trainer-3-coach--play-move-fill :deep(.bubble--informational-single::after) {
  height: 3.25rem;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0.48) 46%,
    rgba(255, 255, 255, 0) 100%
  );
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
