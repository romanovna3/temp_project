# Coach bubble — informational / intro-combined **fill height** variant (Move Trainer 3 Play Move)

Specs for the shell used when **`introCoachCombinedBubble`** (and optionally **`informationalSingleBubble`**) is combined with **`fillAvailableHeight`**.

## Layout

- **Route shell**: Parent (`MoveTrainer3LineCoach` + `OpeningCoursesV3`) gives the coach column **`flex: 1 1 0`** + **`min-height: 0`** so the bubble can consume remaining panel height above the footer.
- **CoachBubble**: `coach-container--fill-available` sets **`max-height: none`** on the informational wrapper stack and uses **`flex: 1` / `min-height: 0`** down to `.bubble--informational-single`.
- **Scroll region**: `.bubble-scroll-panel--informational` uses **`flex: 1 1 0`** and **`min-height: 0`** so flex allocates a **bounded** height (not “grow to content”). Inner `.bubble-content--informational-message` scrolls with **`overflow-y: auto`**.
- **Optional pinned heading** (Play Move): When **`introCombinedLeadBold`** is set, a **non-scrolling** block sits above the scrollable body (same horizontal inset as body copy). Long coach copy scrolls **below** it only.

## Scroll fades (“dissolve”)

- Implemented with `.bubble::before` / `.bubble::after` **linear gradients** and CSS vars **`--top-opacity`** / **`--bottom-opacity`** updated from **`updateScrollFades()`** on the **scrollable** `.bubble-content` ref (`contentRef`).
- **Do not** add `.bubble--informational-single::before|::after { display: none }` — that removes fades entirely for this layout.
- **Stacking**: `.bubble-scroll-panel` uses **`position: relative; z-index: 0`**; fades use **`z-index: 2`** so they paint above text.
- **Measurement**: **`ResizeObserver`** on `contentRef` and **`informationalScrollPanelRef`**, plus **`scheduleMeasureAfterLayout()`** (`nextTick` + double `requestAnimationFrame` when `fillAvailableHeight`) so overflow is detected after flex layout.

## Product overrides

- **Play Move bottom fade**: `MoveTrainer3LineCoach` may soften **`::after`** via `:deep(.bubble--informational-single::after)` (gradient stops / height).

## Typography — Play Move heading stack

Implemented via CoachBubble props:

- **`introCombinedLeadBold`** — line 1 (e.g. `Play c5`): **`cc-text-large-bold`**.
- **`introCombinedTurnStripRegular`** — line 2 (e.g. `White to play`): **`cc-text-large`** (regular).
- **`introCombinedTurnSide`** — `'white' \| 'black'` for the turn square (`white-indicator` / `black-indicator`).

Copy for Move Trainer 3 is computed in **`moveTrainer3IntroStore.js`** (`coachPlayMoveLeadBold`, `coachPlayMoveTurnLabel`, `coachPlayMoveTurnSide`) from **`currentPly`** / **`currentFen`**.

## Related files

- `MoveTrainer/src/components/CoachBubble.vue`
- `my-app/src/views/move-trainer/move-trainer-3/MoveTrainer3LineCoach.vue`
- `my-app/src/views/move-trainer/move-trainer-3/moveTrainer3IntroStore.js`
