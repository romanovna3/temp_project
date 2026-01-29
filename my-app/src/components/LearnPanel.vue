<script setup>
/**
 * Right panel – Juicy Learn structure:
 * - Turn/context (e.g. "White to move")
 * - Challenge question
 * - Progress (e.g. "Challenge 1/5")
 */
const turnLabel = 'White to move'
const question = 'Which piece can White capture?'
const challengeCurrent = 1
const challengeTotal = 5
</script>

<template>
  <aside class="learn-panel" aria-label="Learn">
    <div class="learn-content">
      <p class="turn-label">{{ turnLabel }}</p>
      <h2 class="challenge-question">{{ question }}</h2>
      <p class="challenge-progress">Challenge {{ challengeCurrent }}/{{ challengeTotal }}</p>
    </div>
  </aside>
</template>

<style scoped>
.learn-panel {
  display: flex;
  flex-direction: column;
  width: 360px;
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-border-subtle, var(--color-gray-700));
  overflow: hidden;
}

.learn-content {
  flex: 1;
  padding: var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.turn-label {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary, var(--color-gray-400));
}

.challenge-question {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 600;
  color: var(--color-text-primary, var(--color-neutrals-white));
}

.challenge-progress {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-tertiary, var(--color-gray-500));
}
</style>
