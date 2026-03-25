<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * Opening Courses Figma frame (placed composition) + DS traceability via data-figma.
 * @see https://www.figma.com/design/pOwdmuSSWAn4jGAJooYnCO/Opening-Courses?node-id=5492-2817
 */
const OPENING_COURSES_FIGMA = {
  fileKey: 'pOwdmuSSWAn4jGAJooYnCO',
  fileName: 'Opening-Courses',
  nodeId: '5492:2817',
  figmaUrl:
    'https://www.figma.com/design/pOwdmuSSWAn4jGAJooYnCO/Opening-Courses?node-id=5492-2817',
}

const flatButtonDs = {
  componentName: 'flatButton',
  libraryName: '🟩 CK Components Web',
  publishedComponentKey: '067a367fabc095edae8730c970a7949d692a1f21',
  libraryKey:
    'lk-e6721e1671c9f93415c76eeece57ab42c55e79b0a24c2b13c910ea4942d15972079ef494ac87de60e802fc7d8414f8df43b5b39db3827b59358e2a29c75542e5',
}

const SEMANTIC_TOKENS_LIB =
  'lk-97146e8858d2a51a4d74f641acef46735d5f57db84f24d350adfc7a4703c1f4edf334889caed811e3e2284e9806a2770dad1ec13b2908f9ecbebf76ddc3dc01a'

const backgroundSpecsDs = {
  spec: 'empty-page-backgrounds',
  libraryName: 'Semantic Tokens',
  libraryKey: SEMANTIC_TOKENS_LIB,
  variableCollectionName: 'Color',
  variableSetKey: '274fa041bb5109bc404e6c4b07bb145cbb41e6d8',
  pageBackdrop: {
    cssVar: '--color-bg-opaque',
    figmaVariableName: 'color/bg/opaque',
    publishedVariableKey: '1a67409f129156f2fcf86526ecdd57e2c3cf7045',
    scopes: ['FRAME_FILL', 'SHAPE_FILL'],
  },
  panelFill: {
    cssVar: '--color-bg-primary',
    figmaVariableName: 'color/bg/primary',
    publishedVariableKey: '4933a99eb62145d0943318969d66c0e360539677',
    scopes: ['FRAME_FILL', 'SHAPE_FILL'],
  },
  panelBorder: {
    cssVar: '--color-border-default',
    figmaVariableName: 'color/border/default',
    publishedVariableKey: 'fd5e7148ca1a582bbe37119af09b210434831c33',
    scopes: ['STROKE'],
  },
}

const openingCoursesFramePayload = {
  figmaComponent: OPENING_COURSES_FIGMA,
  compositionRole: 'opening-courses-frame-5492-2817',
  childBindings: [
    {
      selector: '.empty-page__panel',
      usesDesignSystem:
        'Semantic Tokens — panel fill + border + page backdrop (see child data-figma)',
    },
    {
      selector: '.empty-page__flat-button',
      usesDesignSystem: 'CK Components Web — flatButton (see child data-figma)',
    },
  ],
}

const panelPayload = {
  figmaComponent: OPENING_COURSES_FIGMA,
  designSystem: backgroundSpecsDs,
}

const buttonPayload = {
  figmaComponent: OPENING_COURSES_FIGMA,
  designSystem: flatButtonDs,
}

const figmaOpeningCoursesFrameRef = JSON.stringify(openingCoursesFramePayload)
const figmaBackgroundSpecsRef = JSON.stringify(panelPayload)
const figmaFlatButtonRef = JSON.stringify(buttonPayload)

/** Cards shown in the Figma inspector overlay (same data as data-figma). */
const figmaInspectorEntries = [
  {
    id: 'frame',
    title: 'Opening Courses frame',
    role: 'Composition',
    accent: 'var(--color-aqua-300, #26c2a3)',
    payload: openingCoursesFramePayload,
  },
  {
    id: 'panel',
    title: 'Panel surface',
    role: 'Semantic tokens',
    accent: 'var(--color-green-300, #81b64c)',
    payload: panelPayload,
  },
  {
    id: 'button',
    title: 'flatButton',
    role: 'Library component',
    accent: 'var(--color-aqua-400, #109888)',
    payload: buttonPayload,
  },
]

const showFigmaInspector = ref(false)
const copyFeedbackId = ref(null)

let lastFocusEl = null

function openFigmaInspector() {
  lastFocusEl = document.activeElement
  showFigmaInspector.value = true
}

function closeFigmaInspector() {
  showFigmaInspector.value = false
  copyFeedbackId.value = null
}

function onInspectorKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault()
    closeFigmaInspector()
  }
}

watch(showFigmaInspector, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
      lastFocusEl.focus()
    }
  }
})

onMounted(() => {
  window.addEventListener('keydown', onInspectorKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onInspectorKeydown)
  document.body.style.overflow = ''
})

async function copyPayload(entry) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(entry.payload, null, 2))
    copyFeedbackId.value = entry.id
    setTimeout(() => {
      if (copyFeedbackId.value === entry.id) copyFeedbackId.value = null
    }, 2000)
  } catch {
    copyFeedbackId.value = null
  }
}

function figmaLink(payload) {
  const fc = payload?.figmaComponent
  return fc?.figmaUrl ?? null
}
</script>

<template>
  <div class="empty-page app dark-mode">
    <header class="empty-page__top-bar">
      <span class="empty-page__top-bar-title">Empty page</span>
      <button
        type="button"
        class="empty-page__figma-trigger"
        aria-haspopup="dialog"
        :aria-expanded="showFigmaInspector"
        aria-controls="empty-page-figma-inspector"
        @click="openFigmaInspector"
      >
        <span class="empty-page__figma-trigger-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.5 4.5h7M8.5 12h7M8.5 19.5h7"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
            <circle cx="5" cy="4.5" r="1.25" fill="currentColor" />
            <circle cx="5" cy="12" r="1.25" fill="currentColor" />
            <circle cx="5" cy="19.5" r="1.25" fill="currentColor" />
          </svg>
        </span>
        Figma data
      </button>
    </header>

    <Teleport to="body">
      <div
        v-if="showFigmaInspector"
        id="empty-page-figma-inspector"
        class="figma-inspector-root"
        role="presentation"
        @click.self="closeFigmaInspector"
      >
        <div
          class="figma-inspector"
          role="dialog"
          aria-modal="true"
          aria-labelledby="figma-inspector-heading"
        >
          <div class="figma-inspector__header">
            <div>
              <h2 id="figma-inspector-heading" class="figma-inspector__title">Design links</h2>
              <p class="figma-inspector__subtitle">
                Traceability for each layer (matches <code class="figma-inspector__code">data-figma</code>)
              </p>
            </div>
            <button
              type="button"
              class="figma-inspector__close"
              aria-label="Close"
              @click="closeFigmaInspector"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <div class="figma-inspector__grid">
            <article
              v-for="entry in figmaInspectorEntries"
              :key="entry.id"
              class="figma-card"
              :style="{ '--card-accent': entry.accent }"
            >
              <div class="figma-card__shine" aria-hidden="true" />
              <header class="figma-card__head">
                <div class="figma-card__titles">
                  <h3 class="figma-card__name">{{ entry.title }}</h3>
                  <span class="figma-card__role">{{ entry.role }}</span>
                </div>
                <button
                  type="button"
                  class="figma-card__copy"
                  @click="copyPayload(entry)"
                >
                  {{ copyFeedbackId === entry.id ? 'Copied' : 'Copy JSON' }}
                </button>
              </header>

              <a
                v-if="figmaLink(entry.payload)"
                :href="figmaLink(entry.payload)"
                class="figma-card__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in Figma
                <span class="figma-card__link-arrow" aria-hidden="true">↗</span>
              </a>

              <dl v-if="entry.payload.figmaComponent" class="figma-card__dl">
                <dt>File</dt>
                <dd>{{ entry.payload.figmaComponent.fileName }}</dd>
                <dt>Node</dt>
                <dd><code>{{ entry.payload.figmaComponent.nodeId }}</code></dd>
                <dt>fileKey</dt>
                <dd><code class="figma-card__mono">{{ entry.payload.figmaComponent.fileKey }}</code></dd>
              </dl>

              <template v-if="entry.payload.compositionRole">
                <h4 class="figma-card__section">Composition</h4>
                <p class="figma-card__mono figma-card__mono--block">{{ entry.payload.compositionRole }}</p>
                <ul v-if="entry.payload.childBindings?.length" class="figma-card__bindings">
                  <li v-for="(b, i) in entry.payload.childBindings" :key="i">
                    <code>{{ b.selector }}</code>
                    <span>{{ b.usesDesignSystem }}</span>
                  </li>
                </ul>
              </template>

              <template v-if="entry.payload.designSystem">
                <h4 class="figma-card__section">Design system</h4>
                <template v-if="entry.payload.designSystem.componentName">
                  <dl class="figma-card__dl figma-card__dl--tight">
                    <dt>Component</dt>
                    <dd>{{ entry.payload.designSystem.componentName }}</dd>
                    <dt>Library</dt>
                    <dd>{{ entry.payload.designSystem.libraryName }}</dd>
                    <dt>publishedComponentKey</dt>
                    <dd><code class="figma-card__mono">{{ entry.payload.designSystem.publishedComponentKey }}</code></dd>
                    <dt>libraryKey</dt>
                    <dd><code class="figma-card__mono figma-card__mono--wrap">{{ entry.payload.designSystem.libraryKey }}</code></dd>
                  </dl>
                </template>
                <template v-else>
                  <dl class="figma-card__dl figma-card__dl--tight">
                    <dt>Spec</dt>
                    <dd>{{ entry.payload.designSystem.spec }}</dd>
                    <dt>Library</dt>
                    <dd>{{ entry.payload.designSystem.libraryName }}</dd>
                    <dt>Collection</dt>
                    <dd>{{ entry.payload.designSystem.variableCollectionName }}</dd>
                  </dl>
                  <div
                    v-for="(token, key) in {
                      pageBackdrop: entry.payload.designSystem.pageBackdrop,
                      panelFill: entry.payload.designSystem.panelFill,
                      panelBorder: entry.payload.designSystem.panelBorder,
                    }"
                    v-show="token"
                    :key="String(key)"
                    class="figma-card__token"
                  >
                    <span class="figma-card__token-label">{{ key }}</span>
                    <code class="figma-card__mono">{{ token.figmaVariableName }}</code>
                    <code class="figma-card__mono figma-card__mono--dim">{{ token.cssVar }}</code>
                    <code class="figma-card__mono figma-card__mono--small">{{ token.publishedVariableKey }}</code>
                  </div>
                </template>
              </template>

              <details class="figma-card__raw">
                <summary>Raw JSON</summary>
                <pre class="figma-card__pre">{{ JSON.stringify(entry.payload, null, 2) }}</pre>
              </details>
            </article>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="empty-page__center">
      <div
        class="empty-page__oc-frame"
        :data-figma="figmaOpeningCoursesFrameRef"
        data-name="Opening Courses frame"
      >
        <div
          class="empty-page__panel"
          aria-label="Demo container"
          :data-figma="figmaBackgroundSpecsRef"
        >
          <button
            type="button"
            class="empty-page__flat-button"
            data-name="flatButton"
            :data-figma="figmaFlatButtonRef"
          >
            Button
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-page {
  min-height: 100vh;
  background: var(--color-bg-opaque, #262421);
}

.empty-page__top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: color-mix(in srgb, var(--color-gray-900, #262421) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.1));
}

.empty-page__top-bar-title {
  font-family: var(--font-family-heading, 'Chess Sans', system-ui, sans-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-boldest, #fff);
  letter-spacing: -0.02em;
}

.empty-page__figma-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid color-mix(in srgb, var(--color-aqua-300, #26c2a3) 45%, transparent);
  border-radius: 10px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-aqua-500, #10777c) 35%, transparent) 0%,
    color-mix(in srgb, var(--color-aqua-300, #26c2a3) 12%, transparent) 100%
  );
  color: #fff;
  font-family: var(--font-family-heading, 'Chess Sans', system-ui, sans-serif);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.12s ease;
}

.empty-page__figma-trigger:hover {
  border-color: color-mix(in srgb, var(--color-aqua-200, #62f6ca) 55%, transparent);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.25),
    0 0 0 1px color-mix(in srgb, var(--color-aqua-300, #26c2a3) 25%, transparent);
}

.empty-page__figma-trigger:focus-visible {
  outline: 2px solid var(--color-aqua-300, #26c2a3);
  outline-offset: 2px;
}

.empty-page__figma-trigger-icon {
  display: flex;
  opacity: 0.95;
}

.empty-page__center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px var(--space-24, 24px) var(--space-24, 24px);
}

.empty-page__oc-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-page__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-32, 32px);
  background: var(--color-bg-primary, #312e2b);
  border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-lg, 12px);
}

.empty-page__flat-button {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-md, 8px);
  font-family: var(--font-family-heading, 'Chess Sans', system-ui, sans-serif);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
  color: #fff;
  cursor: pointer;
  background: var(--color-green-300, #81b64c);
  transition: background 0.15s ease, filter 0.15s ease;
}

.empty-page__flat-button:hover {
  background: var(--color-green-500, #45753c);
}

.empty-page__flat-button:focus-visible {
  outline: 2px solid var(--color-green-300, #81b64c);
  outline-offset: 2px;
}

/* —— Figma inspector overlay —— */
.figma-inspector-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 72px 16px 24px;
  overflow: auto;
  background: rgba(10, 9, 8, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.figma-inspector {
  width: 100%;
  max-width: 1100px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(
    165deg,
    rgba(49, 46, 43, 0.98) 0%,
    rgba(32, 30, 28, 0.99) 50%,
    rgba(24, 22, 20, 1) 100%
  );
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(255, 255, 255, 0.04) inset;
}

.figma-inspector__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.figma-inspector__title {
  margin: 0;
  font-family: var(--font-family-heading, 'Chess Sans', system-ui, sans-serif);
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.03em;
}

.figma-inspector__subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.45;
}

.figma-inspector__code {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-aqua-200, #62f6ca);
}

.figma-inspector__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 0.15s ease;
}

.figma-inspector__close:hover {
  background: rgba(255, 255, 255, 0.12);
}

.figma-inspector__close:focus-visible {
  outline: 2px solid var(--color-aqua-300, #26c2a3);
  outline-offset: 2px;
}

.figma-inspector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px 24px 24px;
}

.figma-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 18px 18px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.figma-card__shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--card-accent, #26c2a3),
    transparent
  );
  opacity: 0.9;
}

.figma-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.figma-card__name {
  margin: 0;
  font-family: var(--font-family-heading, 'Chess Sans', system-ui, sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.figma-card__role {
  display: inline-block;
  margin-top: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--card-accent, #26c2a3);
}

.figma-card__copy {
  flex-shrink: 0;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.figma-card__copy:hover {
  border-color: color-mix(in srgb, var(--card-accent) 40%, white);
  background: rgba(255, 255, 255, 0.06);
}

.figma-card__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-aqua-200, #adfbd8);
  text-decoration: none;
}

.figma-card__link:hover {
  text-decoration: underline;
}

.figma-card__link-arrow {
  font-size: 12px;
  opacity: 0.85;
}

.figma-card__dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 0 0 12px;
  font-size: 12px;
}

.figma-card__dl--tight {
  gap: 4px 10px;
}

.figma-card__dl dt {
  margin: 0;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 500;
}

.figma-card__dl dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  word-break: break-word;
}

.figma-card__section {
  margin: 12px 0 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
}

.figma-card__mono {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
  font-size: 11px;
  line-height: 1.4;
}

.figma-card__mono--block {
  display: block;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.88);
  word-break: break-all;
}

.figma-card__mono--wrap {
  word-break: break-all;
}

.figma-card__mono--dim {
  display: block;
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.55);
}

.figma-card__mono--small {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}

.figma-card__bindings {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.5;
}

.figma-card__bindings li {
  margin-bottom: 8px;
}

.figma-card__bindings code {
  display: block;
  font-size: 11px;
  margin-bottom: 2px;
  color: var(--color-aqua-200, #62f6ca);
}

.figma-card__token {
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.figma-card__token-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.figma-card__raw {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.figma-card__raw summary {
  cursor: pointer;
  user-select: none;
}

.figma-card__raw summary:hover {
  color: #fff;
}

.figma-card__pre {
  margin: 10px 0 0;
  padding: 12px;
  max-height: 200px;
  overflow: auto;
  font-size: 10px;
  line-height: 1.45;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.35);
  color: rgba(200, 255, 230, 0.85);
}
</style>
