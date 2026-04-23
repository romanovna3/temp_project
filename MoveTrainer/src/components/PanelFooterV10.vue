<!--
  Cloned from my-app CoursesV10.vue — panel-footer-frame (CTA row + icon toolbar).
  Sections: footer-section-actions (ButtonsFooter), footer-section-toolbar (IconFooter).
-->
<template>
  <div class="panel-footer-v10-root">
    <div class="panel-footer-frame">
      <div class="panel-footer-container">
        <section class="footer-section footer-section-actions" data-name="ButtonsFooter">
          <div class="footer-buttons-container">
            <slot name="actions" />
          </div>
        </section>
        <section class="footer-section footer-section-toolbar" data-name="IconFooter">
          <slot name="toolbar" />
        </section>
        <footer class="panel-footer" />
      </div>
    </div>
  </div>
</template>

<!-- Unscoped + root wrapper: styles apply to slotted markup from parent (toolbar / actions). -->
<style>
/* CoursesV10 — Footer frame – overlays bottom of panel */
.panel-footer-v10-root .panel-footer-frame {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  background-color: var(--color-bg-opaque, var(--color-bg-opaque-lighter, #312e2b));
}

.panel-footer-v10-root .panel-footer-container {
  flex-shrink: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 0;
  height: fit-content;
  justify-content: flex-end;
  align-items: center;
  padding-top: 8px;
  padding-left: 0;
  padding-right: 0;
  background-color: rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
}

.panel-footer-v10-root .panel-footer-container > * {
  position: relative;
  z-index: 1;
}

.panel-footer-v10-root .panel-footer {
  flex-shrink: 0;
  position: relative;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.panel-footer-v10-root .footer-section {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.panel-footer-v10-root .footer-section-actions {
  justify-content: center;
  padding: 12px 16px 12px;
  gap: 16px;
  width: 100%;
  min-width: 0;
  min-height: 56px;
  height: auto;
  margin: 0;
  align-items: stretch;
  box-sizing: border-box;
}

.panel-footer-v10-root .footer-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  min-width: 0;
  position: relative;
}

.panel-footer-v10-root .footer-buttons-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-width: 0;
  flex-shrink: 0;
}

.panel-footer-v10-root .footer-buttons-row-split {
  gap: 8px;
  width: 100%;
}

.panel-footer-v10-root .footer-buttons-row-full {
  /* single full-width button */
}

.panel-footer-v10-root .footer-btn-equal {
  flex: 1 0 0;
  min-width: 0;
}

.panel-footer-v10-root .footer-btn-full {
  flex: 1 0 0;
  width: 100%;
  min-width: 0;
  max-height: 4.8rem;
}

.panel-footer-v10-root .footer-buttons-row-split > * {
  flex: 1 0 0;
  min-width: 0;
}

.panel-footer-v10-root .footer-buttons-row-split > * button {
  width: 100%;
}

.panel-footer-v10-root .footer-buttons-row-full > * {
  flex: 1 0 0;
  width: 100%;
  min-width: 0;
}

.panel-footer-v10-root .footer-buttons-row-full > * button {
  width: 100%;
}

.panel-footer-v10-root .footer-section-toolbar {
  justify-content: space-between;
  padding: 12px 16px 12px;
  min-height: 56px;
  height: auto;
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  align-items: flex-start;
  box-sizing: border-box;
}

/* Assisted quiz (AQ): 128px shell (was ~134), flush horizontal, content pinned to end */
.panel-footer-v10-root.panel-footer-v10--assisted-quiz .panel-footer-container {
  padding-top: 8px;
  padding-left: 0;
  padding-right: 0;
  height: 128px;
  min-height: 128px;
  max-height: 128px;
  justify-content: flex-end;
  align-items: center;
}

.panel-footer-v10-root.panel-footer-v10--assisted-quiz .footer-section-actions {
  padding: 12px 16px 8px;
  box-sizing: border-box;
  min-height: 56px;
  height: 56px;
  max-height: 56px;
  margin: 0;
  align-items: flex-end;
}

.panel-footer-v10-root.panel-footer-v10--assisted-quiz .footer-section-toolbar {
  padding: 14px 12px 16px;
  margin-top: -4px;
}

.panel-footer-v10-root .footer-icon-group {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 0;
}

.panel-footer-v10-root .footer-icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.panel-footer-v10-root .footer-icon-btn:hover:not(:disabled) .footer-icon {
  color: var(--icon-secondary, rgba(255, 255, 255, 0.72));
}

.panel-footer-v10-root .footer-icon {
  color: var(--icon-tertiary, rgba(255, 255, 255, 0.5));
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.2));
  transition: color 0.15s ease;
}

.panel-footer-v10-root .footer-section-toolbar .footer-icon-btn:disabled,
.panel-footer-v10-root .footer-section-toolbar .footer-icon-group:last-child .footer-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: default;
}

.panel-footer-v10-root .footer-section-toolbar .footer-icon-group:last-child .footer-icon-btn:disabled:hover .footer-icon {
  color: var(--icon-tertiary, rgba(255, 255, 255, 0.5));
}

.panel-sm .panel-footer-v10-root .footer-section-actions,
.panel-sm .panel-footer-v10-root .footer-section-toolbar {
  padding-left: 8px;
  padding-right: 8px;
}

.panel-sm .panel-footer-v10-root.panel-footer-v10--assisted-quiz .footer-section-actions {
  padding-left: 16px;
  padding-right: 16px;
}
</style>
