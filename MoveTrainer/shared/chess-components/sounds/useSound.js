/**
 * Composable for playing chess sounds from the Chess.com CDN
 */

const SOUND_BASE_URL = 'https://www.chess.com/bundles/web/sounds/mp3/'

const SOUND_FILES = {
  move: 'move-self.mp3',
  capture: 'capture.mp3',
  castle: 'castle.mp3',
  check: 'move-check.mp3',
  promote: 'promote.mp3',
}

/**
 * Play a chess sound by type
 * @param {string} type - Sound type: 'move', 'capture', 'castle', 'check', 'promote'
 * @param {number} volume - Volume level (0-1), defaults to 0.7
 */
export function playSound(type, volume = 0.7) {
  const file = SOUND_FILES[type]
  if (!file) {
    console.warn(`Unknown sound type: ${type}`)
    return
  }
  
  const audio = new Audio(`${SOUND_BASE_URL}${file}`)
  audio.volume = volume
  audio.play().catch(err => {
    // Ignore autoplay errors (common in browsers)
    console.debug('Sound play failed:', err.message)
  })
}

/**
 * Composable hook for chess sounds
 * @returns {{ playSound: Function, soundTypes: string[] }}
 */
export function useSound() {
  const soundTypes = Object.keys(SOUND_FILES)
  
  return {
    playSound,
    soundTypes,
  }
}

export default useSound
