# Coach bubble — informational / intro-combined **fill height** variant (Move Trainer 3 Play Move)

Specs for the shell used when **`introCoachCombinedBubble`** (and optionally **`informationalSingleBubble`**) is combined with **`fillAvailableHeight`**.

## Layout

- **Hug rule**: When informational content is **shorter** than the panel “window”, the white bubble **fits its content** (no stretching to fill dead space). When content is **taller** than the window, height is **capped** (`max-height: 100%` up the chain) and **inner scroll** + fades apply.
- **Route shell**: Play Move coach wrapper uses **`flex: 0 1 auto`**, **`max-height: 100%`**, **`min-height: 0`** so it does not grow to consume the whole column; intro stack still **`flex: 1 1 0`** so the panel layout stays bounded.
- **CoachBubble** (`coach-container--fill-available` + informational single): **`align-items: flex-start`**, informational **`bubble-wrapper`** **`align-self: flex-start`** (no cross-axis stretch to the avatar row). Container **`flex: 0 1 auto`**, **`height: auto`**, **`max-height: 100%`**, **`min-height: 0`** (overrides default informational **`min-height: 116px`**).
- **Scroll region**: `.bubble-scroll-panel--informational` **`flex: 1 1 auto`**, **`min-height: 0`**, **`overflow: hidden`**; `.bubble-content--informational-message` **`overflow-y: auto`** and **`min-height: 0`** under fill-available (drops the default **96px** body min-height).
- **Optional pinned heading** (Play Move): Non-scrolling block above the scrollable body when **`introCombinedLeadBold`** is set.

## Scroll fades (“dissolve”)

- Implemented with `.bubble::before` / `.bubble::after` **linear gradients** and CSS vars **`--top-opacity`** / **`--bottom-opacity`** updated from **`updateScrollFades()`** on the **scrollable** `.bubble-content` ref (`contentRef`).
- **Do not** add `.bubble--informational-single::before|::after { display: none }` — that removes fades entirely for this layout.
- **Stacking**: `.bubble-scroll-panel` uses **`position: relative; z-index: 0`**; fades use **`z-index: 2`** so they paint above text.
- **Measurement**: **`ResizeObserver`** on `contentRef` and **`informationalScrollPanelRef`**, plus **`scheduleMeasureAfterLayout()`** (`nextTick` + double `requestAnimationFrame` when `fillAvailableHeight`) so overflow is detected after flex layout.

## Product overrides

- **Play Move bottom fade**: `MoveTrainer3LineCoach` may soften **`::after`** via `:deep(.bubble--informational-single::after)` (gradient stops / height).

## Typography — Play Move heading stack

Implemented via CoachBubble props:

- **`introCombinedLeadBold`** — line 1 (e.g. `Play c5`): `.coach-message.cc-text-speech`, **`font-weight: 700`**.
- **`introCombinedTurnStripRegular`** — line 2 (e.g. `Black to play`): same speech paragraph style, **`font-weight: 500`**. No icons / DS headline utilities.

When this heading is shown, the informational column uses **`font-family: -apple-system, BlinkMacSystemFont, sans-serif`** for all `.coach-message.cc-text-speech` in that stack (heading + scrolling body) so type matches end-to-end.

Copy for Move Trainer 3 is computed in **`moveTrainer3IntroStore.js`** (`coachPlayMoveLeadBold`, `coachPlayMoveTurnLabel`) from **`currentPly`** / **`currentFen`**.

## Related files

- `MoveTrainer/src/components/CoachBubble.vue`
- `my-app/src/views/move-trainer/move-trainer-3/MoveTrainer3LineCoach.vue`
- `my-app/src/views/move-trainer/move-trainer-3/moveTrainer3IntroStore.js`
