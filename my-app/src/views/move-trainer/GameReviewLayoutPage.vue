<script setup>
import { provide } from 'vue'
import GameReviewApp from '@move-trainer/App.vue'

provide('design-system-key', {
  trans: { Back: 'Back', Close: 'Close' },
  routes: { webMemberView: () => '#' },
})
</script>

<template>
  <GameReviewApp />
</template>
