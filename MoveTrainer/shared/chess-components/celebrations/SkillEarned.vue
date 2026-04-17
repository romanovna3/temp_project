<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  skillName: { type: String, default: 'Skewers' },
  current: { type: Number, default: 1 },
  max: { type: Number, default: 10 },
  iconSrc: { type: String, default: null }, // Full URL or path to icon
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['counter-complete'])

// Animated progress starts at current value, then grows +1
const animatedProgress = ref(0)

// Animated counter for slot machine effect
const animatedCounter = ref(0)
const isCounterAnimating = ref(false)

// Disable transition when snapping to initial state
const skipTransition = ref(false)

function getCurrentPercent() {
  return Math.round((props.current / props.max) * 100)
}

function getNextPercent() {
  const next = Math.min(props.current + 1, props.max)
  return Math.round((next / props.max) * 100)
}

const clampedNext = computed(() => Math.min(props.current + 1, props.max))

// Watch visibility to trigger progress animation
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    // Disable transition to snap to starting position
    skipTransition.value = true
    animatedProgress.value = getCurrentPercent()
    animatedCounter.value = props.current
    isCounterAnimating.value = false
    
    // Re-enable transition after a frame
    requestAnimationFrame(() => {
      skipTransition.value = false
    })
    
    // After explosion completes (~1550ms from visibility), grow +1 point
    // Explosion starts at 1350ms from trigger, lasts 500ms
    // SkillEarned becomes visible at ~300ms from trigger
    // So: 1850ms - 300ms = 1550ms from visibility
    setTimeout(() => {
      animatedProgress.value = getNextPercent()
      isCounterAnimating.value = true
      animatedCounter.value = Math.min(props.current + 1, props.max)
      
      // Emit after counter animation completes (500ms)
      setTimeout(() => {
        emit('counter-complete')
      }, 500)
    }, 1550)
  } else {
    // Reset AFTER slide-out completes (150ms) so progress stays during animation
    setTimeout(() => {
      skipTransition.value = true
      animatedProgress.value = getCurrentPercent()
      animatedCounter.value = props.current
      isCounterAnimating.value = false
    }, 150)
  }
})
</script>

<template>
  <div class="skill-earned" :class="{ visible }">
    <!-- Skill Icon -->
    <div class="skill-icon">
      <img v-if="iconSrc" :src="iconSrc" :alt="skillName" />
      <div v-else class="skill-icon-placeholder">
        <svg viewBox="0 0 56 56" fill="none">
          <rect x="2" y="2" width="52" height="52" rx="2" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
        </svg>
      </div>
    </div>
    
    <!-- Skill Info -->
    <div class="skill-info">
      <!-- Label + Counter -->
      <div class="skill-header">
        <span class="skill-name">{{ skillName }}</span>
        <span class="skill-counter">
          <span class="counter-slot" :class="{ animating: isCounterAnimating }">
            <span class="counter-value previous">{{ current }}</span>
            <span class="counter-value next">{{ clampedNext }}</span>
          </span>
          <span class="separator">/</span>
          <span class="max">{{ max }}</span>
        </span>
      </div>
      
      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-bg"></div>
        <div 
          class="progress-fill" 
          :class="{ 'skip-transition': skipTransition }"
          :style="{ width: animatedProgress + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skill-earned {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(24px);
  pointer-events: none;
  visibility: hidden;
  transition: opacity 150ms cubic-bezier(0, 0, 0.4, 1),
              transform 150ms cubic-bezier(0, 0, 0.4, 1),
              visibility 0ms 150ms;
}

.skill-earned.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  visibility: visible;
  transition: opacity 150ms cubic-bezier(0, 0, 0.4, 1),
              transform 150ms cubic-bezier(0, 0, 0.4, 1),
              visibility 0ms;
}

.skill-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skill-icon img {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.skill-icon-placeholder {
  width: 56px;
  height: 56px;
}

.skill-icon-placeholder svg {
  width: 100%;
  height: 100%;
}

.skill-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.skill-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 20px;
}

.skill-name {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 20px;
  color: white;
  white-space: nowrap;
}

.skill-counter {
  display: flex;
  align-items: center;
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-size: 17px;
  line-height: 20px;
  color: white;
  text-align: right;
}

/* Slot machine counter */
.counter-slot {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  height: 20px;
  min-width: 1.2em;
  overflow: hidden;
}

.counter-value {
  font-weight: 700;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: transform 500ms cubic-bezier(0, 0, 0.2, 1),
              opacity 500ms cubic-bezier(0, 0, 0.2, 1);
}

.counter-value.previous {
  opacity: 1;
  transform: translateY(0);
}

.counter-value.next {
  opacity: 0;
  transform: translateY(0);
}

/* When animating, slide up */
.counter-slot.animating .counter-value.previous {
  opacity: 0;
  transform: translateY(-20px);
}

.counter-slot.animating .counter-value.next {
  opacity: 1;
  transform: translateY(-20px);
}

.skill-counter .separator {
  font-weight: 800;
}

.skill-counter .max {
  font-weight: 700;
}

/* Progress Bar */
.progress-bar {
  position: relative;
  height: 16px;
  width: 100%;
}

.progress-bg {
  position: absolute;
  inset: 0;
  background: #4b4847;
  border-radius: 8px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: #81b64c;
  border-radius: 10px;
  transition: width 500ms cubic-bezier(0, 0, 0.2, 1);
}

.progress-fill.skip-transition {
  transition: none;
}
</style>
