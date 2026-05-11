/**
 * Chess move sounds (from Chess.com CDN).
 * Reused from @chess/components – local fallback so app works if package isn't installed.
 */
const SOUND_BASE_URL = 'https://www.chess.com/bundles/web/sounds/mp3/'

const SOUND_FILES = {
  move: 'move-self.mp3',
  capture: 'capture.mp3',
  castle: 'castle.mp3',
  check: 'move-check.mp3',
  promote: 'promote.mp3',
}

export function playSound(type, volume = 0.7) {
  const file = SOUND_FILES[type]
  if (!file) {
    console.warn(`Unknown sound type: ${type}`)
    return
  }
  const audio = new Audio(`${SOUND_BASE_URL}${file}`)
  audio.volume = volume
  audio.play().catch(() => {})
}

/** Local feedback clip (`public/audio/train-correct.mp3`). Play together with **`playSound`** on correct moves. */
const trainCorrectUrl = `${import.meta.env.BASE_URL}audio/train-correct.mp3`

export function playTrainCorrect(volume = 0.55) {
  const audio = new Audio(trainCorrectUrl)
  audio.volume = volume
  audio.play().catch(() => {})
}
