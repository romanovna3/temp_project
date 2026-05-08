<script setup>
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CcButton, CcIcon, CcProgressBar, CcTooltip } from '@chesscom/design-system'
import PanelFooterV10 from '@move-trainer/components/PanelFooterV10.vue'
import MoveTrainer3PlayMoveHorizontalMovelist from './MoveTrainer3PlayMoveHorizontalMovelist.vue'
import {
  currentPly,
  footerNavBackDisabled,
  footerNavForwardDisabled,
  goBack,
  goForward,
  goToPly,
  toggleVideoToolbar,
  requestMoveTrainer3StartLearning,
  moveTrainer3StartLearningNonce,
  moveTrainer3BlackMovesCompleted,
  moveTrainer3BlackMovesTotal,
  moveTrainer3AllPlies,
  moveTrainer3OmAuthorNoteStep,
  resetMoveTrainer3OmAuthorNoteStep,
  moveTrainer3FooterNavMaxPly,
  moveTrainer3OmChapterOverflows,
  moveTrainer3OmChapterPhase,
  advanceMoveTrainer3OmChapterToInstruction,
  moveTrainer3LearnShellTargetFromFrontier,
  tryStartMoveTrainer3OmAuthorContinueChain,
  moveTrainer3OmReadingSelectedChipPly,
  clearMoveTrainer3OmReadingBoardBranch,
  getMoveTrainer3AuthorReadingPrimaryLabel,
  moveTrainer3AuthorReadingNavigateIntro,
  restartMoveTrainer3ToIntro,
} from './moveTrainer3IntroStore.js'

const route = useRoute()
const router = useRouter()

const isPlayMoveLayout = computed(() => {
  const p = route.path
  if (p === '/move-trainer/move-trainer-3/play-move') return true
  try {
    return decodeURIComponent(p) === '/move-trainer/move-trainer-3/play-move'
  } catch {
    return false
  }
})

/** Shared footer chrome: Play Move + Opponents Move (not intro landing). */
const isPlayMoveShellLayout = computed(() => {
  const p = route.path
  if (isPlayMoveLayout.value) return true
  try {
    const d = decodeURIComponent(p)
    return /\/move-trainer\/move-trainer-3\/opponents-move-\d+$/.test(d)
  } catch {
    return /\/move-trainer\/move-trainer-3\/opponents-move-\d+$/.test(p)
  }
})

/**
 * All half-moves unlocked so far (furthest `currentPly` reached via gameplay).
 * Chevrons only change `currentPly` / selection — they do not trim this list.
 */
const playMoveDisplayedPlies = computed(() => {
  const cap = Math.min(moveTrainer3AllPlies.value.length, moveTrainer3FooterNavMaxPly.value)
  return moveTrainer3AllPlies.value.slice(0, cap)
})

/** Highlights main-line scrub cursor; suppressed while an OM branch chip is selected (bubble vs movelist are mutually exclusive). */
const playMoveMovelistHighlightIndex = computed(() => {
  if (moveTrainer3OmReadingSelectedChipPly.value > 0) return -1
  const n = currentPly.value
  return n > 0 ? n - 1 : -1
})

function onMt3MovelistSelectPly(idx) {
  clearMoveTrainer3OmReadingBoardBranch()
  goToPly(idx + 1)
}

const isOmAuthorNoteFooter = computed(() => moveTrainer3OmAuthorNoteStep.value > 0)

const omAuthorReadingPrimaryLabel = computed(() =>
  getMoveTrainer3AuthorReadingPrimaryLabel(moveTrainer3OmAuthorNoteStep.value),
)

/** Long OM chapter overflow — read phase only (Video + Continue before Play strip). */
const isOmChapterReadFooter = computed(
  () =>
    moveTrainer3OmChapterPhase.value === 'read'
    && moveTrainer3OmChapterOverflows.value === true
    && moveTrainer3OmAuthorNoteStep.value === 0,
)

function onOmChapterReadContinue() {
  advanceMoveTrainer3OmChapterToInstruction()
}

async function onOmContinue() {
  const authorStep = moveTrainer3OmAuthorNoteStep.value
  if (moveTrainer3AuthorReadingNavigateIntro(authorStep)) {
    resetMoveTrainer3OmAuthorNoteStep()
    restartMoveTrainer3ToIntro()
    await router.replace('/move-trainer/move-trainer-3')
    return
  }
  if (tryStartMoveTrainer3OmAuthorContinueChain()) {
    await nextTick()
    return
  }
  resetMoveTrainer3OmAuthorNoteStep()
  await nextTick()
  await router.replace(moveTrainer3LearnShellTargetFromFrontier())
}

function onStartLearning() {
  requestMoveTrainer3StartLearning()
}

function onHint() {
  /* Placeholder — Play Move hint flow TBD */
}

/** Video stays usable on intro only; learn shell matches quiz-style lesson (tooltip on disabled control). */
const MT3_VIDEO_DISABLED_TOOLTIP = 'Videos are not available during quiz'
</script>

<template>
  <PanelFooterV10
    class="move-trainer-3-panel-footer-v10"
    :class="{
      'move-trainer-3-panel-footer-v10--intro': !isPlayMoveShellLayout,
      'move-trainer-3-panel-footer-v10--play-move': isPlayMoveShellLayout,
    }"
  >
    <template #actions>
      <div class="move-trainer-3-footer-actions-stack">
        <MoveTrainer3PlayMoveHorizontalMovelist
          v-if="moveTrainer3StartLearningNonce > 0 && isPlayMoveShellLayout"
          :plies="playMoveDisplayedPlies"
          :active-ply-index="playMoveMovelistHighlightIndex"
          @select-ply="onMt3MovelistSelectPly"
        />
        <div
          v-if="moveTrainer3StartLearningNonce > 0 && isPlayMoveShellLayout"
          class="mt3-learn-progress-slot footer-progress-bar-wrap"
        >
          <CcProgressBar
            v-if="moveTrainer3BlackMovesTotal > 0"
            key="mt3-learn-progress"
            :completed-steps="moveTrainer3BlackMovesCompleted"
            :total-step-count="moveTrainer3BlackMovesTotal"
            :is-change-animated="true"
          />
        </div>
        <div class="footer-buttons-row footer-buttons-row-split">
          <template v-if="isPlayMoveShellLayout">
            <span class="mt3-video-tooltip-host footer-btn-equal">
              <CcButton
                variant="secondary"
                size="large"
                class="footer-btn-equal mt3-video-btn-fill"
                :icon="{ name: 'media-camera-video-on' }"
                :disabled="true"
                :aria-disabled="true"
                @click.prevent
              >
                Video
              </CcButton>
            </span>
            <CcTooltip
              for-previous-element
              class="practice-in-tooltip-no-fade mt3-video-disabled-tooltip"
              :delay="0"
              position="top"
              anchor="center"
            >
              <span class="mt3-video-disabled-tooltip__text">{{ MT3_VIDEO_DISABLED_TOOLTIP }}</span>
            </CcTooltip>
            <CcButton
              v-if="isOmAuthorNoteFooter"
              variant="primary"
              size="large"
              class="footer-btn-equal"
              @click="onOmContinue"
            >
              {{ omAuthorReadingPrimaryLabel }}
            </CcButton>
            <CcButton
              v-else-if="isOmChapterReadFooter"
              variant="primary"
              size="large"
              class="footer-btn-equal"
              @click="onOmChapterReadContinue"
            >
              Continue
            </CcButton>
            <CcButton
              v-else
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
/* Intro — default PanelFooterV10 actions padding gives 12px above CTAs; no fixed footer height. */
.move-trainer-3-panel-footer-v10--intro.panel-footer-v10-root .panel-footer-container {
  padding: 0;
  height: auto;
  min-height: 0;
  justify-content: flex-end;
  align-items: stretch;
  border-radius: 3px;
  background: unset;
  background-color: unset;
}

.move-trainer-3-panel-footer-v10--intro.panel-footer-v10-root .footer-section-toolbar {
  align-self: stretch;
  padding: 12px 16px 12px;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.panel-sm .move-trainer-3-panel-footer-v10--intro.panel-footer-v10-root .footer-section-toolbar {
  padding: 12px 8px 12px;
}

/* Play Move — nested shell (movelist + progress + CTAs + toolbar). */
.move-trainer-3-panel-footer-v10--play-move.panel-footer-v10-root .panel-footer-container {
  padding-top: 3px;
  padding-left: 0;
  padding-right: 0;
  height: 190px;
  justify-content: flex-end;
  align-items: flex-start;
  border-radius: 3px;
  background: unset;
  background-color: unset;
}

.move-trainer-3-panel-footer-v10--play-move.panel-footer-v10-root .footer-section-actions {
  padding-top: 0;
}

.move-trainer-3-panel-footer-v10--play-move.panel-footer-v10-root .footer-section-toolbar {
  align-self: stretch;
  padding: 12px 16px 12px;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
}

.panel-sm .move-trainer-3-panel-footer-v10--play-move.panel-footer-v10-root .footer-section-toolbar {
  padding: 12px 8px 12px;
}

.mt3-learn-progress-slot.footer-progress-bar-wrap .cc-progress-bar-component {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  overflow: hidden;
}

.mt3-video-tooltip-host {
  display: flex;
  flex: 1;
  min-width: 0;
}

.mt3-video-btn-fill {
  width: 100%;
}

.mt3-video-disabled-tooltip__text {
  font-family: var(--font-family-system, system-ui, sans-serif);
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-text-default, #312e2b);
}
</style>
