<script setup>
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

/** Root: Figma file placement + how children map to DS */
const figmaOpeningCoursesFrameRef = JSON.stringify({
  figmaComponent: OPENING_COURSES_FIGMA,
  compositionRole: 'opening-courses-frame-5492-2817',
  childBindings: [
    {
      selector: '.empty-page__panel',
      usesDesignSystem: 'Semantic Tokens — panel fill + border + page backdrop (see child data-figma)',
    },
    {
      selector: '.empty-page__flat-button',
      usesDesignSystem: 'CK Components Web — flatButton (see child data-figma)',
    },
  ],
})

const figmaBackgroundSpecsRef = JSON.stringify({
  figmaComponent: OPENING_COURSES_FIGMA,
  designSystem: backgroundSpecsDs,
})

const figmaFlatButtonRef = JSON.stringify({
  figmaComponent: OPENING_COURSES_FIGMA,
  designSystem: flatButtonDs,
})
</script>

<template>
  <div class="empty-page app dark-mode">
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

/* Figma Opening Courses node 5492:2817 — composition wrapper (layout only) */
.empty-page__oc-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
