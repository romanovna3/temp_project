<script setup>
/**
 * Single persistent shell for Move Trainer 3 intro + Play Move URLs.
 * Keeps one OpeningCoursesV3 instance so board state survives route changes (e.g. after animating 1.d4).
 */
import { RouterView } from 'vue-router'
import OpeningCoursesV3 from '../../OpeningCoursesV3.vue'
</script>

<template>
  <OpeningCoursesV3 />
  <!-- Nested route records only switch URL meta; no second board shell -->
  <RouterView />
</template>
