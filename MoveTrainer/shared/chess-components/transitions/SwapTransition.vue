<template>
  <transition
    appear
    :enter-active-class="$style['enter-active']"
    :leave-active-class="$style['leave-active']"
    :enter-from-class="$style['enter-start']"
    :enter-to-class="$style['enter-end']"
    :leave-from-class="$style['leave-start']"
    :leave-to-class="$style['leave-end']"
    @after-leave="onAfterLeave"
  >
    <slot v-if="showContent" />
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  animationKey: { type: String, default: '' },
})

const emit = defineEmits(['after-leave'])

const showContent = ref(true)

function onAfterLeave() {
  showContent.value = true
  emit('after-leave')
}

watch(
  () => props.animationKey,
  () => {
    showContent.value = !props.animationKey
  },
)
</script>

<style module>
.enter-active,
.leave-active {
  transition: 
    opacity var(--motion-steady) var(--motion-ease-out-gentle),
    transform var(--motion-steady) var(--motion-ease-out-gentle);
}

.enter-start {
  opacity: 0;
  transform: translateX(-2rem);
}

.enter-end,
.leave-start {
  opacity: 1;
  transform: translateX(0);
}

.leave-end {
  opacity: 0;
  transform: translateY(-3rem);
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .enter-active,
  .leave-active {
    transition: opacity var(--motion-steady) var(--motion-ease-out-gentle);
  }

  .enter-start,
  .enter-end,
  .leave-start,
  .leave-end {
    transform: none;
  }
}
</style>
