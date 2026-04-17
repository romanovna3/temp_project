<script setup>
import { computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'
import { MOVE_CLASSIFICATIONS } from '../data/classifications.js'

const HIGHLIGHTED_CLASSIFICATIONS = ['blunder', 'best']

const props = defineProps({
  plies: { type: Array, required: true },
  activePly: { type: Number, default: 0 },
  highlightBestWorst: { type: Boolean, default: false },
  limitOnePerType: { type: Boolean, default: false },
})

const emit = defineEmits(['select-ply'])

const CLASSIFICATION_COLORS = {
  brilliant: '#1bada6',
  great: '#5c8bb0',
  best: '#98bc4b',
  excellent: '#98bc4b',
  good: '#97af8b',
  book: '#a88865',
  inaccuracy: '#e6a535',
  mistake: '#e68a35',
  miss: '#e04040',
  blunder: '#ca3431',
}

function parseEval(ev) {
  if (!ev) return 0
  if (ev === '1-0') return 10
  if (ev === '0-1') return -10
  if (ev.startsWith('#-')) return -10
  if (ev.startsWith('#')) return 10
  const num = parseFloat(ev)
  return isNaN(num) ? 0 : num
}

function evalToY(ev) {
  const capped = Math.max(-8, Math.min(8, ev))
  const normalized = capped / 8
  const curved = Math.sign(normalized) * Math.pow(Math.abs(normalized), 0.6)
  return 50 - curved * 45
}

const W = 400
const H = 80

const points = computed(() => {
  const pts = [{ x: 0, y: evalToY(0) }]
  const count = props.plies.length
  for (let i = 0; i < count; i++) {
    const x = ((i + 1) / count) * W
    const ev = parseEval(props.plies[i].eval)
    pts.push({ x, y: evalToY(ev) })
  }
  return pts
})

function smoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
  }
  return d
}

const curvePath = computed(() => smoothPath(points.value))

const fillPath = computed(() => {
  const curve = curvePath.value
  const lastPt = points.value[points.value.length - 1]
  return `${curve} L ${lastPt.x},${H} L 0,${H} Z`
})

const activeMarker = computed(() => {
  if (props.activePly === 0) return null
  const ply = props.plies[props.activePly - 1]
  if (!ply) return null
  const xSvg = (props.activePly / props.plies.length) * W
  return {
    xSvg,
    color: CLASSIFICATION_COLORS[ply.classification] || 'rgba(255,255,255,0.3)',
  }
})

const dots = computed(() => {
  const count = props.plies.length
  const result = []
  for (let i = 0; i < count; i++) {
    if (i % 2 !== 0) continue
    const ply = props.plies[i]
    if (!ply.highlighted) continue
    const xPct = ((i + 1) / count) * 100
    const ev = parseEval(ply.eval)
    const yPct = (evalToY(ev) / H) * 100
    const color = CLASSIFICATION_COLORS[ply.classification] || '#888'
    result.push({ xPct, yPct, color, plyIndex: i + 1 })
  }
  return result
})

const classificationIcons = computed(() => {
  if (!props.highlightBestWorst) return []
  const count = props.plies.length

  if (props.limitOnePerType) {
    let worst = null
    let best = null
    for (let i = 0; i < count; i++) {
      if (i % 2 !== 0) continue
      const ply = props.plies[i]
      const cls = MOVE_CLASSIFICATIONS[ply.classification]
      if (!cls) continue
      const prevEval = i > 0 ? parseEval(props.plies[i - 1].eval) : 0
      const curEval = parseEval(ply.eval)
      const delta = curEval - prevEval
      const entry = {
        xPct: ((i + 1) / count) * 100,
        yPct: (evalToY(curEval) / H) * 100,
        icon: cls.icon,
        plyIndex: i + 1,
        delta,
      }
      if (!worst || delta < worst.delta) worst = entry
      if (!best || delta > best.delta) best = entry
    }
    const result = []
    if (worst && worst.delta < 0) result.push(worst)
    if (best && best.delta > 0 && best !== worst) result.push(best)
    return result
  }

  const candidates = []
  for (let i = 0; i < count; i++) {
    if (i % 2 !== 0) continue
    const ply = props.plies[i]
    if (!HIGHLIGHTED_CLASSIFICATIONS.includes(ply.classification)) continue
    const cls = MOVE_CLASSIFICATIONS[ply.classification]
    if (!cls) continue
    const curEval = parseEval(ply.eval)
    const xPct = ((i + 1) / count) * 100
    const yPct = (evalToY(curEval) / H) * 100
    candidates.push({ xPct, yPct, icon: cls.icon, plyIndex: i + 1 })
  }
  return candidates
})

function onGraphClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const xRatio = (e.clientX - rect.left) / rect.width
  const ply = Math.round(xRatio * props.plies.length)
  emit('select-ply', Math.max(0, Math.min(props.plies.length, ply)))
}
</script>

<template>
  <div class="eval-graph-wrapper">
    <div class="eval-graph" @click="onGraphClick">
      <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none">
        <rect x="0" y="0" :width="W" :height="H" fill="#3d3a37" />

        <path :d="fillPath" fill="#e8e6e3" />

        <line x1="0" :y1="H / 2" :x2="W" :y2="H / 2" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />

        <path :d="curvePath" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />

        <line
          v-if="activeMarker"
          :x1="activeMarker.xSvg" y1="0"
          :x2="activeMarker.xSvg" :y2="H"
          :stroke="activeMarker.color"
          stroke-opacity="0.5"
          stroke-width="1"
          vector-effect="non-scaling-stroke"
        />
      </svg>

      <div
        v-for="dot in dots"
        :key="'dot-' + dot.plyIndex"
        class="dot-ring"
        :style="{
          left: dot.xPct + '%',
          top: dot.yPct + '%',
        }"
      >
        <div class="dot-inner" :style="{ background: dot.color }" />
      </div>
    </div>

    <div
      v-for="ci in classificationIcons"
      :key="'ci-' + ci.plyIndex"
      class="classification-icon"
      :style="{
        left: ci.xPct + '%',
        top: ci.yPct + '%',
      }"
      @click.stop="emit('select-ply', ci.plyIndex)"
    >
      <CcIcon :name="ci.icon" :size="20" variant="color" />
    </div>
  </div>
</template>

<style scoped>
.eval-graph-wrapper {
  position: relative;
  width: 100%;
  height: 80px;
}

.eval-graph {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg, 8px);
  overflow: hidden;
  cursor: pointer;
}

.eval-graph svg {
  display: block;
  width: 100%;
  height: 100%;
}

.dot-ring {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #3d3a37;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.dot-inner {
  position: absolute;
  inset: 1px;
  border-radius: 50%;
}

.classification-icon {
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  z-index: 2;
  line-height: 0;
}
</style>
