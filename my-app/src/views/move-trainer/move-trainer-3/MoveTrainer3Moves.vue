<script setup>
import MoveList from '@move-trainer/components/MoveList.vue'
import { gameMoves, gameResult, currentPly, goToPly } from './moveTrainer3IntroStore.js'
</script>

<template>
  <div class="move-trainer-3-moves">
    <MoveList
      :moves="gameMoves"
      :result="gameResult"
      :show-game-result="false"
      :active-ply="currentPly"
      :auto-tooltip="false"
      @select-ply="goToPly"
    />
  </div>
</template>

<style scoped>
.move-trainer-3-moves {
  flex: 1 1 0;
  min-height: 0;
  overflow-x: clip;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0 0 var(--space-24, 24px);
}
</style>
