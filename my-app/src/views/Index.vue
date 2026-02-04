<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Show/hide version cards (V1/V2 disabled for now; set to true to re-enable)
const showV1 = false
const showV2 = false
const showV22 = true
const showV23 = true

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
  v3: buildTime,
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
        <div class="project-cards">
          <!-- V1: hidden when showV1 is false -->
          <article
            v-if="showV1"
            class="project-card"
            role="button"
            tabindex="0"
            @click="router.push('/learn')"
            @keydown.enter="router.push('/learn')"
            @keydown.space.prevent="router.push('/learn')"
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
                  <h2 class="project-card__title">Chapter Page V1</h2>
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
                  <span class="project-card__footer-title">Chapter Page V1</span>
                  <span class="project-card__footer-time">{{ editedAgoFor('v1') }}</span>
                </div>
              </div>
            </div>
          </article>
          <!-- V2: hidden when showV2 is false -->
          <article
            v-if="showV2"
            class="project-card"
            role="button"
            tabindex="0"
            @click="router.push('/learn/v2')"
            @keydown.enter="router.push('/learn/v2')"
            @keydown.space.prevent="router.push('/learn/v2')"
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
                  <h2 class="project-card__title">Chapter Page V2</h2>
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
                  <span class="project-card__footer-title">Chapter Page V2</span>
                  <span class="project-card__footer-time">{{ editedAgoFor('v2') }}</span>
                </div>
              </div>
            </div>
          </article>
          <!-- V2.2: hidden when showV22 is false -->
          <article
            v-if="showV22"
            class="project-card"
            role="button"
            tabindex="0"
            @click="router.push('/learn/v2.2')"
            @keydown.enter="router.push('/learn/v2.2')"
            @keydown.space.prevent="router.push('/learn/v2.2')"
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
                  <h2 class="project-card__title">Chapter Page V2.2</h2>
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
                  <span class="project-card__footer-title">Chapter Page V2.2</span>
                  <span class="project-card__footer-time">{{ editedAgoFor('v22') }}</span>
                </div>
              </div>
            </div>
          </article>
          <!-- V2.3: hidden when showV23 is false -->
          <article
            v-if="showV23"
            class="project-card"
            role="button"
            tabindex="0"
            @click="router.push('/learn/v2.3')"
            @keydown.enter="router.push('/learn/v2.3')"
            @keydown.space.prevent="router.push('/learn/v2.3')"
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
                  <h2 class="project-card__title">Chapter Page V2.3</h2>
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
                  <span class="project-card__footer-title">Chapter Page V2.3</span>
                  <span class="project-card__footer-time">{{ editedAgoFor('v23') }}</span>
                </div>
              </div>
            </div>
          </article>
          <!-- V3: always visible -->
          <article
            class="project-card"
            role="button"
            tabindex="0"
            @click="router.push('/learn/v3')"
            @keydown.enter="router.push('/learn/v3')"
            @keydown.space.prevent="router.push('/learn/v3')"
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
                  <h2 class="project-card__title">Chapter Page V3</h2>
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
                  <span class="project-card__footer-title">Chapter Page V3</span>
                  <span class="project-card__footer-time">{{ editedAgoFor('v3') }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
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
}
.project-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-24, 24px);
  justify-content: center;
}
.project-card {
  flex: 0 0 360px;
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
