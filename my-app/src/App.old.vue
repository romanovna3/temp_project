<script setup>
import BoardPlaceholder from './components/BoardPlaceholder.vue'
import LearnPanel from './components/LearnPanel.vue'
</script>

<template>
  <div class="app-layout">
    <!-- Left: static nav (non-interactive for now) -->
    <aside class="panel nav-panel" aria-label="Navigation">
      <div class="nav-placeholder">Nav</div>
    </aside>

    <!-- Center: board – Juicy Learn style (ranks, grid, files, turn) -->
    <main class="panel board-panel" aria-label="Chess board">
      <BoardPlaceholder />
    </main>

    <!-- Right: Learn panel – Juicy Learn structure (turn, question, challenge progress) -->
    <LearnPanel />
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: auto 1fr auto;
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-panel {
  width: 240px;
  background: var(--color-bg-primary);
  border-right: 1px solid var(--color-border-subtle, var(--color-gray-700));
}

.board-panel {
  min-width: 0;
  background: var(--color-bg-primary);
  justify-content: center;
  align-items: center;
}

.nav-placeholder {
  padding: var(--space-24);
  color: var(--color-text-tertiary, var(--color-gray-400));
  font-size: 14px;
}
</style>
