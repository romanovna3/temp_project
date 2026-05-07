<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { CcIcon } from '@chesscom/design-system'
import { useTypewriter } from '../composables/useTypewriter.js'
import coachDannyPortraitUrl from '../assets/coaches/coach-danny.png?url'
import CoachMessageRichNotationsLine from './CoachMessageRichNotationsLine.vue'

const base = import.meta.env.BASE_URL

const props = defineProps({
  headerIcon: { type: String, default: '' },
  headerText: { type: String, default: '' },
  evalText: { type: String, default: '' },
  whiteAdvantage: { type: Boolean, default: true },
  message: { type: String, default: '' },
  showTip: { type: Boolean, default: true },
  startPosition: { type: Boolean, default: false },
  typewriter: { type: Boolean, default: false },
  /** Stretch two-bubble layout to fill parent height (informational route). */
  fillAvailableHeight: { type: Boolean, default: false },
  /** Intro route: one bubble, same shell / padding / speech typography as informational (no second stacked bubble). */
  introCoachCombinedBubble: { type: Boolean, default: false },
  /** Informational route: one bubble with `message` as body copy (no "White to move" strip + second bubble). */
  informationalSingleBubble: { type: Boolean, default: false },
  /** Rich body: alternating text and clickable move chips (light bubble); overrides plain `message` when set. */
  informationalSegments: { type: Array, default: null },
  /** Highlights the move chip matching the current board ply (same index as MoveList). */
  informationalActivePly: { type: Number, default: 0 },
  /** Primary strip label in two-bubble review layout (e.g. quiz uses "White to play"). */
  turnStripText: { type: String, default: 'White to move' },
  /**
   * Unassisted quiz primary strip: `play` = turn chip; `wrong_incorrect` = icon + "Incorrect" (fade-in);
   * `wrong_continue` = "Let's continue!" (kept through notation + until Next).
   */
  quizStripState: { type: String, default: 'play' },
  /**
   * Two-bubble “notation line” under the main message: same `segments` shape as
   * `INFORMATIONAL_DREAM_OPENING.segments` / `informationalSegments` (see `CoachMessageRichNotationsLine.vue`).
   * Omitted or empty = hidden.
   */
  messageNotationSegments: { type: Array, default: null },
  /** Which `move` chip is active (e.g. `1` after auto `1. e4` on a wrong-answer path). */
  messageNotationActivePly: { type: Number, default: 0 },
  /**
   * Two-bubble layout only: secondary bubble height follows message content until `--bubble-max-height`,
   * then scrolls (same cap + rail as informational line layout). Default is fill/stack min height.
   */
  secondaryBubbleFitContent: { type: Boolean, default: false },
  /** With `secondaryBubbleFitContent`: grow second bubble to full message height (no max-height scroll). */
  secondaryBubbleExpandToFit: { type: Boolean, default: false },
  /** Pixel size for the coach color icon; keep in sync with `--coach-avatar-size` on the panel. */
  coachAvatarIconPx: { type: Number, default: 80 },
  /** Optional coach portrait override; defaults to Danny. */
  coachAvatarSrc: { type: String, default: '' },
})

defineEmits(['selectInformationalPly'])

const bubbleRef = ref(null)

const iconName = computed(() => props.headerIcon)
const tipSrc = `${base}icons/misc/bubble-tip.svg`
const coachAvatarSrcResolved = computed(() => props.coachAvatarSrc || coachDannyPortraitUrl)

const contentRef = ref(null)
/** Informational / intro-combined: scroll panel wrapper (resize tells us when flex allocated height). */
const informationalScrollPanelRef = ref(null)

/** Native scrollbars are often overlay/hover-only; we show a fixed rail + thumb when content overflows. */
const contentScrollable = ref(false)
const scrollbarThumbStyle = ref({ height: '24px', transform: 'translateY(0px)' })

function updateScrollFades() {
  const el = contentRef.value
  const bubble = bubbleRef.value
  if (!el || !bubble) return

  const isScrollable = el.scrollHeight - el.clientHeight > 0.5
  if (!isScrollable) {
    bubble.style.setProperty('--top-opacity', '0')
    bubble.style.setProperty('--bottom-opacity', '0')
    return
  }

  const scrollTop = el.scrollTop
  const maxScroll = el.scrollHeight - el.clientHeight
  /* Tolerate subpixel / fractional scroll so we don’t keep the top fade on when “at” the top. */
  const isAtTop = scrollTop <= 1
  const isAtBottom = maxScroll - scrollTop <= 1
  bubble.style.setProperty('--top-opacity', isAtTop ? '0' : '1')
  bubble.style.setProperty('--bottom-opacity', isAtBottom ? '0' : '1')
}

function syncScrollbarThumb() {
  const el = contentRef.value
  if (!el || !contentScrollable.value) {
    scrollbarThumbStyle.value = { height: '0px', transform: 'translateY(0px)' }
    return
  }
  const { scrollTop, scrollHeight, clientHeight } = el
  const track = clientHeight
  const ratio = track / scrollHeight
  const thumbH = Math.max(20, Math.floor(track * ratio))
  const maxScroll = Math.max(0, scrollHeight - clientHeight)
  const travel = Math.max(0, track - thumbH)
  const y = maxScroll <= 0 ? 0 : (scrollTop / maxScroll) * travel
  scrollbarThumbStyle.value = {
    height: `${thumbH}px`,
    transform: `translateY(${y}px)`,
  }
}

function measureContentScrollable() {
  const el = contentRef.value
  if (!el) {
    contentScrollable.value = false
    return
  }
  contentScrollable.value = el.scrollHeight - el.clientHeight > 0.5
  syncScrollbarThumb()
  updateScrollFades()
}

/** Fill-height layouts settle after flex pass; remeasure so fades/rail reflect real overflow. */
function scheduleMeasureAfterLayout() {
  nextTick(() => {
    measureContentScrollable()
    if (!props.fillAvailableHeight) return
    requestAnimationFrame(() => {
      measureContentScrollable()
      requestAnimationFrame(() => measureContentScrollable())
    })
  })
}

function onBubbleContentScroll() {
  updateScrollFades()
  syncScrollbarThumb()
}

let contentResizeObserver = null
let informationalPanelResizeObserver = null

watch(
  () => contentRef.value,
  (el) => {
    contentResizeObserver?.disconnect()
    contentResizeObserver = null
    if (!el) {
      contentScrollable.value = false
      return
    }
    contentResizeObserver = new ResizeObserver(() => measureContentScrollable())
    contentResizeObserver.observe(el)
    scheduleMeasureAfterLayout()
  },
  { flush: 'post' },
)

watch(
  () => informationalScrollPanelRef.value,
  (el) => {
    informationalPanelResizeObserver?.disconnect()
    informationalPanelResizeObserver = null
    if (!el) return
    informationalPanelResizeObserver = new ResizeObserver(() => measureContentScrollable())
    informationalPanelResizeObserver.observe(el)
    scheduleMeasureAfterLayout()
  },
  { flush: 'post' },
)

onUnmounted(() => {
  contentResizeObserver?.disconnect()
  informationalPanelResizeObserver?.disconnect()
})

/**
 * Two stacked speech bubbles (review): primary = "White to move" strip only,
 * secondary = coach copy — unless `introCoachCombinedBubble` or `informationalSingleBubble`
 * (one bubble, same layout / typography as informational: `cc-text-speech` body).
 * Otherwise single bubble for start/overview or review without move header.
 */
const useInformationalSingleBubble = computed(
  () => props.informationalSingleBubble && !props.startPosition,
)

const useIntroCoachCombinedBubble = computed(
  () => props.introCoachCombinedBubble && !props.startPosition,
)

const useTwoBubbleLayout = computed(
  () =>
    !props.startPosition
    && !!props.headerText
    && !props.informationalSingleBubble
    && !props.introCoachCombinedBubble,
)

/** Single light bubble without fill: shrink coach row to copy (intro); informational fill keeps stretch layout. */
const useSingleBubbleHug = computed(
  () =>
    (useInformationalSingleBubble.value || useIntroCoachCombinedBubble.value)
    && !props.fillAvailableHeight,
)

/** Primary bubble: only the my-app "White to move" strip (white chip + label). */
const showTurnStrip = computed(() => useTwoBubbleLayout.value)

const hasInformationalRichBody = computed(
  () => useInformationalSingleBubble.value && props.informationalSegments?.length,
)

/** Keep the active move chip near the vertical center of the scrollable coach area (footer chevrons / chips). */
function scrollInformationalActiveMoveIntoView() {
  if (!hasInformationalRichBody.value) return
  const root = contentRef.value
  if (!root) return
  const ply = props.informationalActivePly
  if (ply <= 0) {
    root.scrollTo({ top: 0, behavior: 'smooth' })
    nextTick(() => {
      updateScrollFades()
      syncScrollbarThumb()
    })
    return
  }
  const btn = root.querySelector(`[data-coach-move-ply="${ply}"]`)
  if (btn) {
    btn.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
    setTimeout(() => {
      updateScrollFades()
      syncScrollbarThumb()
    }, 350)
  }
}

/**
 * Do not autoscroll the coach on first paint (e.g. to the first move chip).
 * Autoscroll when `informationalActivePly` changes — footer chevrons, inline chips, etc.
 * Segment-only updates (same ply) do not trigger a scroll.
 */
watch(
  () => [props.informationalActivePly, props.informationalSegments?.length ?? 0],
  async (newTuple, oldTuple) => {
    if (!hasInformationalRichBody.value) return
    await nextTick()
    if (oldTuple === undefined) return
    const [ply] = newTuple
    const [oldPly] = oldTuple
    if (ply === oldPly) return
    scrollInformationalActiveMoveIntoView()
  },
  { flush: 'post' },
)

watch(
  [
    () => props.message,
    () => props.headerText,
    () => props.startPosition,
    () => props.informationalSingleBubble,
    () => props.informationalSegments,
    () => props.secondaryBubbleFitContent,
    () => props.secondaryBubbleExpandToFit,
    () => props.fillAvailableHeight,
    () => props.introCoachCombinedBubble,
    () => props.quizStripState,
    () => props.messageNotationSegments,
  ],
  async () => {
    await nextTick()
    scheduleMeasureAfterLayout()
  },
)

onMounted(() => {
  scheduleMeasureAfterLayout()
})

const typewriterResult = props.typewriter
  ? useTypewriter(() => props.message, { autoStart: true })
  : null
</script>

<template>
  <div
    class="coach-container"
    :class="{
      'start-position': startPosition,
      'coach-container--two-bubbles': useTwoBubbleLayout,
      'coach-container--informational-single':
        useInformationalSingleBubble || useIntroCoachCombinedBubble,
      'coach-container--single-bubble-hug': useSingleBubbleHug,
      'coach-container--secondary-fit-content':
        secondaryBubbleFitContent && useTwoBubbleLayout,
      'coach-container--secondary-expand':
        secondaryBubbleExpandToFit && secondaryBubbleFitContent && useTwoBubbleLayout,
      'coach-container--fill-available':
        fillAvailableHeight
        && (useTwoBubbleLayout || useInformationalSingleBubble || useIntroCoachCombinedBubble),
    }"
  >
    <div class="coach-avatar">
      <img
        class="coach-avatar__img"
        :src="coachAvatarSrcResolved"
        :width="coachAvatarIconPx"
        :height="coachAvatarIconPx"
        alt="IM Danny Rensch"
        decoding="async"
      />
    </div>

    <!-- Two-bubble review layout (primary insight + secondary message) -->
    <div v-if="useTwoBubbleLayout" class="bubble-wrapper bubble-wrapper--two-bubbles">
      <div class="bubble-stack">
        <div class="bubble bubble--primary">
          <div v-if="showTip" class="tip">
            <img :src="tipSrc" alt="" />
          </div>
          <div class="bubble-content bubble-content--header-only">
            <div
              v-if="showTurnStrip && quizStripState === 'wrong_incorrect'"
              class="coach-quiz-strip-incorrect coach-quiz-strip-incorrect--enter"
            >
              <div class="coach-quiz-error-badge" aria-hidden="true">
                <CcIcon name="mark-cross" variant="glyph" :size="16" class="coach-quiz-error-badge__x" />
              </div>
              <span class="classification-text coach-quiz-strip-incorrect__label cc-text-large-bold">Incorrect</span>
            </div>
            <div v-else-if="showTurnStrip && quizStripState === 'wrong_continue'" class="coach-quiz-strip-continue">
              <span class="cc-text-large-bold">Let's continue!</span>
            </div>
            <div v-else-if="showTurnStrip" class="coach-turn-strip">
              <span class="color-indicator white-indicator" aria-hidden="true" />
              <span class="classification-text cc-text-large-bold">{{ turnStripText }}</span>
            </div>
          </div>
        </div>

        <div ref="bubbleRef" class="bubble bubble--secondary">
          <div class="bubble-scroll-panel">
            <div
              ref="contentRef"
              class="bubble-content bubble-content--message bubble-content--hide-native-scrollbar"
              @scroll="onBubbleContentScroll"
            >
              <p v-if="message" class="coach-message cc-text-speech">{{ message }}</p>
              <p v-else class="empty">No message</p>
              <CoachMessageRichNotationsLine
                v-if="messageNotationSegments?.length"
                :segments="messageNotationSegments"
                :active-ply="messageNotationActivePly"
                :readonly="true"
              />
            </div>
            <div v-show="contentScrollable" class="bubble-scroll-panel__rail" aria-hidden="true">
              <div class="bubble-scroll-panel__thumb" :style="scrollbarThumbStyle" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Informational + intro: one light bubble, same markup / padding / `cc-text-speech` as informational -->
    <div
      v-else-if="useInformationalSingleBubble || useIntroCoachCombinedBubble"
      class="bubble-wrapper bubble-wrapper--informational-single"
    >
      <div ref="bubbleRef" class="bubble bubble--informational-single">
        <div v-if="showTip" class="tip">
          <img :src="tipSrc" alt="" />
        </div>
        <div ref="informationalScrollPanelRef" class="bubble-scroll-panel bubble-scroll-panel--informational">
          <div
            ref="contentRef"
            class="bubble-content bubble-content--informational-message bubble-content--hide-native-scrollbar"
            @scroll="onBubbleContentScroll"
          >
            <CoachMessageRichNotationsLine
              v-if="hasInformationalRichBody"
              :segments="informationalSegments"
              :active-ply="informationalActivePly"
              @select-ply="$emit('selectInformationalPly', $event)"
            />
            <p v-else-if="message" class="coach-message cc-text-speech">{{ message }}</p>
            <p v-else class="empty">No message</p>
          </div>
          <div v-show="contentScrollable" class="bubble-scroll-panel__rail" aria-hidden="true">
            <div class="bubble-scroll-panel__thumb" :style="scrollbarThumbStyle" />
          </div>
        </div>
      </div>
    </div>

    <!-- Single bubble: overview / welcome (typewriter) or review without move header -->
    <div v-else class="bubble-wrapper">
      <div ref="bubbleRef" class="bubble bubble--has-scroll-panel">
        <div v-if="showTip" class="tip">
          <img :src="tipSrc" alt="" />
        </div>

        <div class="bubble-scroll-panel">
          <div ref="contentRef" class="bubble-content bubble-content--hide-native-scrollbar" @scroll="onBubbleContentScroll">
            <div v-if="headerText" class="bubble-header">
              <div class="classification">
                <CcIcon v-if="iconName" :name="iconName" variant="color" class="classification-icon" />
                <span class="classification-text cc-text-large-bold">{{ headerText }}</span>
              </div>
              <div
                v-if="evalText"
                class="eval-badge"
                :class="{ 'white-advantage': whiteAdvantage, 'black-advantage': !whiteAdvantage }"
              >
                <span class="cc-text-medium-bold">{{ evalText }}</span>
              </div>
            </div>

            <p v-if="typewriter && typewriterResult" class="coach-message cc-text-speech" v-html="typewriterResult.displayedText.value" />
            <p v-else-if="message" class="coach-message cc-text-speech">{{ message }}</p>

            <p v-if="!headerText && !message" class="empty">No message</p>
          </div>
          <div v-show="contentScrollable" class="bubble-scroll-panel__rail" aria-hidden="true">
            <div class="bubble-scroll-panel__thumb" :style="scrollbarThumbStyle" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.coach-container {
  /* Light speech bubbles sit on a dark panel; do not use theme text tokens (they flip to white in dark-mode). */
  --coach-bubble-fg: #312e2b;
  --coach-bubble-muted: #6d6b69;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0;
  width: 100%;
  height: var(--coach-container-height, 116px);
}

.coach-avatar {
  width: var(--coach-avatar-size, 80px);
  height: var(--coach-avatar-size, 80px);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  overflow: hidden;
  line-height: 0;
}

.coach-avatar__img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.bubble-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
  margin-left: -6px;
  display: flex;
  align-items: flex-start;
}

/* DS — two stacked bubbles (insight + message); see SPEC “Bubble Modes” / review layout */
.coach-container--two-bubbles {
  align-items: flex-start;
  /* Fixed height would clip/overflow the stack; next panel (line header) painted on top. Grow with content. */
  height: auto;
  min-height: var(--coach-container-height, 116px);
  margin-bottom: 5px;
}

.coach-container--informational-single {
  align-items: flex-start;
  height: auto;
  min-height: var(--coach-container-height, 116px);
  margin-bottom: 5px;
}

/* Intro / non-fill single bubble: drop fixed min-heights so bubble + coach row match copy height */
.coach-container--informational-single.coach-container--single-bubble-hug {
  min-height: 0;
  height: auto;
  margin-bottom: 0;
}

.coach-container--single-bubble-hug .bubble-wrapper--informational-single {
  min-height: 0;
  margin-top: 8px;
  margin-bottom: 5px;
  align-self: flex-start;
}

.coach-container--single-bubble-hug .bubble--informational-single {
  flex: 0 0 auto;
}

.coach-container--single-bubble-hug .bubble--informational-single .bubble-scroll-panel--informational {
  flex: 0 0 auto;
  min-height: 0;
}

.coach-container--single-bubble-hug .bubble-content.bubble-content--informational-message {
  min-height: 0;
}

.bubble-wrapper--informational-single {
  margin-top: 8px;
  margin-bottom: 5px;
  align-self: stretch;
  min-height: var(--coach-container-height, 116px);
  display: flex;
  flex-direction: column;
}

.bubble--informational-single {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.bubble--informational-single .bubble-scroll-panel--informational {
  flex: 1 1 auto;
  min-height: 0;
}

/* Must beat `.bubble-content:not(:has(.bubble-header))` { justify-content: center } (same specificity + later). */
.bubble-content.bubble-content--informational-message {
  padding-top: var(--space-16, 16px);
  padding-bottom: var(--space-16, 16px);
  min-height: 96px;
  max-height: var(--bubble-max-height, 116px);
  overflow-y: auto;
}

.bubble-wrapper--two-bubbles {
  margin-top: var(--space-8, 8px);
  align-self: stretch;
  min-height: var(--coach-container-height, 116px);
  display: flex;
  flex-direction: column;
}

.bubble-stack {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 6px);
  min-height: 0;
  width: 100%;
}

.bubble--primary {
  flex-shrink: 0;
}

/* my-app CoachBubble.vue — "White to move" / "Black to move" strip */
.coach-turn-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.color-indicator {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: 2px solid #8b8987;
  flex-shrink: 0;
  box-sizing: border-box;
}

.white-indicator {
  background: #ffffff;
}

/* Unassisted quiz — incorrect header (icon + label), matches product “badge + Incorrect” treatment */
.coach-quiz-strip-incorrect {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.coach-quiz-strip-incorrect--enter {
  animation: coach-quiz-strip-fade-in 220ms ease-out both;
}

@keyframes coach-quiz-strip-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.coach-quiz-error-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-text-error, #b23430);
  flex-shrink: 0;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
}

.coach-quiz-error-badge__x {
  color: #fff;
}

.coach-quiz-strip-incorrect__label {
  color: var(--coach-bubble-fg, #312e2b);
}

.coach-quiz-strip-continue {
  display: flex;
  align-items: center;
  width: 100%;
  color: var(--coach-bubble-fg, #312e2b);
}


/* Turn strip bubble has no inner scroll — hide fades so the chip row stays clean. */
.bubble--primary::before,
.bubble--primary::after {
  display: none;
}

.bubble-content.bubble-content--header-only {
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible;
  padding: var(--space-16, 16px) var(--space-16, 16px);
}

.bubble--secondary {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.bubble--has-scroll-panel {
  display: flex;
  flex-direction: column;
  min-height: var(--coach-container-height, 116px);
}

.bubble--has-scroll-panel .bubble-scroll-panel {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

/* Flex row: scrollable copy + always-visible custom rail (avoids overlay scrollbars that hide until hover). */
.bubble-scroll-panel {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  width: 100%;
  /* Keep scroll/copy under ::before/::after fades (see .bubble). */
  position: relative;
  z-index: 0;
}

.bubble-scroll-panel__rail {
  flex: 0 0 6px;
  position: relative;
  align-self: stretch;
  margin: 10px 6px 10px 0;
  border-radius: 4px;
  background: rgba(49, 46, 43, 0.1);
  overflow: hidden;
}

.bubble-scroll-panel__thumb {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  border-radius: 3px;
  background: rgba(49, 46, 43, 0.42);
  pointer-events: none;
}

.bubble {
  --top-opacity: 0;
  --bottom-opacity: 0;
  position: relative;
  width: 100%;
  background: #ffffff;
  border-radius: 10px;
  overflow: visible;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
}

.bubble::before,
.bubble::after {
  content: '';
  height: 4rem;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  z-index: 2;
}

.bubble::before {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 10px;
  opacity: var(--top-opacity);
  top: 0;
}

.bubble::after {
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent);
  border-radius: 10px;
  bottom: 0;
  opacity: var(--bottom-opacity);
}

.tip {
  position: absolute;
  left: -13px;
  top: var(--coach-tip-top, 50px);
  width: 14px;
  height: 22px;
  z-index: 4;
}

.tip img {
  width: 100%;
  height: 100%;
}

.bubble-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  min-height: 96px;
  max-height: var(--bubble-max-height, 116px);
  overflow-y: auto;
  flex: 1;
  min-width: 0;
}

/* Native bar hidden; `.bubble-scroll-panel__rail` is always visible when `contentScrollable`. */
.bubble-content--hide-native-scrollbar {
  scrollbar-width: none;
}

.bubble-content--hide-native-scrollbar::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.bubble-content:has(.bubble-header) {
  justify-content: flex-start;
}

.bubble-content:not(:has(.bubble-header)) {
  justify-content: center;
}

/* After the rule above: informational has no header but must stay top-aligned like secondary copy. */
.bubble-content.bubble-content--informational-message {
  justify-content: flex-start;
}

/* SPEC / DS: coach copy scrolls inside bubble after --bubble-max-height (panelStyle in App.vue). */
.bubble--secondary .bubble-scroll-panel {
  flex: 1 1 auto;
  min-height: 0;
}

.bubble--secondary .bubble-content--message {
  min-height: 0;
  max-height: var(--bubble-max-height, 116px);
  flex: 1 1 auto;
  overflow-y: auto;
  justify-content: flex-start;
}

/* Secondary bubble hugs copy; over cap, same scroll cap as informational `.bubble-content--informational-message` */
.coach-container--secondary-fit-content.coach-container--two-bubbles {
  min-height: 0;
}

.coach-container--secondary-fit-content .bubble-wrapper--two-bubbles {
  min-height: 0;
  flex: 0 1 auto;
}

.coach-container--secondary-fit-content .bubble-stack {
  flex: 0 0 auto;
  min-height: 0;
}

.coach-container--secondary-fit-content .bubble--secondary {
  flex: 0 0 auto;
  min-height: 0;
}

.coach-container--secondary-fit-content .bubble--secondary .bubble-scroll-panel {
  flex: 0 0 auto;
  min-height: 0;
}

.coach-container--secondary-fit-content .bubble--secondary .bubble-content--message {
  flex: 0 1 auto;
  max-height: var(--bubble-max-height, 116px);
  overflow-y: auto;
}

/* Dream Opening – Practice (`quiz-1`): full copy visible, wrapped, no inner scroll cap. */
.coach-container--secondary-fit-content.coach-container--secondary-expand .bubble--secondary .bubble-content--message {
  max-height: none;
  overflow-y: visible;
  overflow-wrap: break-word;
}

/* Informational: fill panel from line header down to footer; message scrolls inside */
.coach-container--fill-available.coach-container--two-bubbles,
.coach-container--fill-available.coach-container--informational-single {
  flex: 1;
  min-height: 0;
  height: 100%;
  max-height: none;
  margin-bottom: 0;
  align-items: stretch;
}

.coach-container--fill-available .bubble-wrapper--two-bubbles,
.coach-container--fill-available .bubble-wrapper--informational-single {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
  align-self: stretch;
}

.coach-container--fill-available .bubble-wrapper--informational-single {
  margin-bottom: 5px;
}

.coach-container--fill-available .bubble-stack {
  flex: 1;
  min-height: 0;
}

.coach-container--fill-available .bubble--secondary {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.coach-container--fill-available .bubble--secondary .bubble-scroll-panel {
  flex: 1 1 auto;
  min-height: 0;
}

.coach-container--fill-available .bubble--secondary .bubble-content--message {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
}

.coach-container--fill-available .bubble--informational-single {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.coach-container--fill-available .bubble--informational-single .bubble-scroll-panel--informational {
  /* basis 0 so panel takes flex space instead of growing to content (enables inner scroll + fades). */
  flex: 1 1 0;
  min-height: 0;
}

.coach-container--fill-available .bubble--informational-single .bubble-content--informational-message {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  max-height: none;
  overflow-y: auto;
}

.bubble-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.classification {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.classification-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/**
 * Typography: GNS `teams.design.public.tokens.semantic.typography`
 * - insight row: text-large-bold → `.cc-text-large-bold` (web)
 * - eval: text-medium-bold → `.cc-text-medium-bold`
 * - coach copy: special/speech → `.cc-text-speech` (dialogue)
 * DS utilities from `@chesscom/design-system/dist/cc-utils.css`
 */
.classification-text.cc-text-large-bold,
.eval-badge .cc-text-medium-bold,
.coach-message.cc-text-speech {
  font-family: var(--font-family-system, system-ui, sans-serif);
}

.classification-text {
  color: var(--coach-bubble-fg);
}

.eval-badge {
  border-radius: 5px;
  padding: 4px 8px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 24px;
  box-sizing: border-box;
}

.eval-badge.white-advantage {
  background: #e8e6e3;
}

.eval-badge.black-advantage {
  background: #d97b38;
}

.eval-badge .cc-text-medium-bold {
  white-space: nowrap;
}

.eval-badge.white-advantage .cc-text-medium-bold {
  color: #312e2b;
}

.eval-badge.black-advantage .cc-text-medium-bold {
  color: #ffffff;
}

.coach-message.cc-text-speech {
  margin: 0;
  color: var(--coach-bubble-fg);
  white-space: pre-line;
}

.empty {
  margin: 0;
  color: var(--coach-bubble-muted);
  font-size: 14px;
}

.start-position .bubble-wrapper {
  height: var(--coach-avatar-size, 80px);
  align-items: flex-end;
}

.start-position .bubble-content {
  min-height: 64px;
}

.start-position .tip {
  top: auto;
  bottom: var(--coach-tip-bottom, 2px);
}
</style>
