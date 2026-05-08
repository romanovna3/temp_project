<script setup>
import { computed, watch } from 'vue'
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
  coachReplayHalfMoveBody,
  bubbleStartPosition,
  coachAvatarIconPx,
  moveTrainer3PathIsOpponentsMove,
  moveTrainer3OpponentsMoveStepFromPath,
  getMoveTrainer3OpponentsMoveCheckpoint,
  moveTrainer3CoachReplayScrubbing,
  moveTrainer3OmAuthorNoteStep,
  moveTrainer3CheckpointHasPostBlackAuthorNote,
  moveTrainer3OmReadingSelectedChipPly,
  setMoveTrainer3OmReadingChipPly,
  moveTrainer3AllPlies,
  currentPly,
  moveTrainer3OmChapterOverflows,
  moveTrainer3OmChapterPhase,
  resetMoveTrainer3OmChapterPhase,
  applyMoveTrainer3OmChapterOverflowMeasure,
  clearMoveTrainer3OmReadingBoardBranch,
  moveTrainer3OmPostAuthorChain,
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
  /** Starting board (ply 0): show White’s first move as the next main-line step — same notation as replay chips. */
  if (currentPly.value === 0) {
    const first = moveTrainer3AllPlies.value[0]
    if (first?.san && first.color === 'white' && typeof first.moveNum === 'number') {
      return `${first.moveNum}.${first.san}`
    }
    return '1.d4'
  }
  const ply = mt3ReplayPreviewHalfMove.value
  if (!ply?.san) return 'Review'
  return ply.color === 'white' ? `${ply.moveNum}.${ply.san}` : `${ply.moveNum}... ${ply.san}`
})

const mt3ReplayPreviewMessage = computed(() => {
  if (currentPly.value === 0) return ''
  const ply = mt3ReplayPreviewHalfMove.value
  if (!ply?.san) return ''
  // Heading-only chips — must stay empty (do not fall through to “No coach note…”).
  if (ply.color === 'white' && ply.moveNum === 1 && ply.san === 'd4') return ''
  if (ply.color === 'black' && ply.moveNum === 1 && ply.san === 'c5') return ''
  return coachReplayHalfMoveBody.value
})

/** Play Move live tip: heading-only “Play …” — replay narration lives in `showMt3ReplayCoachPreview`. */
const playMoveCoachBubbleMessage = computed(() =>
  isPlayMoveLayout.value ? '' : introCoachBubbleMessage.value,
)

/** Scripted White after author **Continue** — OM shell briefly survives route swap; hide OM copy/strip (OpeningCourses jumps to `/play-move` first for **Nc3**). */
const suppressOmCoachDuringPostAuthorWhite = computed(
  () => !!moveTrainer3OmPostAuthorChain.value?.playWhiteSan && isOpponentsMoveLayout.value,
)

/** Play Move: avoid “No message” during White-to-move beats (scripted **Nc3** / similar). */
const mt3PlayMoveSuppressEmptyCombinedPlaceholder = computed(
  () =>
    isPlayMoveLayout.value
    && !coachPlayMoveLeadBold.value?.trim()
    && !coachPlayMoveTurnLabel.value?.trim()
    && !playMoveCoachBubbleMessage.value?.trim(),
)

/** OM v1 live tip: short `whiteCommentary` only (long chapter uses informational bubble below). */
const omVariant1TopBubbleMessage = computed(() =>
  suppressOmCoachDuringPostAuthorWhite.value ? '' : (opponentsMoveCheckpoint.value?.whiteCommentary ?? ''),
)

/** Live OM **before** reading phase: full chapter + rails (`readingLead`, not legacy author-note fallback). */
const omVariant1LiveChapterMessage = computed(() => {
  const cp = opponentsMoveCheckpoint.value
  if (!cp?.readingChapterLongForm) return ''
  const lead = typeof cp.readingLead === 'string' ? cp.readingLead.trim() : ''
  return lead
})

/** Informational scroll/dissolve bubble for chapter + clickable rails (same shell as OM author-reading). */
const omVariant1UsesInformationalChapter = computed(() => {
  const cp = opponentsMoveCheckpoint.value
  if (!cp?.readingChapterLongForm) return false
  return !!(
    omVariant1LiveChapterMessage.value
    || (Array.isArray(cp.readingSegmentRails) && cp.readingSegmentRails.some((r) => Array.isArray(r) && r.length))
  )
})

/** Chapter overflows viewport → two-phase (read + Continue, then Play strip only). */
const omLiveChapterNeedsTwoPhase = computed(
  () => omVariant1UsesInformationalChapter.value && moveTrainer3OmChapterOverflows.value === true,
)

/** Full chapter bubble: hidden during overflow **instruction** phase (Play strip only). */
const showOmLiveChapterBubble = computed(() => {
  if (!omVariant1UsesInformationalChapter.value) return false
  if (!omLiveChapterNeedsTwoPhase.value) return true
  return moveTrainer3OmChapterPhase.value === 'read'
})

/** Play strip: hidden until overflow measured when chapter checkpoint (avoid flash); instruction phase after Continue when overflowed; always when chapter fits one screen. */
const showOmPlayStripOnOmV1 = computed(() => {
  if (!showOmVariant1.value) return false
  if (suppressOmCoachDuringPostAuthorWhite.value) return false
  if (!omVariant1UsesInformationalChapter.value) return true
  if (moveTrainer3OmChapterOverflows.value === null) return false
  if (!omLiveChapterNeedsTwoPhase.value) return true
  return moveTrainer3OmChapterPhase.value === 'instruction'
})

/** Fill-height chapter shell only while the long bubble is visible (instruction phase = compact Play strip). */
const omV1LiveChapterLayoutStretch = computed(
  () =>
    omVariant1UsesInformationalChapter.value
    && (!omLiveChapterNeedsTwoPhase.value || moveTrainer3OmChapterPhase.value === 'read'),
)

/** After Continue on overflowed chapter: Play strip only — stretch shell so the bubble fills above footer (no stray commentary row). */
const omV1InstructionPhaseFill = computed(
  () =>
    omVariant1UsesInformationalChapter.value
    && omLiveChapterNeedsTwoPhase.value
    && moveTrainer3OmChapterPhase.value === 'instruction',
)

function onSelectOmReadingChipPly(ply) {
  setMoveTrainer3OmReadingChipPly(ply, opponentsMoveStep.value)
}

function onOmChapterInformationalOverflow(overflows) {
  if (!omVariant1UsesInformationalChapter.value) return
  applyMoveTrainer3OmChapterOverflowMeasure(overflows)
}

watch(opponentsMoveStep, () => {
  resetMoveTrainer3OmChapterPhase()
  clearMoveTrainer3OmReadingBoardBranch()
})

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

/** OM variant 1: short White tip and/or long chapter (`readingChapterLongForm`) before reading phase. */
const showOmVariant1 = computed(() => {
  if (!isOpponentsMoveLayout.value) return false
  const cp = opponentsMoveCheckpoint.value
  if (!cp) return false
  if (typeof cp.whiteCommentary === 'string' && cp.whiteCommentary.trim()) return true
  if (
    cp.readingChapterLongForm
    && ((typeof cp.readingLead === 'string' && cp.readingLead.trim())
      || (Array.isArray(cp.readingSegmentRails)
        && cp.readingSegmentRails.some((r) => Array.isArray(r) && r.length)))
  )
    return true
  return false
})

/** Long author commentary after graded Black move — Video + Continue in footer; URL stays on same OM step. */
const showOmAuthorReading = computed(() => {
  if (!isOpponentsMoveLayout.value) return false
  const step = opponentsMoveStep.value
  if (!step || moveTrainer3OmAuthorNoteStep.value !== step) return false
  return moveTrainer3CheckpointHasPostBlackAuthorNote(opponentsMoveCheckpoint.value)
})

/** Plain lead (`readingLead` or legacy `afterBlackMoveAuthorNote`). */
const omAuthorReadingLead = computed(() => {
  const cp = opponentsMoveCheckpoint.value
  if (!cp) return ''
  const lead = typeof cp.readingLead === 'string' ? cp.readingLead.trim() : ''
  if (lead) return lead
  return typeof cp.afterBlackMoveAuthorNote === 'string' ? cp.afterBlackMoveAuthorNote.trim() : ''
})

/** Multiple left-rail blocks (long OM chapter); takes precedence over single `readingSegments`. */
const omAuthorReadingSegmentRails = computed(() => {
  const rails = opponentsMoveCheckpoint.value?.readingSegmentRails
  if (!Array.isArray(rails)) return undefined
  return rails.some((r) => Array.isArray(r) && r.length) ? rails : undefined
})

/** Rich inline moves — null when using segment rails or legacy plain note only. */
const omAuthorReadingSegments = computed(() => {
  if (omAuthorReadingSegmentRails.value) return undefined
  const segs = opponentsMoveCheckpoint.value?.readingSegments
  return Array.isArray(segs) && segs.length ? segs : undefined
})

const omAuthorReadingChapterLongForm = computed(
  () => !!opponentsMoveCheckpoint.value?.readingChapterLongForm,
)

const omPlaceholderMessage = 'This opponent-move step is not configured yet.'

/** Bound OM column height so long informational bubbles scroll inside (fade dissolves + thumb rail). */
/** OM-7 after **…g6**: author note + second row — same **Play move** combined-bubble variant as `/play-move` (copy TBD). */
const showOm7PlayMoveUnderAuthorReading = computed(
  () => showOmAuthorReading.value && opponentsMoveStep.value === 7,
)

const omIntroStackChapterScrollClamp = computed(
  () =>
    (showOmVariant1.value
      && omVariant1UsesInformationalChapter.value
      && !omV1InstructionPhaseFill.value)
    || (showOmAuthorReading.value && omAuthorReadingChapterLongForm.value),
)
</script>

<template>
  <div
    class="move-trainer-3-intro-stack"
    :class="{ 'move-trainer-3-intro-stack--om-chapter-scroll-clamp': omIntroStackChapterScrollClamp }"
  >
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
    <div
      v-else-if="showOmAuthorReading && showOm7PlayMoveUnderAuthorReading"
      class="move-trainer-3-coach move-trainer-3-coach--om-author-reading-with-play"
    >
      <div
        class="move-trainer-3-coach move-trainer-3-coach--om-reading-fill"
        :class="{ 'move-trainer-3-coach--om-reading-long': omAuthorReadingChapterLongForm }"
      >
        <CoachBubble
          class="mt3-om-reading-coach"
          :coach-avatar-src="davidCoachAvatarUrl"
          header-icon=""
          header-text=""
          eval-text=""
          :white-advantage="true"
          :informational-single-bubble="true"
          :message="omAuthorReadingLead"
          :informational-segments="omAuthorReadingSegments"
          :informational-segment-rails="omAuthorReadingSegmentRails"
          :informational-chapter-long-form="omAuthorReadingChapterLongForm"
          :informational-active-ply="moveTrainer3OmReadingSelectedChipPly"
          :coach-avatar-icon-px="coachAvatarIconPx"
          turn-strip-text=""
          :show-tip="true"
          :typewriter="false"
          :fill-available-height="true"
          :start-position="false"
          @select-informational-ply="onSelectOmReadingChipPly"
        />
      </div>
      <!-- Same shell as `/play-move` + OM play strip: heading-only until copy is finalized -->
      <CoachBubble
        class="mt3-om-play-coach mt3-om-play-coach--under-author-reading"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        message=""
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        intro-combined-lead-bold="Play move"
        intro-combined-turn-strip-regular=""
        :suppress-intro-combined-no-message-placeholder="true"
        :fill-available-height="false"
        :start-position="false"
      />
    </div>

    <div
      v-else-if="showOmAuthorReading"
      class="move-trainer-3-coach move-trainer-3-coach--om-reading-fill"
      :class="{ 'move-trainer-3-coach--om-reading-long': omAuthorReadingChapterLongForm }"
    >
      <CoachBubble
        class="mt3-om-reading-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :informational-single-bubble="true"
        :message="omAuthorReadingLead"
        :informational-segments="omAuthorReadingSegments"
        :informational-segment-rails="omAuthorReadingSegmentRails"
        :informational-chapter-long-form="omAuthorReadingChapterLongForm"
        :informational-active-ply="moveTrainer3OmReadingSelectedChipPly"
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :fill-available-height="true"
        :start-position="false"
        @select-informational-ply="onSelectOmReadingChipPly"
      />
    </div>

    <!-- Opponents Move (checkpoint copy); variant 1 = stacked bubbles -->
    <div
      v-else-if="showOmVariant1"
      class="move-trainer-3-coach move-trainer-3-coach--om-v1"
      :class="{
        'move-trainer-3-coach--om-v1-live-chapter': omV1LiveChapterLayoutStretch,
        'move-trainer-3-coach--play-move-fill': omV1InstructionPhaseFill,
      }"
    >
      <CoachBubble
        v-if="showOmLiveChapterBubble"
        class="mt3-om-commentary-coach mt3-om-live-chapter-coach"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        :informational-single-bubble="true"
        :fill-available-height="true"
        :message="omVariant1LiveChapterMessage"
        :informational-segment-rails="omAuthorReadingSegmentRails"
        :informational-chapter-long-form="true"
        :report-informational-overflow="true"
        :informational-active-ply="moveTrainer3OmReadingSelectedChipPly"
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="true"
        :typewriter="false"
        :start-position="false"
        @select-informational-ply="onSelectOmReadingChipPly"
        @informational-body-overflow="onOmChapterInformationalOverflow"
      />
      <CoachBubble
        v-else-if="!omVariant1UsesInformationalChapter && omVariant1TopBubbleMessage"
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
        v-if="showOmPlayStripOnOmV1"
        class="mt3-om-play-coach"
        :class="{ 'mt3-om-play-coach--pm-parity': omV1InstructionPhaseFill }"
        :coach-avatar-src="davidCoachAvatarUrl"
        header-icon=""
        header-text=""
        eval-text=""
        :white-advantage="true"
        message=""
        :coach-avatar-icon-px="coachAvatarIconPx"
        turn-strip-text=""
        :show-tip="omV1InstructionPhaseFill"
        :typewriter="false"
        :intro-coach-combined-bubble="true"
        :intro-combined-lead-bold="omVariant1PlayLeadBold"
        :intro-combined-turn-strip-regular="omVariant1PlayTurnStrip"
        :fill-available-height="omV1InstructionPhaseFill"
        :start-position="false"
      />
    </div>

    <!-- OM step 6 after author **Continue**: checkpoint has no OM-v1 shell — skip placeholder flash while **a4** chain runs. -->
    <div
      v-else-if="isOpponentsMoveLayout && suppressOmCoachDuringPostAuthorWhite"
      class="move-trainer-3-coach move-trainer-3-coach--om-chain-blank"
      aria-hidden="true"
    />

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
        :suppress-intro-combined-no-message-placeholder="mt3PlayMoveSuppressEmptyCombinedPlaceholder"
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

/*
 * OM live chapter: clip panel spill so the chapter bubble gets a real height budget (flex min-height:0 chain).
 * Inner informational bubble owns vertical scroll + CoachBubble top/bottom dissolve (::before / ::after).
 */
.move-trainer-3-intro-stack--om-chapter-scroll-clamp {
  overflow: hidden;
  flex: 1 1 0;
  min-height: 0;
}

.move-trainer-3-coach--om-chain-blank {
  visibility: hidden;
  pointer-events: none;
  flex-shrink: 0;
  /* ~ one coach row so layout doesn’t jump when swapping OM-6 stub → OM-7 bubbles */
  min-height: 108px;
}

.move-trainer-3-coach {
  display: flex;
  flex-direction: column;
  gap: var(--space-8, 8px);
  padding: 8px 16px 16px 16px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  /* Single caret anchor for every MT3 coach shell — CoachBubble `.tip` uses `top: var(--coach-tip-top)`. */
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

/*
 * Replay preview: move-line heading + checkpoint body (White or Black half-move + OM / line copy) —
 * hug height; tight gap heading→copy; beat CoachBubble default 64px heading band + 96px body min-height + 16px pads.
 */
.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-informational-inner:has(
        .bubble-content.bubble-content--informational-below-heading:not(.bubble-content--informational-heading-only)
      )
  ) {
  flex: 0 0 auto;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-informational-inner:has(
        .bubble-content.bubble-content--informational-below-heading:not(.bubble-content--informational-heading-only)
      )
      .coach-intro-combined-heading
  ) {
  min-height: 0;
  justify-content: flex-start;
  padding: 10px var(--space-16, 16px) var(--space-4, 4px);
  box-sizing: border-box;
}

.move-trainer-3-coach--mt3-replay-preview
  :deep(
    .bubble-content.bubble-content--informational-message.bubble-content--informational-below-heading:not(
        .bubble-content--informational-heading-only
      )
  ) {
  min-height: 0 !important;
  max-height: none;
  flex: 0 0 auto;
  padding-top: 0 !important;
  padding-bottom: var(--space-12, 12px) !important;
  padding-left: var(--space-16, 16px) !important;
  padding-right: var(--space-16, 16px) !important;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
}

.move-trainer-3-coach--mt3-replay-preview :deep(.bubble-content--informational-message .coach-message) {
  margin: 0;
}

/* Anchor avatar top — never center vs bubble height (chip vs move+body shifts the portrait). */
.move-trainer-3-coach--mt3-replay-preview :deep(.coach-avatar) {
  align-self: flex-start;
}

.move-trainer-3-coach--om-v1 {
  /* Keep inset parity with intro / Play Move (do not tighten top padding — reads as whole panel “jumped up”). */
  gap: 10px;
}

/* OM-7 post-…g6: author-reading bubble + Play move strip (second bubble reuses `.mt3-om-play-coach` parity). */
.move-trainer-3-coach--om-author-reading-with-play {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
}

.move-trainer-3-coach--om-author-reading-with-play > .move-trainer-3-coach--om-reading-fill {
  flex: 1 1 auto;
  min-height: 0;
}

/* Live OM e4 chapter: same fill + scroll + gradient dissolves as OM author-reading (`informational-single` shell). */
.move-trainer-3-coach--om-v1-live-chapter {
  flex: 1 1 auto;
  flex-shrink: 1;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

/* Row defaults to align-items:flex-start — bubble stays short; stretch so wrapper fills coach height. */
.move-trainer-3-coach--om-v1-live-chapter :deep(.coach-container.coach-container--fill-available.coach-container--informational-single) {
  align-items: stretch;
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.coach-container.mt3-om-live-chapter-coach) {
  flex: 1 1 auto;
  min-height: 0;
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.coach-container.mt3-om-play-coach) {
  flex-shrink: 0;
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.coach-container.coach-container--fill-available) {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

.move-trainer-3-coach--om-v1-live-chapter .mt3-om-live-chapter-coach :deep(.bubble-wrapper--informational-single) {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
}

.move-trainer-3-coach--om-v1-live-chapter .mt3-om-live-chapter-coach :deep(.bubble.bubble--informational-single) {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
}

.move-trainer-3-coach--om-v1-live-chapter .mt3-om-live-chapter-coach :deep(.bubble-wrapper.bubble-wrapper--informational-single) {
  flex: 1 1 auto;
  min-height: 0;
  align-self: stretch;
}

.move-trainer-3-coach--om-v1-live-chapter .mt3-om-live-chapter-coach :deep(.bubble-scroll-panel.bubble-scroll-panel--informational) {
  flex: 1 1 auto;
  min-height: 0;
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.coach-avatar) {
  align-self: flex-start;
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.bubble--informational-single::before),
.move-trainer-3-coach--om-v1-live-chapter :deep(.bubble--informational-single::after) {
  height: 3.25rem;
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.bubble--informational-single::before) {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0.48) 46%,
    rgba(255, 255, 255, 0) 100%
  );
}

.move-trainer-3-coach--om-v1-live-chapter :deep(.bubble--informational-single::after) {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0.48) 46%,
    rgba(255, 255, 255, 0) 100%
  );
}

/*
 * Two-phase OM instruction: match `/play-move` bubble inset (avatar visible — hide rule is `:not(.mt3-om-play-coach--pm-parity)` below).
 */
.mt3-om-play-coach.mt3-om-play-coach--pm-parity :deep(.bubble-wrapper.bubble-wrapper--informational-single) {
  margin-top: 16px;
  margin-left: -6px;
}

.mt3-om-live-chapter-coach :deep(.coach-message),
.mt3-om-live-chapter-coach :deep(.bubble-content--informational-message) {
  white-space: pre-wrap;
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

/*
 * Only the **Play …** strip uses informational-message without fill-available scroll port — keep hug behavior.
 * Do NOT apply max-height:none to `.mt3-om-live-chapter-coach` or we break inner scroll + dissolve fades.
 */
.move-trainer-3-coach--om-v1 .mt3-om-play-coach :deep(.bubble-content.bubble-content--informational-message) {
  min-height: 0 !important;
  max-height: none;
}

/*
 * Commentary row (generic bubble branch): same 16px bubble top inset + top-anchored caret as intro / replay /
 * Play Move — avoids OM-only bottom-anchored tip that jumped vs other routes.
 */
.move-trainer-3-coach--om-v1 .mt3-om-commentary-coach :deep(.bubble-wrapper) {
  margin-top: 16px;
  margin-bottom: 0;
  min-height: 0;
  align-items: flex-start;
}

.move-trainer-3-coach--om-v1 .mt3-om-commentary-coach :deep(.tip) {
  top: var(--coach-tip-top, 20px);
  bottom: auto;
  height: 22px;
  width: 14px;
}

/* Second bubble: hide duplicate avatar; align wrapper with first bubble (wrapper uses margin-left -6px on avatar row). */
.mt3-om-play-coach:not(.mt3-om-play-coach--pm-parity) :deep(.coach-avatar) {
  display: none;
}

.mt3-om-play-coach :deep(.bubble-wrapper.bubble-wrapper--informational-single) {
  margin-top: 0;
  margin-left: calc(var(--coach-avatar-size, 80px) - 6px);
}

/*
 * Play Move (+ OM instruction parity): **do not** flex-grow the coach row — white bubble **hugs** short copy.
 * Pinned heading `.coach-intro-combined-heading` stays **min-height 64px** (CoachBubble + docs/coach-bubble-scrollable-variant-spec.md).
 * Long copy still caps via fill-available + inner scroll (move-trainer-coach-bubble-informational-fill-spec.md hug rule).
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

/* Long OM chapter: coach column grows so scrollable bubble has room above footer */
.move-trainer-3-coach--om-reading-long {
  flex: 1 1 auto;
  flex-shrink: 1;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

.move-trainer-3-coach--om-reading-long :deep(.coach-container.coach-container--fill-available) {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  overflow: hidden;
}

.move-trainer-3-coach--om-reading-long :deep(.bubble-wrapper--informational-single) {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
}

.move-trainer-3-coach--om-reading-long :deep(.bubble.bubble--informational-single) {
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
}

.move-trainer-3-coach--om-reading-long :deep(.bubble-scroll-panel.bubble-scroll-panel--informational) {
  flex: 1 1 auto;
  min-height: 0;
}

.mt3-om-reading-coach :deep(.coach-message),
.mt3-om-reading-coach :deep(.bubble-content--informational-message) {
  white-space: pre-wrap;
}

.move-trainer-3-coach--om-reading-fill :deep(.bubble--informational-single::before),
.move-trainer-3-coach--om-reading-fill :deep(.bubble--informational-single::after) {
  height: 3.25rem;
}

.move-trainer-3-coach--om-reading-fill.move-trainer-3-coach--om-reading-long :deep(.bubble--informational-single::before) {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0.48) 46%,
    rgba(255, 255, 255, 0) 100%
  );
}

.move-trainer-3-coach--om-reading-fill :deep(.bubble--informational-single::after) {
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(255, 255, 255, 0.48) 46%,
    rgba(255, 255, 255, 0) 100%
  );
}

/* Match CoachBubble `.tip` asset box — never stretch height or the caret appears to slide. */
.move-trainer-3-coach :deep(.tip) {
  width: 14px;
  height: 22px;
}

/*
 * Same top inset for informational single-bubble shells on intro / replay / Play Move fill.
 * OM v1 commentary (generic bubble) uses `.mt3-om-commentary-coach` rules above for the same 16px inset.
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
  top: var(--coach-tip-top, 20px);
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
