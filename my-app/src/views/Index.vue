<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()

// Folder view: when true, show only folder contents with folder header + back button
const folderViewActive = ref(false)
const folderName = 'Previous versions'

// Items inside the folder (clicking folder shows ONLY these cards) – previous chapter page versions
const folderItems = [
  { path: '/courses', title: 'Chapter Page V1', versionKey: 'v1' },
  { path: '/courses/v2', title: 'Chapter Page V2', versionKey: 'v2' },
  { path: '/courses/v2.2', title: 'Chapter Page V2.2', versionKey: 'v22' },
  { path: '/courses/v2.3', title: 'Chapter Page V2.3', versionKey: 'v23' },
  { path: '/courses/v2.4', title: 'Chapter Page V2.4', versionKey: 'v24' },
  { path: '/courses/v3', title: 'Chapter Page V3', versionKey: 'v3' },
]
const folderItemsCount = computed(() => folderItems.length)

function openFolder() {
  folderViewActive.value = true
}
function closeFolder() {
  folderViewActive.value = false
}

// Build time injected by Vite at build time (replaced at build)
const buildTime =
  typeof __BUILD_TIME__ !== 'undefined' && __BUILD_TIME__
    ? __BUILD_TIME__
    : new Date().toISOString()

// All cards show last deployed time (build time injected at build)
const versionLastEdited = {
  v1: buildTime,
  v2: buildTime,
  v22: buildTime,
  v23: buildTime,
  v24: buildTime,
  v3: buildTime,
  v4: buildTime,
  v5: buildTime,
  v6: buildTime,
  v7: buildTime,
}

function getEditedAgo(isoString) {
  if (!isoString || typeof isoString !== 'string') return 'Edited recently'
  const then = new Date(isoString)
  if (Number.isNaN(then.getTime())) return 'Edited recently'
  const now = new Date()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMs < 0) return 'Edited just now'
  if (diffMins < 1) return 'Edited just now'
  if (diffMins < 60) return `Edited ${diffMins} min ago`
  if (diffHours < 24) return `Edited ${diffHours}h ago`
  if (diffDays < 7) return `Edited ${diffDays} days ago`
  return `Edited ${then.toLocaleDateString()}`
}

function editedAgoFor(version) {
  return getEditedAgo(versionLastEdited[version] ?? buildTime)
}
</script>

<template>
  <div class="index-page app dark-mode">
    <div class="index-layout">
      <main class="index-main">
        <!-- Chapter page section: folder card above headline; click shows only folder contents + header with back -->
        <section class="index-section">
          <!-- Folder card: above "Chapter page" headline; click opens folder view -->
          <article
            v-if="!folderViewActive"
            class="folder-card"
            role="button"
            tabindex="0"
            :aria-label="`${folderName}, ${folderItemsCount} pages`"
            @click="openFolder()"
            @keydown.enter.prevent="openFolder()"
            @keydown.space.prevent="openFolder()"
          >
            <span class="folder-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6a2 2 0 0 1 2-2h3.5a1 1 0 0 1 .7.3l1.6 1.6a1 1 0 0 0 .7.3H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z" fill="#E8A84A" stroke="#D4953A" stroke-width="1.2" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="folder-card__label">1. {{ folderName }}</span>
            <span class="folder-card__count">{{ folderItemsCount }}</span>
          </article>

          <!-- Folder view: header (back + folder name) + only folder cards -->
          <template v-if="folderViewActive">
            <header class="folder-view-header">
              <button
                type="button"
                class="folder-view-back"
                aria-label="Back"
                @click="closeFolder()"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 class="folder-view-title">{{ folderName }}</h2>
            </header>
            <div class="project-cards">
              <article
                v-for="item in folderItems"
                :key="item.path"
                class="project-card"
                role="button"
                tabindex="0"
                @click="router.push(item.path)"
                @keydown.enter="router.push(item.path)"
                @keydown.space.prevent="router.push(item.path)"
              >
                <div class="project-card__upper">
                  <div class="project-card__pattern" aria-hidden="true" />
                  <div class="project-card__meta">
                    <div class="project-card__head">
                      <img src="/icons/book-mark-aqua.png" alt="" class="project-card__icon" width="32" height="32" />
                      <h2 class="project-card__title">{{ item.title }}</h2>
                    </div>
                  </div>
                </div>
                <div class="project-card__lower">
                  <div class="project-card__footer-left">
                    <span class="project-card__footer-icon" aria-hidden="true" title="Open">
                      <svg class="project-card__footer-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div class="project-card__footer-labels">
                      <span class="project-card__footer-title">{{ item.title }}</span>
                      <span class="project-card__footer-time">{{ editedAgoFor(item.versionKey) }}</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </template>

          <!-- Main view: "Chapter page" headline + V2.4 (Real course), V6, and V7; V4 and V5 hidden -->
          <template v-else>
            <h2 class="index-section__title">Chapter page</h2>
            <div class="project-cards">
              <article
                class="project-card"
                role="button"
                tabindex="0"
                @click="router.push('/courses/v2.4')"
                @keydown.enter="router.push('/courses/v2.4')"
                @keydown.space.prevent="router.push('/courses/v2.4')"
              >
                <div class="project-card__upper">
                  <div class="project-card__pattern" aria-hidden="true" />
                  <div class="project-card__meta">
                    <div class="project-card__head">
                      <img
                        src="/icons/book-mark-aqua.png"
                        alt=""
                        class="project-card__icon"
                        width="32"
                        height="32"
                      />
                      <h2 class="project-card__title">Chapter Page V2.4</h2>
                    </div>
                  </div>
                </div>
                <div class="project-card__lower">
                  <div class="project-card__footer-left">
                    <span class="project-card__footer-icon" aria-hidden="true" title="Open">
                      <svg class="project-card__footer-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div class="project-card__footer-labels">
                      <span class="project-card__footer-title">Chapter Page V2.4</span>
                      <span class="project-card__footer-time">{{ editedAgoFor('v24') }}</span>
                    </div>
                  </div>
                </div>
              </article>
              <article
                class="project-card"
                role="button"
                tabindex="0"
                @click="router.push('/courses/v6')"
                @keydown.enter="router.push('/courses/v6')"
                @keydown.space.prevent="router.push('/courses/v6')"
              >
                <div class="project-card__upper">
                  <div class="project-card__pattern" aria-hidden="true" />
                  <div class="project-card__meta">
                    <div class="project-card__head">
                      <img
                        src="/icons/book-mark-aqua.png"
                        alt=""
                        class="project-card__icon"
                        width="32"
                        height="32"
                      />
                      <h2 class="project-card__title">Chapter Page V6</h2>
                    </div>
                  </div>
                </div>
                <div class="project-card__lower">
                  <div class="project-card__footer-left">
                    <span class="project-card__footer-icon" aria-hidden="true" title="Open">
                      <svg class="project-card__footer-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div class="project-card__footer-labels">
                      <span class="project-card__footer-title">Chapter Page V6</span>
                      <span class="project-card__footer-time">{{ editedAgoFor('v6') }}</span>
                    </div>
                  </div>
                </div>
              </article>
              <article
                class="project-card"
                role="button"
                tabindex="0"
                @click="router.push('/courses/v7')"
                @keydown.enter="router.push('/courses/v7')"
                @keydown.space.prevent="router.push('/courses/v7')"
              >
                <div class="project-card__upper">
                  <div class="project-card__pattern" aria-hidden="true" />
                  <div class="project-card__meta">
                    <div class="project-card__head">
                      <img
                        src="/icons/book-mark-aqua.png"
                        alt=""
                        class="project-card__icon"
                        width="32"
                        height="32"
                      />
                      <h2 class="project-card__title">Chapter Page V7</h2>
                    </div>
                  </div>
                </div>
                <div class="project-card__lower">
                  <div class="project-card__footer-left">
                    <span class="project-card__footer-icon" aria-hidden="true" title="Open">
                      <svg class="project-card__footer-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div class="project-card__footer-labels">
                      <span class="project-card__footer-title">Chapter Page V7</span>
                      <span class="project-card__footer-time">{{ editedAgoFor('v7') }}</span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </template>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
.index-page {
  min-height: 100vh;
  background: var(--color-bg-primary, #312e2b);
  color: var(--color-text-default, #fff);
}
.index-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-24, 24px);
}
.index-main {
  width: 100%;
  max-width: 1144px;
  display: flex;
  flex-direction: column;
  gap: var(--space-32, 32px);
}
.index-section__title {
  margin: 0 0 var(--space-16, 16px);
  font-size: 14px;
  font-weight: 600;
  font-family: "SF Compact Display", sans-serif;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.index-section:first-child .index-section__title {
  margin-top: 0;
}
.project-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-24, 24px);
  justify-content: flex-start;
}
.project-card {
  flex: 0 0 360px;
}

/* Folder card: horizontal bar above course cards (icon + label + count) */
.folder-card {
  display: flex;
  align-items: center;
  gap: var(--space-12, 12px);
  width: 100%;
  max-width: 360px;
  padding: var(--space-12, 12px) var(--space-16, 16px);
  margin-bottom: var(--space-16, 16px);
  border-radius: var(--radius-lg, 8px);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: background 0.15s ease, border-color 0.15s ease;
}
.folder-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.15);
}
.folder-card:focus-visible {
  outline: 2px solid var(--color-aqua-300, #26C2A3);
  outline-offset: 2px;
}
.folder-card__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}
.folder-card__icon svg {
  width: 100%;
  height: 100%;
}
.folder-card__label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
}
.folder-card__count {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
}

/* Folder view: header with back button + folder name */
.folder-view-header {
  display: flex;
  align-items: center;
  gap: var(--space-12, 12px);
  margin-bottom: var(--space-16, 16px);
}
.folder-view-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-md, 6px);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background 0.15s ease;
}
.folder-view-back:hover {
  background: rgba(255, 255, 255, 0.14);
}
.folder-view-back:focus-visible {
  outline: 2px solid var(--color-aqua-300, #26C2A3);
  outline-offset: 2px;
}
.folder-view-back svg {
  width: 24px;
  height: 24px;
}
.folder-view-title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: rgba(255, 255, 255, 1);
}

/* Card – Figma-style outline, no button */
.project-card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl, 12px);
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-primary, #312e2b);
  border: 1px solid rgba(255, 255, 255, 0.10);
  transition: border-color 0.15s ease;
}
.project-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}
.project-card:focus-visible {
  outline: 2px solid var(--color-aqua-300, #26C2A3);
  outline-offset: 2px;
}

/* Upper section – chess cover image as background */
.project-card__upper {
  position: relative;
  padding: var(--space-16, 16px);
  min-height: 120px;
  background: var(--color-bg-primary, #312e2b) url(/cover-card.png) center / cover no-repeat;
}
.project-card__pattern {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.15) 100%);
}
.project-card__meta {
  position: relative;
  z-index: 1;
}
.project-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-12, 12px);
}
.project-card__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}
.project-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  font-family: "SF Compact Display", sans-serif;
  color: rgba(255, 255, 255, 1);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

/* Footer – Figma layout: icon + title + “Edited X ago” */
.project-card__lower {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 var(--space-16, 16px);
  background: var(--color-bg-subtlest, rgba(255, 255, 255, 0.06));
  border-top: 1px solid var(--color-border-subtlest, rgba(255, 255, 255, 0.08));
}
.project-card__footer-left {
  display: flex;
  align-items: center;
  gap: var(--space-8, 8px);
  min-width: 0;
}
.project-card__footer-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
/* White frame with arrow in background color (cutout look) */
.project-card__footer-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm, 4px);
  background: rgba(255, 255, 255, 0.75);
  transition: background 0.15s ease;
}
.project-card:hover .project-card__footer-icon {
  background: rgba(255, 255, 255, 1);
}
.project-card__footer-icon-svg {
  width: 14px;
  height: 14px;
  color: #312e2b;
}
.project-card__footer-title {
  display: block;
  font-size: 12px;
  font-weight: 400;
  font-family: "SF Compact Display", sans-serif;
  color: rgba(255, 255, 255, 1);
}
.project-card__footer-time {
  display: block;
  font-size: 10px;
  font-weight: 200;
  font-family: "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif;
  color: rgba(255, 255, 255, 0.65);
}

</style>
