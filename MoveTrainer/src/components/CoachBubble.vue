<script setup>
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { CcIcon } from '@chesscom/design-system'
import { useTypewriter } from '../composables/useTypewriter.js'

const base = import.meta.env.BASE_URL

const props = defineProps({
  headerIcon: { type: String, default: '' },
  headerText: { type: String, default: '' },
  evalText: { type: String, default: '' },
  whiteAdvantage: { type: Boolean, default: true },
  message: { type: String, default: '' },
  showTip: { type: Boolean, default: true },
  startPosition: { type: Boolean, default: false },
  typewriter: { type: Boolean, default: false },
})

const bubbleRef = ref(null)

const iconName = computed(() => props.headerIcon)
const avatarSrc = `${base}icons/misc/coach-avatar.svg`
const tipSrc = `${base}icons/misc/bubble-tip.svg`

const contentRef = ref(null)

function updateScrollFades() {
  const el = contentRef.value
  const bubble = bubbleRef.value
  if (!el || !bubble) return

  const isScrollable = el.scrollHeight - el.clientHeight > 1
  if (!isScrollable) {
    bubble.style.setProperty('--top-opacity', '0')
    bubble.style.setProperty('--bottom-opacity', '0')
    return
  }

  const isAtTop = el.scrollTop === 0
  const isAtBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 1
  bubble.style.setProperty('--top-opacity', isAtTop ? '0' : '1')
  bubble.style.setProperty('--bottom-opacity', isAtBottom ? '0' : '1')
}

watch([() => props.message, () => props.headerText], async () => {
  await nextTick()
  updateScrollFades()
})

onMounted(() => {
  nextTick(() => updateScrollFades())
})

const typewriterResult = props.typewriter
  ? useTypewriter(() => props.message, { autoStart: true })
  : null
</script>

<template>
  <div class="coach-container" :class="{ 'start-position': startPosition }">
    <!-- Coach Avatar (always visible) -->
    <div class="coach-avatar">
      <img :src="avatarSrc" alt="Coach" />
    </div>
    
    <div class="bubble-wrapper">
      <div ref="bubbleRef" class="bubble">
        <div v-if="showTip" class="tip">
          <img :src="tipSrc" alt="" />
        </div>
        
        <div ref="contentRef" class="bubble-content" @scroll="updateScrollFades">
          <div v-if="headerText" class="bubble-header">
            <div class="classification">
              <cc-icon v-if="iconName" :name="iconName" variant="color" class="classification-icon" />
              <span class="classification-text">{{ headerText }}</span>
            </div>
            <div v-if="evalText" class="eval-badge" :class="{ 'white-advantage': whiteAdvantage, 'black-advantage': !whiteAdvantage }">
              <span>{{ evalText }}</span>
            </div>
          </div>
          
          <p v-if="typewriter && typewriterResult" class="coach-message" v-html="typewriterResult.displayedText.value" />
          <p v-else-if="message" class="coach-message">{{ message }}</p>
          
          <p v-if="!headerText && !message" class="empty">No message</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coach-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0;
  width: 100%;
  height: var(--coach-container-height, 116px);
}

.coach-avatar {
  width: var(--coach-avatar-size, 80px);
  height: var(--coach-avatar-size, 80px);
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 3px;
}

.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  margin-left: -6px;
  display: flex;
  align-items: flex-start;
}

.bubble {
  --top-opacity: 0;
  --bottom-opacity: 0;
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
}

.bubble::before,
.bubble::after {
  content: '';
  height: 4rem;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  z-index: 1;
}

.bubble::before {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 10px;
  opacity: var(--top-opacity);
  top: 0;
}

.bubble::after {
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 10px;
  bottom: 0;
  opacity: var(--bottom-opacity);
}

.tip {
  position: absolute;
  left: -13px;
  top: var(--coach-tip-top, 50px);
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
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  min-height: 96px;
  max-height: var(--bubble-max-height, 116px);
  overflow-y: scroll;
  scrollbar-width: none;
}

.bubble-content:has(.bubble-header) {
  justify-content: flex-start;
}

.bubble-content:not(:has(.bubble-header)) {
  justify-content: center;
}

.bubble-content::-webkit-scrollbar {
  display: none;
}

.bubble-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
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
  border-radius: 5px;
  padding: 4px 8px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 24px;
  box-sizing: border-box;
}

.eval-badge.white-advantage {
  background: #e8e6e3;
}

.eval-badge.black-advantage {
  background: #d97b38;
}

.eval-badge span {
  font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
}

.eval-badge.white-advantage span {
  color: #312e2b;
}

.eval-badge.black-advantage span {
  color: #ffffff;
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

.start-position .bubble-wrapper {
  height: var(--coach-avatar-size, 80px);
  align-items: flex-end;
}

.start-position .bubble-content {
  min-height: 64px;
}

.start-position .tip {
  top: auto;
  bottom: var(--coach-tip-bottom, 2px);
}
</style>
