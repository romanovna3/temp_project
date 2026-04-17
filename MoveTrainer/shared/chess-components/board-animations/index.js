// Board animations - CSS-based animations for chess board squares
// These are currently embedded in the Board component
// TODO: Extract as standalone components or composables

export const ANIMATION_TIMINGS = {
  // Skill highlight animation
  skillOverlayFadeIn: 300,      // ms - overlay fade in
  skillOverlayHold: 200,        // ms - hold at full opacity
  skillOverlayFadeOut: 300,     // ms - fade out
  skillPillMorph: 800,          // ms - pill transforms to coin
  skillCoinFall: 500,           // ms - coin falls to progress bar
  skillExplosion: 500,          // ms - explosion effect duration
  
  // Brilliant highlight animation (same timing, no fall)
  brilliantOverlayFadeIn: 300,
  brilliantOverlayHold: 200,
  brilliantOverlayFadeOut: 300,
  brilliantPillMorph: 800,
  
  // Total durations
  skillTotalDuration: 1350,     // ms - full skill animation
  brilliantTotalDuration: 800,  // ms - full brilliant animation
}

// Colors
export const ANIMATION_COLORS = {
  skillHighlight: '#E3AA24',    // Gold
  brilliantHighlight: '#26C2A3', // Teal
}

/**
 * CSS keyframes for skill highlight overlay
 * Use in your component's <style> block
 */
export const skillHighlightCSS = `
@keyframes skill-overlay-animate {
  0% { opacity: 0; }
  37.5% { opacity: 0.8; }
  62.5% { opacity: 0.8; }
  100% { opacity: 0; }
}

@keyframes skill-star-animate {
  0% {
    opacity: 0.1;
    width: 20px;
    height: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  22.2% {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  37% {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  59.3% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: 4px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  63% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: 4px;
    left: 90%;
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    opacity: 1;
    width: 16px;
    height: 16px;
    top: var(--coin-fall-y, 600%);
    left: var(--coin-fall-x, -170%);
    transform: translate(-50%, -50%) rotate(-90deg);
  }
}
`
