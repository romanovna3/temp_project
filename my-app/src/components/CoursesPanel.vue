<script setup>
import { CcCard, CcIcon, CcIconButton } from '@chesscom/design-system'

// Placeholder data – replace with real data or add more as design grows
const courses = [
  {
    id: 1,
    title: "The Master's Hand: Capablanca's Endgame Technique",
    instructor: 'GM Alex Colovich',
    badge: 'GOTHAMCHESS',
  },
  {
    id: 2,
    title: 'Opening Fundamentals',
    instructor: 'IM Danny Rensch',
    badge: 'CHESS.COM',
  },
]
</script>

<template>
  <aside class="courses-panel" aria-label="Courses">
    <header class="courses-header">
      <CcIcon name="document-book-blank" size="large" />
      <h2 class="courses-title">Courses</h2>
    </header>

    <div class="courses-content">
      <CcCard
        v-for="course in courses"
        :key="course.id"
        padding="medium"
        class="course-card"
      >
        <div class="course-card-inner">
          <div class="course-thumbnail" aria-hidden="true" />
          <div class="course-info">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-instructor">{{ course.instructor }}</p>
            <span class="course-badge">{{ course.badge }}</span>
          </div>
        </div>
      </CcCard>
      <!-- More course components will go here as you add them from the design -->
    </div>

    <footer class="courses-footer">
      <CcIconButton
        :icon="{ name: 'mark-ellipsis-horizontal', variant: 'glyph' }"
        variant="ghost"
        size="small"
        aria-label="More options"
      />
      <CcIconButton
        :icon="{ name: 'utility-cogwheel', variant: 'glyph' }"
        variant="ghost"
        size="small"
        aria-label="Settings"
      />
      <div class="courses-footer-nav">
        <CcIconButton
          :icon="{ name: 'arrow-chevron-double-left', variant: 'glyph' }"
          variant="ghost"
          size="small"
          aria-label="Previous"
        />
        <CcIconButton
          :icon="{ name: 'arrow-chevron-double-right', variant: 'glyph' }"
          variant="ghost"
          size="small"
          aria-label="Next"
        />
      </div>
    </footer>
  </aside>
</template>

<style scoped>
.courses-panel {
  display: flex;
  flex-direction: column;
  width: 360px;
  background: var(--color-bg-primary);
  border-left: 1px solid var(--color-border-subtle, var(--color-gray-700));
  overflow: hidden;
}

.courses-header {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-16) var(--space-24);
  border-bottom: 1px solid var(--color-border-subtle, var(--color-gray-700));
}

.courses-title {
  margin: 0;
  font: var(--font-heading-small, inherit);
  font-size: 22px;
  line-height: 28px;
  color: var(--color-text-primary, var(--color-neutrals-white));
}

.courses-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-16) var(--space-24);
  display: flex;
  flex-direction: column;
  gap: var(--space-16);
}

.course-card {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.course-card:hover {
  opacity: 0.9;
}

.course-card :deep(.cc-card) {
  background: var(--color-bg-secondary);
}

.course-card-inner {
  display: flex;
  gap: var(--space-12);
  align-items: flex-start;
}

.course-thumbnail {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  background: var(--color-bg-tertiary);
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  margin: 0 0 var(--space-4);
  font-size: 14px;
  line-height: 1.3;
  color: var(--color-text-primary, var(--color-neutrals-white));
  font-weight: 600;
}

.course-instructor {
  margin: 0 0 var(--space-4);
  font-size: 12px;
  color: var(--color-text-secondary, var(--color-gray-400));
}

.course-badge {
  font-size: 11px;
  color: var(--color-text-tertiary, var(--color-gray-500));
}

.courses-footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-24);
  border-top: 1px solid var(--color-border-subtle, var(--color-gray-700));
  background: var(--color-bg-primary);
}

.courses-footer-nav {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
</style>
