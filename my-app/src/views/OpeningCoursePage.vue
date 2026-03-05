<script setup>
/**
 * Opening Course Page (course page / chapter page for Opening Courses V1).
 * Self-contained so design changes here do not affect Courses.vue or CoursesV9.vue.
 * Used when user clicks "Start Course" from the Opening Courses V1 list.
 */
import { ref } from 'vue'
import { CcButton, CcChip, CcIcon, CcTabGroup, CcTabItem } from '@chesscom/design-system'
import ProgressCircle from '../components/ProgressCircle.vue'
import StatsCards from '../components/StatsCards.vue'

const props = defineProps({
  /** Selected opening card (from Opening Courses V1 list) */
  card: { type: Object, default: null },
  /** List of variation names to show as lines */
  variations: { type: Array, default: () => [] },
  /** Base URL for assets (e.g. '' or '/temp_project/') */
  baseUrl: { type: String, default: '/' },
  /** Function (piece) => image URL for piece thumbnails on cover */
  getPieceImage: { type: Function, required: true },
})

// Local state – not shared with parent or V9
const tabsActive = ref('content')
const statsPanelExpanded = ref(false)
function toggleStatsPanel() {
  statsPanelExpanded.value = !statsPanelExpanded.value
}

// Placeholder data for stats drawer (opening-course only)
const statsCards = [
  { label: 'Informational', value: '0', change: '' },
  { label: 'Trainable', value: '0', change: '' },
  { label: 'Tactics/Puzzle', value: '0', change: '', showLock: true },
  { label: 'Alternatives', value: '0', change: '' },
]
const masteryLevelItems = [
  { level: 'L1', title: 'Rookie', counter: 0, locked: false },
  { level: 'L2', title: 'Keen Courser', counter: 0, locked: false },
  { level: 'L3', title: 'Apprentice', counter: null, locked: true },
  { level: 'L4', title: 'Rank Riser', counter: null, locked: true },
  { level: 'L5', title: 'Booked Up', counter: null, locked: true },
  { level: 'L6', title: 'Expert', counter: null, locked: true },
  { level: 'L7', title: 'Encyclopaedic', counter: null, locked: true },
  { level: 'L8', title: 'Master', counter: null, locked: true },
]
</script>

<template>
  <div
    class="opening-course-page panel-content courses-content courses-content--tabs-scroll-linked courses-content--v6"
    role="region"
    aria-label="Course content"
    data-name="OpeningCoursePage"
  >
    <!-- Tabs: Learn | Practice -->
    <div class="course-tabs-wrap course-tabs-wrap--scroll-linked course-tabs-wrap--top">
      <cc-tab-group variant="secondary" class="course-tabs-ds" role="tablist" aria-label="Course">
        <cc-tab-item
          id="content"
          label="Learn"
          :isActive="tabsActive === 'content'"
          @click="tabsActive = 'content'"
        />
        <cc-tab-item
          id="stats"
          label="Practice"
          :isActive="tabsActive === 'stats'"
          @click="tabsActive = 'stats'"
        />
      </cc-tab-group>
    </div>
    <!-- Course card (one: selected opening) -->
    <div class="course-card-frame course-card-frame--with-completion" :class="{ 'course-card-frame--v7-practice': tabsActive === 'stats' }">
      <article class="opening-course-card opening-course-card--hover-v1 course-card--main" data-name="Course Card">
        <div class="opening-course-card__inner">
          <div class="opening-course-card__content-wrap">
            <div class="opening-course-card__cover-wrap">
              <div class="course-cover-board" aria-hidden="true" data-name="CourseCoverBoard" :title="card?.firstMove">
                <svg class="course-cover-board__svg" fill="none" preserveAspectRatio="none" viewBox="0 0 96 96" aria-hidden="true">
                  <g id="course-cover-board-grid">
                    <path d="M48 24H24V48H48V24Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M96 24H72V48H96V24Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M24 0H0V24H24V0Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M48 0H24V24H48V0Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M48 48H24V72H48V48Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M24 24H0V48H24V24Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M24 72H0V96H24V72Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M72 24H48V48H72V24Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M72 72H48V96H72V72Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M96 0H72V24H96V0Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M96 48H72V72H96V48Z" fill="var(--color-chess-dark, #779556)" />
                    <path d="M72 0H48V24H72V0Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M48 72H24V96H48V72Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M96 72H72V96H96V72Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M24 48H0V72H24V48Z" fill="var(--color-chess-light, #EBECD0)" />
                    <path d="M72 48H48V72H72V48Z" fill="var(--color-chess-light, #EBECD0)" />
                  </g>
                </svg>
                <div
                  v-for="(piece, i) in (card?.coverPieces ?? [])"
                  :key="`opening-card-${i}-${piece.type}`"
                  class="course-cover-board__piece"
                  :style="{ '--file': piece.col, '--rank': piece.row }"
                >
                  <img :src="getPieceImage({ type: piece.type })" alt="" class="course-cover-board__piece-img" width="24" height="24" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div class="opening-course-card__content" :class="{ 'opening-course-card__content--v7-completion': true, 'opening-course-card__content--v7-practice': tabsActive === 'stats' }">
              <div class="opening-course-card__started-header">
                <h3 class="opening-course-card__title">{{ card?.title ?? 'Course' }}</h3>
                <div v-if="card?.type" class="opening-course-card__color-icon-wrap">
                  <CcIcon
                    :name="card.type === 'White' ? 'piece-white-king' : 'piece-black-king'"
                    variant="color"
                    :size="16"
                    class="opening-course-card__color-icon"
                    aria-hidden="true"
                    :title="card.type === 'White' ? 'White' : 'Black'"
                  />
                </div>
              </div>
              <p class="opening-course-card__description course-card--author">{{ card?.description ?? '' }}</p>
              <div v-if="tabsActive === 'content'" class="course-card-mastery-row" data-name="Progress">
                <div class="course-card-mastery-group">
                  <div
                    class="course-card-completion course-card-completion--in-mastery-row"
                    data-name="Completion"
                    role="progressbar"
                    aria-valuenow="0"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Course completion"
                  >
                    <div class="course-card-completion__track" data-name="Progress bar">
                      <div class="course-card-completion__fill" data-name="Progress" style="width: 0px" />
                    </div>
                    <p class="course-card-completion__label">0%</p>
                  </div>
                </div>
                <button type="button" class="footer-icon-btn course-card-stats-icon" :class="{ 'stats-icon--active': statsPanelExpanded }" aria-label="Stats" @click="toggleStatsPanel">
                  <CcIcon name="graph-bars-statistics" variant="glyph" :size="20" class="footer-icon" />
                </button>
              </div>
              <div v-else-if="tabsActive === 'stats'" class="course-card-mastery-row" data-name="Mastery progress">
                <div class="course-card-mastery-group">
                  <div class="course-card-mastery-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="8" aria-label="Mastery level">
                    <div class="course-card-mastery-bar__segments">
                      <div v-for="i in 8" :key="i" class="course-card-mastery-bar__segment" />
                    </div>
                    <div class="course-card-mastery-bar__fill" style="width: 0%">
                      <div class="course-card-mastery-bar__fill-gradient" aria-hidden="true" />
                    </div>
                  </div>
                  <div class="course-card-av-level extra-data-next-level" data-name="Mastery">
                    <span class="extra-data-label">Mastery:</span>
                    <div class="extra-data-level-chip" data-name="LevelChip">
                      <CcChip label="L1" color="aqua" variant="translucent" :is-uppercase="false" label-class="extra-data-level-chip-label" />
                    </div>
                  </div>
                </div>
                <button type="button" class="footer-icon-btn course-card-stats-icon" :class="{ 'stats-icon--active': statsPanelExpanded }" aria-label="Stats" @click="toggleStatsPanel">
                  <CcIcon name="graph-bars-statistics" variant="glyph" :size="20" class="footer-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
    <!-- ToC area: overlay + drawer + tab panels -->
    <div class="stats-overlay-toc-wrap">
      <div
        v-if="statsPanelExpanded"
        class="stats-drawer-overlay"
        aria-hidden="true"
        @click="toggleStatsPanel"
      />
      <div class="stats-drawer-wrap">
        <div v-if="statsPanelExpanded" class="stats-drawer" role="dialog" aria-label="Stats">
          <div class="stats-drawer__inner">
            <div class="course-progress-header stats-drawer__title stats-drawer__title--hidden" data-name="Stats Header" aria-hidden="true">
              <span class="course-progress-title">{{ tabsActive === 'stats' ? 'Mastery stats' : 'Stats' }}</span>
            </div>
            <template v-if="tabsActive === 'content'">
              <StatsCards :cards="statsCards" />
            </template>
            <template v-else-if="tabsActive === 'stats'">
              <div class="advanced-stats-header stats-drawer__header" data-name="Practice Filter">
                <span class="advanced-stats-header-label">Level</span>
                <span class="advanced-stats-header-label">Variations</span>
              </div>
              <div class="advanced-stats-variations" role="list">
                <div
                  v-for="item in masteryLevelItems"
                  :key="item.level"
                  class="mastery-level-item"
                  :class="{ 'mastery-level-item--locked': item.locked }"
                  role="listitem"
                  data-name="MasteryLevelItemContainer"
                >
                  <div class="mastery-level-item-left">
                    <CcChip
                      v-if="!item.locked"
                      :label="item.level"
                      color="aqua"
                      :is-uppercase="false"
                      label-class="mastery-level-chip-label"
                    />
                    <CcChip
                      v-else
                      :label="item.level"
                      color="gray"
                      variant="translucent"
                      :is-uppercase="false"
                      label-class="mastery-level-chip-label"
                    />
                    <span class="mastery-level-title">{{ item.title }}</span>
                  </div>
                  <div class="mastery-level-counter-wrap">
                    <template v-if="item.locked">
                      <span class="mastery-level-lock" aria-hidden="true">
                        <CcIcon name="tool-lock-blank" variant="glyph" :size="20" class="mastery-level-lock-icon" />
                      </span>
                    </template>
                    <template v-else>
                      <span class="mastery-level-counter">{{ item.counter }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
        <!-- Content tab: sections list -->
        <div v-show="tabsActive === 'content'" class="course-tab-panel" :class="{ 'course-tab-panel--drawer-open': statsPanelExpanded }" role="tabpanel" aria-label="Content">
          <div class="sections-list">
            <div class="section-item" data-section-id="opening-course">
              <div class="v23-section-sticky-wrap">
                <div class="v23-section-timeline-wrap v23-section-timeline-wrap--v4 v23-section-timeline-wrap--v6">
                  <div class="v23-section-timeline-wrap__line" aria-hidden="true" />
                  <div
                    class="chapter-v2 chapter-v2--header chapter-v2--sticky-title-v23 chapter-v2--no-accordion chapter-v2--v4-timeline chapter-v2--v6-timeline-right"
                    data-name="Chapter V2"
                  >
                    <span class="chapter-v2-border" aria-hidden="true" />
                    <div class="chapter-v2__timeline-col" aria-hidden="true">
                      <ProgressCircle
                        :key="'opening-course-progress'"
                        :progress="0"
                        :size="24"
                        class="chapter-v2__timeline-progress"
                      />
                    </div>
                    <div class="chapter-progress-name">
                      <div class="chapter-content">
                        <span class="chapter-title">{{ card?.title ?? 'Course' }}</span>
                      </div>
                      <div class="chapter-variations">
                        <span class="chapter-count">0/{{ variations.length }}</span>
                        <span class="chapter-chevron-wrap" aria-hidden="true">
                          <CcIcon name="arrow-chevron-bottom" variant="glyph" :size="16" class="chapter-chevron" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="v23-expandable v23-expandable--open">
                    <div class="move-list-wrap">
                      <div class="move-list" role="list" data-name="Lines" aria-label="Lines">
                        <div
                          v-for="(name, i) in variations"
                          :key="i"
                          class="move-item move-item--inactive move-item--uncompleted"
                          role="listitem"
                          data-name="Line"
                        >
                          <div class="move-item-content">
                            <div class="move-item-inner">
                              <div class="move-item-plys">
                                <span class="move-item-check-wrap" aria-hidden="true">
                                  <CcIcon name="mark-check" variant="glyph" :size="16" class="move-item-check" />
                                </span>
                                <span class="move-item-text">{{ name }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Stats tab: placeholder -->
        <div v-show="tabsActive === 'stats'" class="course-tab-panel course-tab-panel--stats course-tab-panel--v7" :class="{ 'course-tab-panel--drawer-open': statsPanelExpanded }" role="tabpanel" aria-label="Stats">
          <div class="sections-list">
            <div class="section-item" data-section-id="opening-course-practice">
              <div class="v23-section-sticky-wrap">
                <div class="v23-section-timeline-wrap v23-section-timeline-wrap--v4 v23-section-timeline-wrap--v6">
                  <div class="v23-section-timeline-wrap__line" aria-hidden="true" />
                  <div
                    class="chapter-v2 chapter-v2--header chapter-v2--sticky-title-v23 chapter-v2--no-accordion chapter-v2--v4-timeline chapter-v2--v6-timeline-right"
                    data-name="Chapter V2"
                  >
                    <span class="chapter-v2-border" aria-hidden="true" />
                    <div class="chapter-v2__timeline-col" aria-hidden="true">
                      <ProgressCircle :key="'opening-practice-progress'" :progress="0" :size="24" class="chapter-v2__timeline-progress" />
                    </div>
                    <div class="chapter-progress-name">
                      <div class="chapter-content">
                        <span class="chapter-title">{{ card?.title ?? 'Course' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="v23-expandable v23-expandable--open">
                    <div class="move-list-wrap">
                      <div class="move-list" role="list" data-name="Lines" aria-label="Lines">
                        <div
                          v-for="(name, i) in variations"
                          :key="i"
                          class="move-item move-item--inactive move-item--uncompleted"
                          role="listitem"
                          data-name="Line"
                        >
                          <div class="move-item-content">
                            <div class="move-item-inner">
                              <div class="move-item-plys">
                                <span class="move-item-check-wrap" aria-hidden="true">
                                  <CcIcon name="mark-check" variant="glyph" :size="16" class="move-item-check" />
                                </span>
                                <span class="move-item-text">{{ name }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Opening course page only – does not affect Courses.vue or CoursesV9.vue */
.opening-course-page {
  /* Wrapper for any future page-specific overrides */
}
</style>
