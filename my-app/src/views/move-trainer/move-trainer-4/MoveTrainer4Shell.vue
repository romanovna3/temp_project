<script setup>
/**
 * Move Trainer 4 — assisted quiz flow (see OpeningCoursesV3 `isMoveTrainer4`).
 * Same persistent shell pattern as Move Trainer 3.
 */
import { RouterView } from 'vue-router'
import OpeningCoursesV3 from '../../OpeningCoursesV3.vue'
</script>

<template>
  <OpeningCoursesV3 />
  <RouterView />
</template>
