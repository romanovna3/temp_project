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
  moveTrainer3PathIsOpponentsMove,
  moveTrainer3OpponentsMoveStepFromPath,
  getMoveTrainer3OpponentsMoveCheckpoint,
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

const isOpponentsMoveLayout = computed(() => moveTrainer3PathIsOpponentsMove(route.path))

const opponentsMoveStep = computed(() => moveTrainer3OpponentsMoveStepFromPath(route.path))

const opponentsMoveCheckpoint = computed(() =>
  opponentsMoveStep.value ? getMoveTrainer3OpponentsMoveCheckpoint(opponentsMoveStep.value) : null,
)

const coachBodyMessage = computed(() =>
  isPlayMoveLayout.value ? MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE : MOVE_TRAINER_3_INTRO_COACH_MESSAGE,
)

/** OM variant 1: top bubble = White-move commentary; second bubble = next Black “Play …”. */
const showOmVariant1 = computed(
  () => isOpponentsMoveLayout.value && !!opponentsMoveCheckpoint.value?.whiteCommentary,
)

const omPlaceholderMessage = 'This opponent-move step is not configured yet.'
</script>

<template>
  <div class="move-trainer-3-intro-stack">
    <!-- Opponents Move (checkpoint copy); variant 1 = stacked bubbles -->
    <div v-if="showOmVariant1" class="move-trainer-3-coach move-trainer-3-coach--om-v1">
      <CoachBubble
        class="mt3-om-commentary-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :message="opponentsMoveCheckpoint.whiteCommentary"
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :fill-available-height="false"
        :start-position="false"
      />
      <CoachBubble
        class="mt3-om-play-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        message=""
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="false"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        :intro-combined-lead-bold="opponentsMoveCheckpoint.nextBlackLeadBold"
        :intro-combined-turn-strip-regular="opponentsMoveCheckpoint.nextBlackTurnStrip"
        :fill-available-height="false"
        :start-position="false"
      />
    </div>

    <div v-else-if="isOpponentsMoveLayout" class="move-trainer-3-coach move-trainer-3-coach--om-v1">
      <CoachBubble
        class="mt3-om-commentary-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :message="omPlaceholderMessage"
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :fill-available-height="false"
        :start-position="false"
      />
    </div>

    <div
      v-else
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
    <div
      v-if="!isPlayMoveLayout && !isOpponentsMoveLayout"
      class="move-trainer-3-below-coach-scroll"
    >
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

.move-trainer-3-coach--om-v1 {
  /* Keep inset parity with intro / Play Move (do not tighten top padding — reads as whole panel “jumped up”). */
  gap: 10px;
}

/*
 * OM variant 1 — CoachBubble reserves ~116px row / panel min-heights for other flows.
 * Without overrides the commentary bubble uses `bubble--has-scroll-panel` min-height 116px and looks empty.
 */
.move-trainer-3-coach--om-v1 :deep(.coach-container) {
  height: auto;
  min-height: 0;
  margin-bottom: 0;
}

.move-trainer-3-coach--om-v1 :deep(.bubble--has-scroll-panel) {
  min-height: 0;
  flex: 0 0 auto;
}

.move-trainer-3-coach--om-v1 :deep(.bubble--has-scroll-panel .bubble-scroll-panel) {
  flex: 0 0 auto;
  align-items: flex-start;
}

/*
 * Commentary bubble uses the generic single-bubble branch (`bubble--has-scroll-panel`), which applies
 * min-height 96px + justify-content: center when there is no header — looks vertically “off”.
 */
.move-trainer-3-coach--om-v1 :deep(.bubble--has-scroll-panel .bubble-content:not(.bubble-content--informational-message)) {
  min-height: 0;
  max-height: none;
  flex: 0 1 auto;
  justify-content: flex-start;
}

.move-trainer-3-coach--om-v1 :deep(.coach-container--informational-single) {
  min-height: 0;
}

.move-trainer-3-coach--om-v1 :deep(.bubble-wrapper--informational-single) {
  min-height: 0;
}

.move-trainer-3-coach--om-v1 :deep(.bubble-content.bubble-content--informational-message) {
  min-height: 0 !important;
  max-height: none;
}

/*
 * Commentary row: generic bubble sits beside an 80px avatar — align bubble + tip to the avatar row
 * (same intent as CoachBubble `start-position`) while OM `:deep()` rules keep copy height hugged.
 */
.move-trainer-3-coach--om-v1 .mt3-om-commentary-coach {
  --coach-tip-bottom: 10px;
}

.move-trainer-3-coach--om-v1 .mt3-om-commentary-coach :deep(.bubble-wrapper) {
  margin-top: 0;
  min-height: var(--coach-avatar-size, 80px);
  align-items: flex-end;
}

.move-trainer-3-coach--om-v1 .mt3-om-commentary-coach :deep(.tip) {
  top: auto;
  bottom: var(--coach-tip-bottom, 10px);
  /* Parent `.move-trainer-3-coach` forces 33px tip height — breaks SVG proportion & attachment point. */
  height: 22px;
  width: 14px;
}

/* Second bubble: hide duplicate avatar; align wrapper with first bubble (wrapper uses margin-left -6px on avatar row). */
.mt3-om-play-coach :deep(.coach-avatar) {
  display: none;
}

.mt3-om-play-coach :deep(.bubble-wrapper.bubble-wrapper--informational-single) {
  margin-top: 0;
  margin-left: calc(var(--coach-avatar-size, 80px) - 6px);
}

/*
 * Play Move: hug bubble height to content when shorter than the panel; cap at panel height
 * and scroll inside when copy exceeds the window (CoachBubble fill-available + max-height chain).
 */
.move-trainer-3-coach--play-move-fill {
  flex: 0 1 auto;
  min-height: 0;
  max-height: 100%;
  width: 100%;
}

.move-trainer-3-coach--play-move-fill :deep(.coach-container.coach-container--fill-available) {
  flex: 0 1 auto;
  min-height: 0;
  max-height: 100%;
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
 * Opponents Move (--om-v1) sets its own offsets — do not apply here.
 */
.move-trainer-3-coach:not(.move-trainer-3-coach--om-v1)
  :deep(.bubble-wrapper.bubble-wrapper--informational-single) {
  margin-top: 16px;
  margin-bottom: 0;
}

/* Intro only (not OM): hug-height bubble + DS max-height cap for short copy */
.move-trainer-3-coach:not(.move-trainer-3-coach--play-move-fill):not(.move-trainer-3-coach--om-v1)
  :deep(.bubble-content) {
  min-height: 64px;
}

.move-trainer-3-coach:not(.move-trainer-3-coach--play-move-fill):not(.move-trainer-3-coach--om-v1)
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
