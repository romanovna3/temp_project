import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

/** All timings ×2 vs original */
const HOLD_BOTTOM_MS = 720
const SLIDE_MS = 1360
const FADE_MS = 400
const GAP_AFTER_FADE_MS = 520
const LOOP_START_DELAY_MS = 440
const BETWEEN_CYCLES_MS = 1200

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const id = setTimeout(() => resolve(), ms)
    const onAbort = () => {
      clearTimeout(id)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

/** Ensures `transition: none` is applied in the compositor before re-enabling transitions (avoids one-frame interpolated snap). */
function waitPaintCommit() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve)
    })
  })
}

/** Center of chess square as % of board (matches OpeningCourses board grid). */
export function openingSquareCenterPercent(square, blackView) {
  const fileIndex = square.charCodeAt(0) - 97
  const rank = parseInt(square[1], 10)
  if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return { left: '50%', top: '50%' }
  const col = blackView ? 7 - fileIndex : fileIndex
  const leftPct = ((col + 0.5) / 8) * 100
  const topPct = blackView
    ? ((rank - 0.5) / 8) * 100
    : ((8 - rank + 0.5) / 8) * 100
  return { left: `${leftPct}%`, top: `${topPct}%` }
}

/**
 * Bottom edge of the square in board % — used as the `top` anchor for the hint box.
 * With CSS `translate(-50%, 0)`, the hint’s top edge sits on this line so the asset (finger up)
 * sits just under the square and points into it.
 */
export function openingSquarePointerUnderPercent(square, blackView) {
  const fileIndex = square.charCodeAt(0) - 97
  const rank = parseInt(square[1], 10)
  if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return { left: '50%', top: '50%' }
  const col = blackView ? 7 - fileIndex : fileIndex
  const leftPct = ((col + 0.5) / 8) * 100
  const topFrac = blackView ? rank / 8 : (8 - rank + 1) / 8
  const topPct = topFrac * 100
  return { left: `${leftPct}%`, top: `${topPct}%` }
}

/**
 * Animated finger pointer: under `from` → slide up to under `to` → fade out at top → teleport to under `from`
 * invisibly (no downward motion). White: e2→e4, d2→d4. Black: e7→e5, d7→d5.
 */
export function useOpeningBoardPointerHint(shouldRun, boardViewBlack) {
  const pos = ref({ left: '50%', top: '87.5%' })
  const opacity = ref(0)
  const instant = ref(false)

  let abortCtrl = null

  // No overshoot: bezier with y>1 caused the pointer to pass e4 then ease back down (looked like “moving back”).
  const SLIDE_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)'

  const openingBoardPointerStyle = computed(() => ({
    left: pos.value.left,
    top: pos.value.top,
    opacity: opacity.value,
    transition: instant.value
      ? 'none'
      : `left ${SLIDE_MS / 1000}s ${SLIDE_EASE}, top ${SLIDE_MS / 1000}s ${SLIDE_EASE}, opacity ${FADE_MS / 1000}s ease-out`,
  }))

  async function playHop(from, to, signal) {
    // Invisible at bottom (under `from`) — no downward travel visible
    instant.value = true
    pos.value = openingSquarePointerUnderPercent(from, boardViewBlack.value)
    opacity.value = 0
    await nextTick()
    await waitPaintCommit()
    instant.value = false

    opacity.value = 1
    await sleep(HOLD_BOTTOM_MS, signal)

    // Only animated move: up toward under `to`
    pos.value = openingSquarePointerUnderPercent(to, boardViewBlack.value)
    await sleep(SLIDE_MS + 80, signal)

    opacity.value = 0
    await sleep(FADE_MS + 40, signal)

    // Jump back to bottom while fully hidden (user never sees return)
    instant.value = true
    pos.value = openingSquarePointerUnderPercent(from, boardViewBlack.value)
    opacity.value = 0
    await nextTick()
    await waitPaintCommit()
    instant.value = false
  }

  function pointerHopSequence(black) {
    return black
      ? [
          ['e7', 'e5'],
          ['e7', 'e5'],
          ['d7', 'd5'],
          ['d7', 'd5'],
        ]
      : [
          ['e2', 'e4'],
          ['e2', 'e4'],
          ['d2', 'd4'],
          ['d2', 'd4'],
        ]
  }

  async function runLoop(signal) {
    await sleep(LOOP_START_DELAY_MS, signal)
    while (!signal.aborted && shouldRun.value) {
      const sequence = pointerHopSequence(boardViewBlack.value)
      for (const [from, to] of sequence) {
        if (signal.aborted || !shouldRun.value) return
        try {
          await playHop(from, to, signal)
        } catch {
          return
        }
      }
      if (signal.aborted || !shouldRun.value) return
      try {
        await sleep(BETWEEN_CYCLES_MS, signal)
      } catch {
        return
      }
    }
  }

  function stopLoop() {
    abortCtrl?.abort()
    abortCtrl = null
    instant.value = true
    opacity.value = 0
  }

  function startLoop() {
    stopLoop()
    abortCtrl = new AbortController()
    const signal = abortCtrl.signal
    runLoop(signal).catch(() => {})
  }

  watch(
    shouldRun,
    (on) => {
      if (on) startLoop()
      else stopLoop()
    },
    { flush: 'post', immediate: true }
  )

  watch(boardViewBlack, () => {
    if (shouldRun.value) startLoop()
  })

  onUnmounted(() => stopLoop())

  return {
    openingBoardPointerStyle,
    openingBoardPointerShow: shouldRun,
  }
}
