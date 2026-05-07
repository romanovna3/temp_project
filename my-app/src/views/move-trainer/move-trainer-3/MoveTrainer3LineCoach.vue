<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import davidCoachAvatarUrl from '@move-trainer/assets/coaches/coach-david.png?url'
import {
  MOVE_TRAINER_3_INTRO_COACH_MESSAGE,
  coachHeaderIcon,
  coachHeaderText,
  coachEvalText,
  coachWhiteAdvantage,
  coachTurnStripText,
  coachPlayMoveLeadBold,
  coachPlayMoveTurnLabel,
  coachSelectedPlyCommentary,
  bubbleStartPosition,
  coachAvatarIconPx,
  moveTrainer3PathIsOpponentsMove,
  moveTrainer3OpponentsMoveStepFromPath,
  getMoveTrainer3OpponentsMoveCheckpoint,
  moveTrainer3CoachReplayScrubbing,
  moveTrainer3OmAuthorNoteStep,
  moveTrainer3AllPlies,
  currentPly,
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

const introCoachBubbleMessage = computed(() => MOVE_TRAINER_3_INTRO_COACH_MESSAGE)

/** Unified replay coach — footer scrub before unlocked tip only (live progression unchanged). */
const showMt3ReplayCoachPreview = computed(
  () =>
    moveTrainer3CoachReplayScrubbing.value &&
    (isPlayMoveLayout.value || isOpponentsMoveLayout.value),
)

const mt3ReplayPreviewHalfMove = computed(() => {
  const idx = currentPly.value - 1
  if (idx < 0) return null
  return moveTrainer3AllPlies.value[idx] ?? null
})

const mt3ReplayPreviewLeadBold = computed(() => {
  const ply = mt3ReplayPreviewHalfMove.value
  if (!ply?.san) return 'Review'
  return ply.color === 'white' ? `${ply.moveNum}.${ply.san}` : `${ply.moveNum}... ${ply.san}`
})

const mt3ReplayPreviewMessage = computed(() => {
  const ply = mt3ReplayPreviewHalfMove.value
  if (!ply?.san) return ''
  // Replay: notation-only chip — no body under 1.d4 / 1...c5
  if (ply.color === 'white' && ply.moveNum === 1 && ply.san === 'd4') return ''
  if (ply.color === 'black' && ply.moveNum === 1 && ply.san === 'c5') return ''
  const t = coachSelectedPlyCommentary.value
  return t || 'No coach note for this move.'
})

/** Play Move live tip: heading-only “Play …” — replay narration lives in `showMt3ReplayCoachPreview`. */
const playMoveCoachBubbleMessage = computed(() =>
  isPlayMoveLayout.value ? '' : introCoachBubbleMessage.value,
)

/** OM v1 live tip: designer checkpoint commentary (replay uses preview branch + line `coachText`). */
const omVariant1TopBubbleMessage = computed(() => opponentsMoveCheckpoint.value?.whiteCommentary ?? '')

/** OM v1: dynamic “Play …” when Black to move; checkpoint fallback during scripted White etc. */
const omVariant1PlayLeadBold = computed(
  () =>
    coachPlayMoveLeadBold.value ||
    opponentsMoveCheckpoint.value?.nextBlackLeadBold ||
    '',
)

const omVariant1PlayTurnStrip = computed(
  () =>
    coachPlayMoveTurnLabel.value ||
    opponentsMoveCheckpoint.value?.nextBlackTurnStrip ||
    '',
)

/** OM variant 1: checkpoint defines this shell. */
const showOmVariant1 = computed(
  () => isOpponentsMoveLayout.value && !!opponentsMoveCheckpoint.value?.whiteCommentary,
)

/** Long author commentary after graded Black move — Video + Continue in footer; URL stays on same OM step. */
const showOmAuthorReading = computed(() => {
  if (!isOpponentsMoveLayout.value) return false
  const step = opponentsMoveStep.value
  if (!step || moveTrainer3OmAuthorNoteStep.value !== step) return false
  return !!(opponentsMoveCheckpoint.value?.afterBlackMoveAuthorNote)
})

const omPlaceholderMessage = 'This opponent-move step is not configured yet.'
</script>

<template>
  <div class="move-trainer-3-intro-stack">
    <!-- Replay scrub (footer chevrons behind furthest ply): one stable coach; route stays progress-anchored. -->
    <div v-if="showMt3ReplayCoachPreview" class="move-trainer-3-coach move-trainer-3-coach--mt3-replay-preview">
      <CoachBubble
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :message="mt3ReplayPreviewMessage"
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        :intro-combined-lead-bold="mt3ReplayPreviewLeadBold"
        :fill-available-height="false"
        :start-position="false"
      />
    </div>

    <!-- OM: author note after successful Black move (same route step; reading phase) -->
    <div v-else-if="showOmAuthorReading" class="move-trainer-3-coach move-trainer-3-coach--om-reading-fill">
      <CoachBubble
        class="mt3-om-reading-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :informational-single-bubble="true"
        :message="opponentsMoveCheckpoint.afterBlackMoveAuthorNote"
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :fill-available-height="true"
        :start-position="false"
      />
    </div>

    <!-- Opponents Move (checkpoint copy); variant 1 = stacked bubbles -->
    <div v-else-if="showOmVariant1" class="move-trainer-3-coach move-trainer-3-coach--om-v1">
      <CoachBubble
        class="mt3-om-commentary-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :message="omVariant1TopBubbleMessage"
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
        :intro-combined-lead-bold="omVariant1PlayLeadBold"
        :intro-combined-turn-strip-regular="omVariant1PlayTurnStrip"
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
        :message="playMoveCoachBubbleMessage"
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

/*
 * Replay scrub — hug-height bubble (no fill stretch).
 * Heading-only moves (e.g. 1.d4): white bubble exactly 64px; notation vertically centered.
 * Moves with body copy: ≥64px message band below heading (see :not(heading-only) rules).
 */
.move-trainer-3-coach--mt3-replay-preview :deep(.bubble-wrapper--informational-single) {
  min-height: 0;
}

/* Single-line move chip — collapse empty body slot; pin bubble + scroll panel to 64px */
.move-trainer-3-coach--mt3-replay-preview :deep(.bubble--informational-single:has(.bubble-content--informational-heading-only)) {
  --coach-tip-top: 21px;
  min-height: 64px;
  height: 64px;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(.bubble-scroll-panel--informational:has(.bubble-content--informational-heading-only)) {
  min-height: 64px;
  height: 64px;
  flex: 0 0 auto;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(.bubble-informational-inner:has(.bubble-content--informational-heading-only)) {
  min-height: 64px;
  height: 64px;
  flex: 0 0 auto;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-informational-inner:has(.bubble-content--informational-heading-only) .coach-intro-combined-heading
  ) {
  flex: 1 1 auto;
  min-height: 64px;
  height: 64px;
  max-height: 64px;
  padding: 0 var(--space-16, 16px);
  margin: 0;
  box-sizing: border-box;
  justify-content: center;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-informational-inner:has(.bubble-content--informational-heading-only)
      .bubble-content.bubble-content--informational-heading-only
  ) {
  display: none !important;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .coach-container--single-bubble-hug .bubble-wrapper--informational-single:has(.bubble-content--informational-heading-only)
  ) {
  align-self: flex-start;
}

.move-trainer-3-coach--mt3-replay-preview :deep(.coach-intro-combined-heading__lead) {
  margin: 0;
  line-height: 1.2;
}

/* Move line only — heading sits above visible body copy */
.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-informational-inner:has(
        .bubble-content.bubble-content--informational-below-heading:not(.bubble-content--informational-heading-only)
      )
      .coach-intro-combined-heading
  ) {
  min-height: 64px;
  justify-content: center;
  padding-bottom: var(--space-6, 6px);
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-content.bubble-content--informational-message.bubble-content--informational-below-heading:not(
        .bubble-content--informational-heading-only
      )
  ) {
  min-height: 64px;
  max-height: none;
  flex: 0 0 auto;
  padding-top: var(--space-8, 8px);
  padding-bottom: var(--space-8, 8px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.move-trainer-3-coach--mt3-replay-preview :deep(.bubble-content--informational-message .coach-message) {
  margin: 0;
}

.move-trainer-3-coach--mt3-replay-preview :deep(.coach-avatar) {
  align-self: center;
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

/* OM author-reading — same fill + scroll behavior as Play Move long bubble */
.move-trainer-3-coach--om-reading-fill {
  flex: 0 1 auto;
  min-height: 0;
  max-height: 100%;
  width: 100%;
}

.move-trainer-3-coach--om-reading-fill :deep(.coach-container.coach-container--fill-available) {
  flex: 0 1 auto;
  min-height: 0;
  max-height: 100%;
}

.move-trainer-3-coach--om-reading-fill :deep(.coach-avatar) {
  align-self: flex-start;
}

.mt3-om-reading-coach :deep(.coach-message),
.mt3-om-reading-coach :deep(.bubble-content--informational-message) {
  white-space: pre-wrap;
}

.move-trainer-3-coach--om-reading-fill :deep(.bubble--informational-single::after) {
  height: 3.25rem;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0.48) 46%,
    rgba(255, 255, 255, 0) 100%
  );
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
.move-trainer-3-coach:not(.move-trainer-3-coach--play-move-fill):not(.move-trainer-3-coach--om-reading-fill):not(
    .move-trainer-3-coach--om-v1
  )
  :deep(.bubble-content) {
  min-height: 64px;
}

.move-trainer-3-coach:not(.move-trainer-3-coach--play-move-fill):not(.move-trainer-3-coach--om-reading-fill):not(
    .move-trainer-3-coach--om-v1
  )
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
