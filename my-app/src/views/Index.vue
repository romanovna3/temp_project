<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ProjectPasswordModal from '../components/ProjectPasswordModal.vue'
import {
  FOLDER_PREVIOUS_VERSIONS_ID,
  isUnlocked,
  tryUnlockWithPassword,
  getPasswordProjectById,
  clearProjectUnlock,
} from '../lib/protectedProjects.js'

const router = useRouter()
const route = useRoute()

/** null = root (folder cards); otherwise which folder is open */
const activeFolder = ref(null)

const passwordModalOpen = ref(false)
const passwordTarget = ref(null)
const passwordError = ref('')

const chapterFolderItems = [
  { path: '/courses/v9', title: 'Chapter Page V9', versionKey: 'v9' },
  { path: '/courses/v10', title: 'Chapter Page V10', versionKey: 'v10' },
]

const openingFolderItems = [
  { path: '/courses/opening-courses-v1', title: 'Opening Courses V1', versionKey: 'openingV1' },
  { path: '/courses/opening-courses-v2', title: 'Opening Courses V2', versionKey: 'openingV2' },
  { path: '/courses/opening-courses-v3', title: 'Opening Courses V3', versionKey: 'openingV3' },
]

/** Same archive list as before, plus Empty page (password-gated folder) */
const previousFolderItems = [
  { path: '/courses', title: 'Chapter Page V1', versionKey: 'v1' },
  { path: '/courses/v2', title: 'Chapter Page V2', versionKey: 'v2' },
  { path: '/courses/v2.2', title: 'Chapter Page V2.2', versionKey: 'v22' },
  { path: '/courses/v2.3', title: 'Chapter Page V2.3', versionKey: 'v23' },
  { path: '/courses/v3', title: 'Chapter Page V3', versionKey: 'v3' },
  { path: '/courses/v7', title: 'Chapter Page V7', versionKey: 'v7' },
  { path: '/empty', title: 'Empty page', versionKey: 'empty' },
]

const currentFolderItems = computed(() => {
  switch (activeFolder.value) {
    case 'chapter':
      return chapterFolderItems
    case 'opening':
      return openingFolderItems
    case 'previous':
      return previousFolderItems
    default:
      return []
  }
})

const currentFolderTitle = computed(() => {
  const titles = {
    chapter: 'Chapter page',
    opening: 'Opening Courses',
    previous: 'Older Versions',
  }
  return titles[activeFolder.value] ?? ''
})

function openFolderChapter() {
  activeFolder.value = 'chapter'
}

function openFolderOpening() {
  activeFolder.value = 'opening'
}

function openPreviousVersionsFolder() {
  passwordError.value = ''
  if (!isUnlocked(FOLDER_PREVIOUS_VERSIONS_ID)) {
    passwordTarget.value = getPasswordProjectById(FOLDER_PREVIOUS_VERSIONS_ID)
    passwordModalOpen.value = true
    return
  }
  activeFolder.value = 'previous'
}

function closeFolderView() {
  if (activeFolder.value === 'previous') {
    clearProjectUnlock(FOLDER_PREVIOUS_VERSIONS_ID)
  }
  activeFolder.value = null
}

function closePasswordModal() {
  passwordModalOpen.value = false
  passwordTarget.value = null
  passwordError.value = ''
  if (route.query.unlock) {
    router.replace({ path: '/', query: {} })
  }
}

function onPasswordSubmit(value) {
  const entry = passwordTarget.value
  if (!entry) return
  if (tryUnlockWithPassword(entry.id, value)) {
    passwordModalOpen.value = false
    passwordError.value = ''
    router.replace({ path: '/', query: {} })
    passwordTarget.value = null
    if (entry.isFolderUnlock) {
      activeFolder.value = 'previous'
      return
    }
    if (entry.path) router.push(entry.path)
    return
  }
  passwordError.value = 'Wrong password.'
}

function openPasswordModalFromQuery() {
  const id = route.query.unlock
  if (!id || typeof id !== 'string') return
  const p = getPasswordProjectById(id)
  if (!p) return
  passwordTarget.value = p
  passwordModalOpen.value = true
  passwordError.value = ''
}

function onIndexMounted() {
  // Fresh lock each visit to home: opening Older Versions always asks for the password again.
  clearProjectUnlock(FOLDER_PREVIOUS_VERSIONS_ID)
  openPasswordModalFromQuery()
}

onMounted(onIndexMounted)
watch(() => route.query.unlock, openPasswordModalFromQuery)

// Build time injected by Vite at build time (replaced at build)
const buildTime =
  typeof __BUILD_TIME__ !== 'undefined' && __BUILD_TIME__
    ? __BUILD_TIME__
    : new Date().toISOString()

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
  v8: buildTime,
  v9: buildTime,
  v10: buildTime,
  openingV1: buildTime,
  openingV2: buildTime,
  openingV3: buildTime,
  empty: buildTime,
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
        <!-- Root: top-level folders -->
        <template v-if="!activeFolder">
          <section class="index-section">
            <h2 class="index-section__title">Projects</h2>
            <div class="folder-cards-row">
              <article
                class="folder-card"
                role="button"
                tabindex="0"
                aria-label="Chapter page folder, 2 pages"
                @click="openFolderChapter"
                @keydown.enter.prevent="openFolderChapter"
                @keydown.space.prevent="openFolderChapter"
              >
                <span class="folder-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 6a2 2 0 0 1 2-2h3.5a1 1 0 0 1 .7.3l1.6 1.6a1 1 0 0 0 .7.3H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"
                      fill="#E8A84A"
                      stroke="#D4953A"
                      stroke-width="1.2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="folder-card__label">Chapter page</span>
                <span class="folder-card__count">{{ chapterFolderItems.length }}</span>
              </article>

              <article
                class="folder-card"
                role="button"
                tabindex="0"
                aria-label="Opening Courses folder, 3 pages"
                @click="openFolderOpening"
                @keydown.enter.prevent="openFolderOpening"
                @keydown.space.prevent="openFolderOpening"
              >
                <span class="folder-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 6a2 2 0 0 1 2-2h3.5a1 1 0 0 1 .7.3l1.6 1.6a1 1 0 0 0 .7.3H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"
                      fill="#E8A84A"
                      stroke="#D4953A"
                      stroke-width="1.2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="folder-card__label">Opening Courses</span>
                <span class="folder-card__count">{{ openingFolderItems.length }}</span>
              </article>

              <article
                class="folder-card"
                role="button"
                tabindex="0"
                :aria-label="
                  isUnlocked(FOLDER_PREVIOUS_VERSIONS_ID)
                    ? 'Older Versions folder'
                    : 'Older Versions folder, password required'
                "
                @click="openPreviousVersionsFolder"
                @keydown.enter.prevent="openPreviousVersionsFolder"
                @keydown.space.prevent="openPreviousVersionsFolder"
              >
                <span class="folder-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 6a2 2 0 0 1 2-2h3.5a1 1 0 0 1 .7.3l1.6 1.6a1 1 0 0 0 .7.3H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z"
                      fill="#E8A84A"
                      stroke="#D4953A"
                      stroke-width="1.2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span class="folder-card__label">Older Versions</span>
                <span class="folder-card__count folder-card__count--lock" aria-hidden="true" title="Locked folder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              </article>
            </div>
          </section>
        </template>

        <!-- Inside a folder: back + project cards -->
        <section v-else class="index-section index-section--folder-open">
          <header class="folder-view-header">
            <button type="button" class="folder-view-back" aria-label="Back" @click="closeFolderView">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 class="folder-view-title">{{ currentFolderTitle }}</h2>
          </header>
          <div class="project-cards">
            <article
              v-for="item in currentFolderItems"
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
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
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
        </section>

        <ProjectPasswordModal
          :open="passwordModalOpen"
          :project-title="passwordTarget?.title ?? ''"
          :error="passwordError"
          @close="closePasswordModal"
          @submit="onPasswordSubmit"
        />
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
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-24, 24px);
  padding-top: var(--space-48, 48px);
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
.index-section--folder-open {
  width: 100%;
}

.folder-cards-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-16, 16px);
  align-items: stretch;
}

/* Folder card: horizontal bar (icon + label + count) */
.folder-card {
  display: flex;
  align-items: center;
  gap: var(--space-12, 12px);
  flex: 1 1 240px;
  min-width: min(100%, 260px);
  max-width: 360px;
  padding: var(--space-12, 12px) var(--space-16, 16px);
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
  outline: 2px solid var(--color-aqua-300, #26c2a3);
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
.folder-card__count--lock {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17.6px;
  height: 17.6px;
  color: rgba(255, 255, 255, 0.75);
}
.folder-card__count--lock svg {
  width: 100%;
  height: 100%;
}

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
  outline: 2px solid var(--color-aqua-300, #26c2a3);
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

.project-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-24, 24px);
  justify-content: flex-start;
}
.project-card {
  flex: 0 0 360px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl, 12px);
  overflow: hidden;
  cursor: pointer;
  background: var(--color-bg-primary, #312e2b);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.15s ease;
}
.project-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
}
.project-card:focus-visible {
  outline: 2px solid var(--color-aqua-300, #26c2a3);
  outline-offset: 2px;
}

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
  min-width: 0;
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
