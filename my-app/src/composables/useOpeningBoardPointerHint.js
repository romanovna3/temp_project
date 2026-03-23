import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

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

/** Center of chess square as % of board (matches OpeningCourses board grid / squareToPercent). */
export function openingSquareCenterPercent(square, blackView) {
  const fileIndex = square.charCodeAt(0) - 97
  const rank = parseInt(square[1], 10)
  if (fileIndex < 0 || fileIndex > 7 || rank < 1 || rank > 8) return { left: '50%', top: '50%' }
  const leftPct = ((fileIndex + 0.5) / 8) * 100
  const topPct = blackView
    ? ((rank - 0.5) / 8) * 100
    : ((8 - rank + 0.5) / 8) * 100
  return { left: `${leftPct}%`, top: `${topPct}%` }
}

/**
 * Animated finger pointer on the opening-list board: e2→e4 (×2), d2→d4 (×2), repeat until `shouldRun` is false.
 * @param {import('vue').ComputedRef<boolean>} shouldRun
 * @param {import('vue').Ref<boolean>} boardViewBlack
 */
export function useOpeningBoardPointerHint(shouldRun, boardViewBlack) {
  const pos = ref({ left: '50%', top: '62.5%' })
  const opacity = ref(0)
  const instant = ref(false)

  let abortCtrl = null

  const openingBoardPointerStyle = computed(() => ({
    left: pos.value.left,
    top: pos.value.top,
    opacity: opacity.value,
    transition: instant.value
      ? 'none'
      : 'left 0.68s cubic-bezier(0.33, 1, 0.65, 1), top 0.68s cubic-bezier(0.33, 1, 0.65, 1), opacity 0.2s ease-out',
  }))

  async function playHop(from, to, signal) {
    instant.value = true
    pos.value = openingSquareCenterPercent(from, boardViewBlack.value)
    opacity.value = 0
    await nextTick()
    instant.value = false
    await nextTick()
    opacity.value = 1
    await sleep(360, signal)
    pos.value = openingSquareCenterPercent(to, boardViewBlack.value)
    await sleep(700, signal)
    opacity.value = 0
    await sleep(260, signal)
  }

  async function runLoop(signal) {
    await sleep(220, signal)
    const sequence = [
      ['e2', 'e4'],
      ['e2', 'e4'],
      ['d2', 'd4'],
      ['d2', 'd4'],
    ]
    while (!signal.aborted && shouldRun.value) {
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
        await sleep(600, signal)
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

  onUnmounted(() => stopLoop())

  return {
    openingBoardPointerStyle,
    /** Same condition as `shouldRun` — use for v-if on the overlay. */
    openingBoardPointerShow: shouldRun,
  }
}
