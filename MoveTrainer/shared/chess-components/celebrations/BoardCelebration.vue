<script setup>
import { ref } from 'vue'

defineProps({
  visible: { type: Boolean, default: false },
  image: { type: String, default: null },
  riveFile: { type: String, default: null }, // When provided, shows canvas instead of image
  title: { type: String, default: 'You Earned a Skill Point' },
  subtitle: { type: String, default: 'Keep reviewing until you master every skill' },
  variant: { type: String, default: 'icon' }, // 'icon' (small) or 'image' (large)
  contentVisible: { type: Boolean, default: true }, // For content fade transitions
})

// Expose canvas ref so parent can initialize Rive
const canvasRef = ref(null)
defineExpose({ canvasRef })
</script>

<template>
  <Transition name="celebration">
    <div v-if="visible" class="board-celebration">
      <div class="celebration-overlay"></div>
      <div class="celebration-container">
        <div class="celebration-content" :class="{ 'content-hidden': !contentVisible }">
          <!-- Rive Animation or Static Image -->
          <div v-if="riveFile || image" class="celebration-image" :class="variant">
            <canvas v-if="riveFile" ref="canvasRef" class="rive-canvas"></canvas>
            <img v-else-if="image" :src="image" :alt="title" />
          </div>
          
          <!-- Text -->
          <div class="celebration-text">
            <h2 class="celebration-title">{{ title }}</h2>
            <p class="celebration-subtitle">{{ subtitle }}</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.board-celebration {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

/* Overlay - fades in first */
.celebration-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.77);
  opacity: 0;
  animation: overlay-fade-in 300ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes overlay-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Content container - fades in AFTER overlay */
.celebration-container {
  display: grid;
  grid-template-columns: 0.5fr 2fr 0.5fr;
  width: 100%;
  position: relative;
  z-index: 1;
  opacity: 0;
  animation: content-fade-in 300ms cubic-bezier(0, 0, 0.4, 1) 300ms forwards;
}

@keyframes content-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.celebration-content {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 1;
  transition: opacity 200ms cubic-bezier(0, 0, 0.4, 1);
}

.celebration-content.content-hidden {
  opacity: 0;
}

/* Default: icon variant (smaller square image) */
.celebration-image {
  position: relative;
  width: 33.33%;
  aspect-ratio: 1;
}

/* Image variant (larger image for "You Earned a Skill Point") */
.celebration-image.image {
  width: 100%;
  max-width: 360px;
  max-height: 270px;
  aspect-ratio: 720 / 540;
}

.celebration-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.celebration-image .rive-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: scale(1.2);
}

.celebration-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  text-shadow: 0px 2px 0px rgba(0, 0, 0, 0.2);
}

.celebration-title {
  font-family: 'Chess Sans', system-ui, sans-serif;
  font-weight: 800;
  font-size: 28px;
  line-height: 32px;
  color: white;
  margin: 0;
  text-wrap: balance;
}

.celebration-subtitle {
  font-family: 'SF Pro', system-ui, sans-serif;
  font-weight: 590;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  text-wrap: balance;
}

/* Vue Transition - for fade out */
.celebration-leave-active .celebration-overlay {
  animation: overlay-fade-out 300ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

.celebration-leave-active .celebration-container {
  animation: content-fade-out 200ms cubic-bezier(0, 0, 0.4, 1) forwards;
}

@keyframes overlay-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes content-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.celebration-leave-active {
  transition: opacity 300ms cubic-bezier(0, 0, 0.4, 1);
}

.celebration-leave-to {
  opacity: 0;
}
</style>
