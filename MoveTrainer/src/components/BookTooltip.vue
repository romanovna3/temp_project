<script setup>
defineProps({
  opening: { type: Object, required: true },
})
</script>

<template>
  <div class="book-tooltip">
    <div class="tooltip-body">
      <div class="opening-info">
        <span class="opening-name">{{ opening.name }}</span>
        <span class="opening-stats">{{ opening.stats }}</span>
      </div>
      <div v-if="opening.course" class="course-card">
        <img :src="opening.course.image" :alt="opening.course.title" class="course-image" />
        <div class="course-info">
          <span class="course-title">{{ opening.course.title }}</span>
          <span class="course-subtitle">{{ opening.course.subtitle }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-tooltip {
  position: relative;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.tooltip-body {
  position: relative;
  width: 275px;
  background: var(--color-bg-opaque-lighter, #312e2b);
  box-shadow: inset 0 0 0 1px var(--color-border-default, rgba(255, 255, 255, 0.08));
  border-radius: var(--radius-l, 5px);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Left-center arrow */
.tooltip-body::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: var(--color-bg-opaque-lighter, #312e2b);
}

.opening-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.opening-name {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: white;
}

.opening-stats {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
}

.course-card {
  display: flex;
  align-items: center;
  gap: var(--space-8, 8px);
  background: var(--color-bg-subtle, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-l, 5px);
  padding: var(--space-8, 8px);
  padding-right: var(--space-12, 12px);
  cursor: pointer;
  transition: background 0.15s ease;
}

.course-card:hover {
  background: var(--color-bg-subtler, rgba(255, 255, 255, 0.15));
}

.course-image {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-m, 3px);
  object-fit: cover;
  flex-shrink: 0;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.course-title {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-boldest, white);
  white-space: nowrap;
}

.course-subtitle {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: var(--color-text-subtle, rgba(255, 255, 255, 0.5));
  white-space: nowrap;
}
</style>
