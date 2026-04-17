// Main entry point for @chess/components

// Celebrations
export { 
  BoardCelebration, 
  SkillEarned, 
  SkillUnlockedModal 
} from './celebrations/index.js'

// Sounds
export { 
  useSound, 
  playSound 
} from './sounds/index.js'

// Board Animations (constants and CSS helpers)
export { 
  ANIMATION_TIMINGS, 
  ANIMATION_COLORS,
  skillHighlightCSS 
} from './board-animations/index.js'

// Transitions
export { SwapTransition } from './transitions/index.js'

// Coach
export { CoachBubble } from './coach/index.js'
