<script setup>
import { ref } from 'vue'
import { CcButton, CcIcon } from '@chesscom/design-system'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  skillName: {
    type: String,
    default: 'Queen Sacrifice'
  },
  skillDescription: {
    type: String,
    default: 'A tactical move where you deliberately give up your queen to gain a decisive advantage, often leading to checkmate or winning material back.'
  },
  skillImage: {
    type: String,
    default: ''
  },
  lottieFile: {
    type: String,
    default: null
  },
  showShareButton: {
    type: Boolean,
    default: false
  },
  contentVisible: {
    type: Boolean,
    default: true
  }
})

// Expose container ref for parent to mount Lottie
const lottieContainer = ref(null)
defineExpose({ lottieContainer })

const emit = defineEmits(['close', 'continue', 'share'])

function handleClose() {
  emit('close')
}

function handleContinue() {
  emit('continue')
}

function handleShare() {
  emit('share')
}
</script>

<template>
  <!-- Overlay -->
  <Transition name="overlay">
    <div v-if="visible" class="modal-overlay"></div>
  </Transition>
  
  <!-- Modal -->
  <Transition name="modal-slide">
    <div v-if="visible" class="skill-unlocked-modal">
      <!-- Status Bar placeholder -->
      <div class="status-bar-space"></div>
      
      <!-- Close Button -->
      <button class="close-button" @click="handleClose">
        <CcIcon name="mark-cross" :size="16" />
      </button>
      
      <!-- Content -->
      <div class="modal-content">
        <div class="main-content">
          <!-- Skill Image or Lottie Animation -->
          <div class="skill-image-container" :class="{ 'content-hidden': !contentVisible }">
            <img 
              v-if="skillImage" 
              :src="skillImage" 
              :alt="skillName"
              class="skill-image"
            />
            <div v-else class="skill-image-placeholder">
              <div v-if="lottieFile" ref="lottieContainer" class="lottie-container"></div>
            </div>
          </div>
          
          <!-- Text Content -->
          <div class="text-content" :class="{ 'content-hidden': !contentVisible }">
            <div class="headline-container">
              <h1 class="skill-title">{{ skillName }}</h1>
            </div>
            <p class="skill-description">{{ skillDescription }}</p>
          </div>
        </div>
        
        <!-- CTA Buttons -->
        <div class="cta-container" :class="{ 'two-buttons': showShareButton }">
          <template v-if="showShareButton">
            <CcButton variant="primary" size="x-large" class="share-btn" @click="handleShare">
              Share
            </CcButton>
            <CcButton variant="ghost" size="medium" class="continue-btn" @click="handleContinue">
              Continue
            </CcButton>
          </template>
          <CcButton v-else variant="primary" size="x-large" class="continue-btn" @click="handleContinue">
            Continue
          </CcButton>
        </div>
      </div>
      
      <!-- Home Indicator -->
      <div class="home-indicator">
        <div class="indicator-bar"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.skill-unlocked-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #312e2b 0%, #262421 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  overflow: hidden;
  transform: translateY(0);
  will-change: transform;
}

.status-bar-space {
  height: 47px;
  width: 100%;
  flex-shrink: 0;
}

.close-button {
  position: absolute;
  top: 47px;
  right: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 1);
  padding: 12px;
}

.close-button:hover {
  opacity: 0.8;
}

.modal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  max-width: 460px;
  width: 100%;
  padding-bottom: 24px;
  min-height: 0;
}

.skill-image-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  max-height: 366px;
  opacity: 1;
  transition: opacity 200ms cubic-bezier(0, 0, 0.4, 1);
}

.skill-image-container.content-hidden {
  opacity: 0;
}

.skill-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.skill-image-placeholder {
  width: 100%;
  height: 100%;
  background: #3d3a36;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Remove background when there's content inside */
.skill-image-placeholder:has(.lottie-container) {
  background: transparent;
}

.lottie-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 500px;
  width: 100%;
  opacity: 1;
  transition: opacity 200ms cubic-bezier(0, 0, 0.4, 1);
}

.text-content.content-hidden {
  opacity: 0;
}

.headline-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.skill-title {
  font-family: 'Chess Sans', sans-serif;
  font-weight: 800;
  font-size: 28px;
  line-height: 32px;
  color: white;
  text-align: center;
  margin: 0;
}

.skill-description {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
}

.cta-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 460px;
  width: 100%;
  padding-bottom: 12px;
}

.cta-container.two-buttons {
  flex-direction: column;
  gap: 8px;
}

.cta-container.two-buttons .share-btn {
  width: 100%;
}

.continue-btn {
  width: 100%;
}

.cta-container.two-buttons .continue-btn {
  width: auto;
}

.home-indicator {
  height: 24px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.indicator-bar {
  width: 134px;
  height: 5px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 100px;
}

/* Overlay */
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

/* Overlay transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 150ms cubic-bezier(0, 0, 0.4, 1);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Modal slide transition */
.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  transform: translateY(100%);
}
</style>
