<script setup>
import CoachBubble from '@move-trainer/components/CoachBubble.vue'
import MoveListHeader from '@move-trainer/components/MoveListHeader.vue'
import { useRouter } from 'vue-router'
import {
  lineHeaderTitle,
  moveTrainerLineNav,
  intro1Line,
  coachHeaderIcon,
  coachHeaderText,
  coachEvalText,
  coachWhiteAdvantage,
  coachMessage,
  coachTurnStripText,
  bubbleStartPosition,
  coachAvatarIconPx,
} from './moveTrainer3IntroStore.js'
import { moveTrainerNextPath, moveTrainerPrevPath } from '@move-trainer/data/moveTrainerLineOrder.js'

const router = useRouter()

function onOpeningLinePrev() {
  const base = intro1Line.value?.path
  if (!base) return
  const prev = moveTrainerPrevPath(base)
  if (prev) router.push(prev)
}

function onOpeningLineNext() {
  const base = intro1Line.value?.path
  if (!base) return
  const next = moveTrainerNextPath(base)
  if (next) router.push(next)
}
</script>

<template>
  <div class="move-trainer-3-line-header">
    <MoveListHeader
      :title="lineHeaderTitle"
      :prev-disabled="moveTrainerLineNav.prevDisabled"
      :next-disabled="moveTrainerLineNav.nextDisabled"
      @next="onOpeningLineNext"
      @prev="onOpeningLinePrev"
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
}
</style>
