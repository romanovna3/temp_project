<script setup>
/**
 * Board area – Courses style: ranks 8–1, files a–h, centered.
 * Non-interactive placeholder for now.
 */
const ranks = [8, 7, 6, 5, 4, 3, 2, 1]
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
</script>

<template>
  <div class="board-wrapper">
    <div class="board-container">
      <div class="board-ranks">
        <span v-for="r in ranks" :key="r" class="board-rank">{{ r }}</span>
      </div>
      <div class="board-with-files">
        <div class="board-grid" aria-hidden="true">
          <div
            v-for="i in 64"
            :key="i"
            class="board-square"
            :class="{ 'square-light': (i + Math.floor((i - 1) / 8)) % 2 === 0 }"
          />
        </div>
        <div class="board-files">
          <span v-for="f in files" :key="f" class="board-file">{{ f }}</span>
        </div>
      </div>
    </div>
    <p class="board-turn">White to move</p>
  </div>
</template>

<style scoped>
.board-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-24);
}

.board-container {
  display: flex;
  align-items: stretch;
  gap: var(--space-4);
}

.board-ranks {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 12px;
  color: var(--color-text-tertiary, var(--color-gray-500));
}

.board-with-files {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: min(64vmin, 400px);
  height: min(64vmin, 400px);
  border: 1px solid var(--color-border-subtle, var(--color-gray-700));
}

.board-square {
  aspect-ratio: 1;
  background: var(--color-bg-tertiary);
}

.board-square.square-light {
  background: var(--color-bg-quaternary);
}

.board-files {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  color: var(--color-text-tertiary, var(--color-gray-500));
}

.board-turn {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary, var(--color-gray-400));
}
</style>
