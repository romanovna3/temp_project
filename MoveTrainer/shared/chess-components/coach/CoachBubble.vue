<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  // Content props
  headerIcon: { type: String, default: '' },
  headerText: { type: String, default: '' },
  evalText: { type: String, default: '' },
  message: { type: String, default: '' },
  showTip: { type: Boolean, default: true },
  visible: { type: Boolean, default: true },
  
  // Asset path props (configurable for different project setups)
  avatarSrc: { type: String, default: './assets/coach-avatar.png' },
  tipSrc: { type: String, default: './assets/bubble-tip.svg' },
  defaultIconSrc: { type: String, default: '' },
})

const emit = defineEmits(['after-leave'])

// Ref for measuring bubble element
const bubbleRef = ref(null)

// Use headerIcon if provided, otherwise fall back to defaultIconSrc
const iconSrc = computed(() => props.headerIcon || props.defaultIconSrc)

// Preserve wrapper height when bubble hides to prevent layout shift
const preservedHeight = ref(null)

watch(() => props.visible, (newVal, oldVal) => {
  // When hiding, capture current height to preserve space (keep max height)
  if (!newVal && oldVal && bubbleRef.value) {
    const currentHeight = bubbleRef.value.offsetHeight
    // Keep the maximum height to prevent shrinkage when shorter content fades out
    preservedHeight.value = Math.max(currentHeight, preservedHeight.value || 0)
  }
})

function onAfterLeave() {
  emit('after-leave')
}
</script>

<template>
  <div class="coach-container">
    <!-- Coach Avatar (always visible) -->
    <div class="coach-avatar">
      <img :src="avatarSrc" alt="Coach" />
    </div>
    
    <!-- Bubble wrapper maintains space even when bubble is hidden -->
    <div class="bubble-wrapper" :style="preservedHeight ? { minHeight: preservedHeight + 'px' } : {}">
      <!-- Speech Bubble with transition -->
      <Transition
        name="bubble"
        @after-leave="onAfterLeave"
      >
        <div v-if="visible" ref="bubbleRef" class="bubble">
          <!-- Tip pointing to avatar -->
          <div v-if="showTip" class="tip">
            <img :src="tipSrc" alt="" />
          </div>
          
          <div class="bubble-content">
            <!-- Header with classification + eval -->
            <div v-if="headerText" class="bubble-header">
              <div class="classification">
                <img v-if="iconSrc" :src="iconSrc" alt="" class="classification-icon" />
                <span class="classification-text">{{ headerText }}</span>
              </div>
              <div v-if="evalText" class="eval-badge">
                <span>{{ evalText }}</span>
              </div>
            </div>
            
            <!-- Coach message -->
            <p v-if="message" class="coach-message">{{ message }}</p>
            
            <!-- Fallback for empty -->
            <p v-if="!headerText && !message" class="empty">No message</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.coach-container {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0;
  width: 100%;
  min-height: 96px;
}

.coach-avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 3px;
}

.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Wrapper maintains space when bubble is hidden */
.bubble-wrapper {
  position: relative;
  flex: 1;
  max-width: 275px;
  min-height: 80px;
  margin-left: -6px;
  display: flex;
  align-items: flex-end;
}

.bubble {
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
}

/* Bubble transition animations */
.bubble-enter-active,
.bubble-leave-active {
  transition: 
    opacity var(--motion-steady, 300ms) var(--motion-ease-out-gentle, cubic-bezier(0.2, 0, 0, 1)),
    transform var(--motion-steady, 300ms) var(--motion-ease-out-gentle, cubic-bezier(0.2, 0, 0, 1));
}

.bubble-enter-from {
  opacity: 0;
  transform: translateX(-2rem);
}

.bubble-enter-to,
.bubble-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.bubble-leave-to {
  opacity: 0;
  transform: translateY(-3rem);
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .bubble-enter-active,
  .bubble-leave-active {
    transition: opacity var(--motion-steady, 300ms) var(--motion-ease-out-gentle, cubic-bezier(0.2, 0, 0, 1));
  }

  .bubble-enter-from,
  .bubble-enter-to,
  .bubble-leave-from,
  .bubble-leave-to {
    transform: none;
  }
}

.tip {
  position: absolute;
  left: -13px;
  bottom: 20px;
  width: 14px;
  height: 22px;
  z-index: 1;
}

.tip img {
  width: 100%;
  height: 100%;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  min-height: 64px;
}

.bubble-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.classification {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.classification-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.classification-text {
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

.eval-badge {
  background: #4b4847;
  border-radius: 5px;
  padding: 4px 8px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 24px;
  box-sizing: border-box;
}

.eval-badge span {
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: #e7e6e5;
  white-space: nowrap;
}

.coach-message {
  margin: 0;
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  color: #312e2b;
}

.empty {
  margin: 0;
  color: #9a9a9a;
  font-size: 14px;
}
</style>
