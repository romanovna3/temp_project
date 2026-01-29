<script setup>
import { computed } from 'vue'
import { CcIcon } from '@chesscom/design-system'

const base = import.meta.env.BASE_URL

const props = defineProps({
  state: { type: String, default: '' },
  headerText: { type: String, default: '' },
  moveNotation: { type: String, default: '' },
  message: { type: String, default: '' },
  showTip: { type: Boolean, default: true },
})

const displayHeaderText = computed(() => {
  if (props.headerText) return props.headerText
  switch (props.state) {
    case 'white-to-move':
      return 'White to move'
    case 'black-to-move':
      return 'Black to move'
    case 'correct':
      return props.moveNotation ? `${props.moveNotation} is correct` : 'Correct!'
    case 'incorrect':
      return props.moveNotation ? `${props.moveNotation} is incorrect` : 'Incorrect'
    default:
      return ''
  }
})

const showStateIndicator = computed(() => {
  return ['white-to-move', 'black-to-move', 'correct', 'incorrect'].includes(props.state)
})

const avatarSrc = `${base}icons/misc/coach-avatar.svg`
const tipSrc = `${base}icons/misc/bubble-tip.svg`
</script>

<template>
  <div class="coach-container">
    <div class="coach-avatar">
      <img :src="avatarSrc" alt="" />
    </div>
    <div class="bubble">
      <img v-if="showTip" :src="tipSrc" alt="" class="tip" aria-hidden="true" />
      <div class="bubble-content">
        <div class="bubble-header">
          <div class="classification">
            <span
              v-if="showStateIndicator && (state === 'white-to-move' || state === 'black-to-move')"
              class="color-indicator"
              :class="state === 'white-to-move' ? 'white-indicator' : 'black-indicator'"
            />
            <CcIcon
              v-if="showStateIndicator && state === 'correct'"
              name="mark-check"
              class="state-icon correct-icon"
              :size="24"
            />
            <CcIcon
              v-if="showStateIndicator && state === 'incorrect'"
              name="mark-cross"
              class="state-icon incorrect-icon"
              :size="24"
            />
            <span class="classification-text">{{ displayHeaderText }}</span>
          </div>
        </div>
        <p v-if="message" class="coach-message">{{ message }}</p>
        <p v-else class="coach-message empty">No message</p>
      </div>
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
  min-height: 128px;
}

.coach-avatar {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 5px;
}

.coach-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bubble {
  position: relative;
  flex: 1;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
  margin-left: -6px;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
}

.tip {
  position: absolute;
  left: -13px;
  bottom: 20px;
  width: 14px;
  height: 22px;
  z-index: 1;
  object-fit: contain;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
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

.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 2px solid #8b8987;
  flex-shrink: 0;
}

.white-indicator {
  background: white;
}

.black-indicator {
  background: black;
}

.state-icon {
  flex-shrink: 0;
}

.correct-icon {
  color: #81B64C;
}

.incorrect-icon {
  color: #E02828;
}

.classification-text {
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

.coach-message {
  margin: 0;
  font-family: var(--font-family-system, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #312e2b;
}

.empty {
  color: #9a9a9a;
}
</style>
