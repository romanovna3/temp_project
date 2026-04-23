<script setup>
import { provide } from 'vue'
import MoveTrainerView from '@move-trainer/views/MoveTrainerView.vue'

provide('design-system-key', {
  trans: { Back: 'Back', Close: 'Close' },
  routes: { webMemberView: () => '#' },
})
</script>

<template>
  <MoveTrainerView />
</template>
