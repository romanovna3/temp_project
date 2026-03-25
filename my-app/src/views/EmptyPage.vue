<script setup>
/**
 * Figma: CK Components Web — flatButton (published component key + library key from design-system search).
 * data-figma is JSON for tooling / traceability; swap node URL when you have fileKey + node-id.
 */
const figmaFlatButtonRef = JSON.stringify({
  componentName: 'flatButton',
  libraryName: '🟩 CK Components Web',
  publishedComponentKey: '067a367fabc095edae8730c970a7949d692a1f21',
  libraryKey:
    'lk-e6721e1671c9f93415c76eeece57ab42c55e79b0a24c2b13c910ea4942d15972079ef494ac87de60e802fc7d8414f8df43b5b39db3827b59358e2a29c75542e5',
})
</script>

<template>
  <div class="empty-page app dark-mode">
    <div class="empty-page__center">
      <div
        class="empty-page__panel"
        aria-label="Demo container"
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
</template>

<style scoped>
/* Page: deeper gray so panel (--color-bg-primary) reads as a distinct grey surface */
.empty-page {
  min-height: 100vh;
  background: var(--color-bg-opaque, #262421);
}

.empty-page__center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-24, 24px);
}

/* DS: --color-bg-primary maps to gray-800 (semantic primary gray background) */
.empty-page__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-32, 32px);
  background: var(--color-bg-primary, #312e2b);
  border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-lg, 12px);
}

/* Placeholder for Figma flatButton — flat fill, DS green */
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
</style>
