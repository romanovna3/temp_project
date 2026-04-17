<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Chess } from 'chess.js'
import BoardPlaceholder from '../../components/move-trainer/BoardPlaceholder.vue'

const router = useRouter()

/** Sample line — replace with loaded game when wiring data. */
const SAMPLE_PGN =
  '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7'

const chess = new Chess()
chess.loadPgn(SAMPLE_PGN)

const history = chess.history({ verbose: true })
const moveRows = computed(() => {
  const rows = []
  for (let i = 0; i < history.length; i += 2) {
    rows.push({
      num: Math.floor(i / 2) + 1,
      white: history[i]?.san ?? '',
      black: history[i + 1]?.san ?? '',
    })
  }
  return rows
})

const meta = {
  white: 'Player A',
  black: 'Player B',
  result: '1–0',
  event: 'Sample game — layout prototype',
}

function goHome() {
  router.push({ name: 'index' })
}
</script>

<template>
  <div class="gr">
    <header class="gr__header">
      <button type="button" class="gr__icon-btn" aria-label="Back to projects" @click="goHome">
        <i class="fa-solid fa-arrow-left" aria-hidden="true" />
      </button>
      <div class="gr__header-main">
        <h1 class="gr__title">Game review</h1>
        <p class="gr__subtitle">{{ meta.event }}</p>
      </div>
      <div class="gr__header-players">
        <span class="gr__player gr__player--white">
          <span class="gr__dot gr__dot--w" aria-hidden="true" />
          {{ meta.white }}
        </span>
        <span class="gr__vs">vs</span>
        <span class="gr__player gr__player--black">
          <span class="gr__dot gr__dot--b" aria-hidden="true" />
          {{ meta.black }}
        </span>
      </div>
      <span class="gr__result">{{ meta.result }}</span>
      <div class="gr__header-actions">
        <button type="button" class="gr__icon-btn" aria-label="Share">
          <i class="fa-solid fa-share-nodes" aria-hidden="true" />
        </button>
        <button type="button" class="gr__icon-btn" aria-label="Menu">
          <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div class="gr__body">
      <section class="gr__board-panel" aria-label="Board">
        <BoardPlaceholder />
      </section>

      <section class="gr__moves" aria-label="Moves">
        <div class="gr__moves-head">
          <span class="gr__moves-title">Moves</span>
          <span class="gr__clock-pair">
            <span class="gr__clock">0:15:32</span>
            <span class="gr__clock">0:14:08</span>
          </span>
        </div>
        <ol class="gr__move-list">
          <li v-for="row in moveRows" :key="row.num" class="gr__move-row">
            <span class="gr__move-num">{{ row.num }}.</span>
            <button type="button" class="gr__move-san">{{ row.white }}</button>
            <button v-if="row.black" type="button" class="gr__move-san">{{ row.black }}</button>
          </li>
        </ol>
      </section>

      <aside class="gr__analysis" aria-label="Analysis">
        <div class="gr__analysis-block">
          <h2 class="gr__panel-title">Evaluation</h2>
          <div class="gr__eval-bar" role="img" aria-label="Evaluation bar placeholder">
            <span class="gr__eval-fill" />
          </div>
          <p class="gr__eval-text">+0.4</p>
        </div>
        <div class="gr__analysis-block">
          <h2 class="gr__panel-title">Top lines</h2>
          <ul class="gr__engine-lines">
            <li class="gr__engine-line gr__engine-line--best">
              <span class="gr__line-eval">+0.5</span>
              <span class="gr__line-san">d4 exd4 Nxd4</span>
            </li>
            <li class="gr__engine-line">
              <span class="gr__line-eval">+0.2</span>
              <span class="gr__line-san">Nf3 Nc6 Bb5</span>
            </li>
            <li class="gr__engine-line">
              <span class="gr__line-eval">0.0</span>
              <span class="gr__line-san">d3 d5 exd5</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.gr {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-primary, #312e2b);
  color: var(--color-text-default, #fff);
}

.gr__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-12);
  padding: var(--space-12) var(--space-16);
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
}

.gr__header-main {
  flex: 1;
  min-width: 12rem;
}

.gr__title {
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.2;
}

.gr__subtitle {
  margin-top: var(--space-4);
  font-size: 1.2rem;
  color: var(--color-text-secondary, #b0b0ae);
}

.gr__header-players {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  font-size: 1.3rem;
}

.gr__player {
  display: inline-flex;
  align-items: center;
  gap: var(--space-6);
}

.gr__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid var(--color-border-default, #5c5a57);
}
.gr__dot--w {
  background: #f0f0f0;
}
.gr__dot--b {
  background: #1a1a1a;
}

.gr__vs {
  font-size: 1.1rem;
  color: var(--color-text-tertiary);
  text-transform: lowercase;
}

.gr__result {
  padding: var(--space-4) var(--space-12);
  border-radius: 6px;
  background: var(--color-bg-subtle, #3d3a37);
  font-size: 1.3rem;
  font-weight: 600;
}

.gr__header-actions {
  display: flex;
  gap: var(--space-4);
  margin-left: auto;
}

.gr__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: inherit;
}
.gr__icon-btn:hover {
  background: var(--color-bg-subtle, #3d3a37);
}

.gr__body {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(280px, 1.1fr) minmax(200px, 0.45fr) minmax(220px, 0.55fr);
  gap: 0;
  min-height: 0;
}

@media (max-width: 960px) {
  .gr__body {
    grid-template-columns: 1fr;
  }
  .gr__moves,
  .gr__analysis {
    border-left: none;
    border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  }
}

.gr__board-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  min-height: 320px;
}

.gr__moves {
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-left: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  background: var(--color-bg-secondary, #2b2927);
}

.gr__moves-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-12) var(--space-16);
  border-bottom: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
}

.gr__moves-title {
  font-size: 1.3rem;
  font-weight: 600;
}

.gr__clock-pair {
  display: flex;
  gap: var(--space-12);
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.gr__move-list {
  list-style: none;
  margin: 0;
  padding: var(--space-8);
  overflow: auto;
  flex: 1;
}

.gr__move-row {
  display: grid;
  grid-template-columns: 2.4rem 1fr 1fr;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-6) var(--space-8);
  border-radius: 6px;
  font-size: 1.3rem;
}

.gr__move-row:hover {
  background: var(--color-bg-subtle, #3d3a37);
}

.gr__move-num {
  color: var(--color-text-tertiary);
  font-variant-numeric: tabular-nums;
}

.gr__move-san {
  text-align: left;
  padding: var(--space-4) var(--space-8);
  border: none;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
}
.gr__move-san:hover {
  background: var(--color-bg-tertiary, #454340);
}

.gr__analysis {
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
  padding: var(--space-16);
  border-left: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  min-height: 0;
  overflow: auto;
}

.gr__panel-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--space-8);
}

.gr__eval-bar {
  height: 10px;
  border-radius: 4px;
  background: #1a1a1a;
  overflow: hidden;
}

.gr__eval-fill {
  display: block;
  height: 100%;
  width: 58%;
  background: linear-gradient(90deg, #2d5a27, #81b29a);
}

.gr__eval-text {
  margin-top: var(--space-8);
  font-size: 1.6rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.gr__engine-lines {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.gr__engine-line {
  display: flex;
  gap: var(--space-12);
  padding: var(--space-8) var(--space-12);
  border-radius: 6px;
  background: var(--color-bg-secondary, #2b2927);
  font-size: 1.2rem;
}

.gr__engine-line--best {
  outline: 1px solid var(--color-border-accent, #5c8f6b);
}

.gr__line-eval {
  flex-shrink: 0;
  width: 3.2rem;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}

.gr__line-san {
  color: var(--color-text-default);
}
</style>
