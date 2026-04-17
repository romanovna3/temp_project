import { ref, watch, toValue, onBeforeUnmount, nextTick } from 'vue'

const DEFAULT_SPEED = 8
const DEFAULT_DELAY = 90

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function generateHtml(text, visibleCount) {
  const escaped = escapeHtml(text)
  const chars = Array.from(escaped)

  return chars
    .map((char, index) => {
      const opacity = index < visibleCount ? 1 : 0
      return `<span style="opacity: ${opacity}; display: inline; white-space: normal;">${char === ' ' ? '&nbsp;' : char}</span>`
    })
    .join('')
}

export function useTypewriter(text, options = {}) {
  const { speed = DEFAULT_SPEED, delay = DEFAULT_DELAY, autoStart = true } = options

  const displayedText = ref('')
  const isTyping = ref(false)

  let timeoutId = null
  let currentIndex = 0
  let fullText = ''

  function start() {
    stop()

    fullText = toValue(text)
    currentIndex = 0
    displayedText.value = generateHtml(fullText, 0)
    isTyping.value = true

    if (delay > 0) {
      timeoutId = setTimeout(revealNextCharacter, delay)
    } else {
      revealNextCharacter()
    }
  }

  function revealNextCharacter() {
    if (currentIndex >= fullText.length) {
      isTyping.value = false
      timeoutId = null
      return
    }

    currentIndex++
    displayedText.value = generateHtml(fullText, currentIndex)

    timeoutId = setTimeout(revealNextCharacter, speed)
  }

  function stop() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    isTyping.value = false
  }

  function reset() {
    stop()
    displayedText.value = ''
    currentIndex = 0
    fullText = ''
  }

  if (autoStart) {
    const runOnTextChange = (newText) => {
      if (newText) {
        start()
      } else {
        reset()
      }
    }

    watch(() => toValue(text), runOnTextChange, { immediate: true })
    nextTick(() => {
      if (toValue(text) && displayedText.value === '') {
        start()
      }
    })
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    displayedText,
    isTyping,
    start,
    stop,
    reset,
  }
}
