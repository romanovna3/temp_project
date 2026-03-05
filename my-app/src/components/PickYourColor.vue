<!-- Entry point: uses V2. To use V1 or V3, import PickYourColorV1 or PickYourColorV3 below. -->
<template>
  <PickYourColorV2
    :model-value="modelValue"
    :disabled="disabled"
    :play-side-only="playSideOnly"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import PickYourColorV2 from './PickYourColorV2.vue'
defineOptions({ name: 'PickYourColor' })
defineProps({
  modelValue: { type: String, default: 'white' },
  disabled: { type: Boolean, default: false },
  /** 'white' | 'black' = single-color mode: label + icon only, no chevron, no dropdown */
  playSideOnly: { type: String, default: null },
})
defineEmits(['update:modelValue'])
</script>
