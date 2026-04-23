# Move Trainer — prototype spec & change policy

This document records **layout and behavior** agreed for the `MoveTrainer` Vue app, and **product rules** for ongoing work. It is **not** a promise that every line is implemented; check `MoveTrainerView.vue` and related files for the source of truth.

---

## 1. Change policy (read first)

- **Scope:** Only change what the request explicitly covers. If the request is to adjust **one component** on **one page**, touch **that** surface only. Do not refactor, rename, or “improve” unrelated files, routes, or other pages.
- **Design system:** When the spec says “use DS for X” (e.g. bubble title variant, buttons), resolve props/tokens through the **Chess.com design system** (`@chesscom/design-system` and MCP) — do not hardcode one-off colors or made-up component APIs.

---

## 2. Implemented in this prototype (retrospective)

The following are the main **panel / footer / coach** behaviors that were carved out in iteration:

| Area | Behavior |
|------|------------|
| **Footer: non–AQ** | `PanelFooterV10`: compact horizontal padding on `.panel-footer-container` (`0` L/R, `8px` top), tighter section padding (`12px` vertical, `16px` horizontal for actions/toolbar at M/L; `8px` on narrow `panel-sm`), CTA + icon toolbar, **no** forced 128px height on all routes. |
| **Footer: AQ (assisted quiz)** | Modifier `panel-footer-v10--assisted-quiz` on `PanelFooterV10` when the line is **assisted learning**: 128px shell, progress bar + Video + Hint, **restored** looser section padding (CoursesV10-style) inside that variant. |
| **Standalone quiz** | `kind === 'quiz'`: **Video** + **Hint** CTAs restored in the footer; **no** move list. |
| **Assisted (AQ) vs quiz layout** | `isQuizLayoutPage` = standalone quiz **or** assisted. Move list is hidden for **informational** and **quiz layout** routes. |
| **Coach fill** | `coachFillsContentWindow` = `isReview && (isInformationalPage \|\| isQuizLayoutPage)`: coach section flexes, `CoachBubble` `fill-available-height`, `screen-content--footer-only` so the strip under the coach is only top buttons (if any) + footer. |
| **Layout shell** | `screen-content` / `screen-content-main` structure: scrollable middle grows; `PanelFooterV10` + `review-panel-footer` stay pinned at the bottom of the review column. |
| **Progress bar (AQ)** | `CcProgressBar` variants per DS: `default` \| `success` \| `warning` \| `error`. No separate “empty” variant: **empty** = `default` at `0%` before a graded move on the relevant step. |

---

## 3. Page-2 (quiz) — **planned** product spec

**“Page-2”** is used here as the product name for a ** quiz-mode step** (exact route / line slug TBD — see open questions). When the user **lands** on that page:

### 3.1 On enter

- **Reset the board** to the agreed starting FEN/position for this page (TBD: which FEN, e.g. start position or a custom one).
- Mode = **quiz**: the app plans legal moves in advance; grading is not “any legal move is ok” for this node — it follows the rules in §3.2.

### 3.2 Plannable moves (this page only, unless extended later)

- **Correct:** White plays **1. e4** (only this move is graded correct).
- **Incorrect:** **Any other move** by White (including any other first move) is **incorrect** for quiz grading on this page.

This “single correct move / everything else = incorrect” rule should be the **default mental model** for this quiz mode unless a future page spec says otherwise.

### 3.3 After an **incorrect** move (in order)

1. **Audio:** Play the **incorrect** move sound, **at the same time** as:
   - The **top bubble title / strip** switches from the normal “to move” treatment to a title variant labeled **“Incorrect”** (exact variant: **per design system** — to be selected from `Cc` bubble / text patterns when implementing).
2. The **message in the top bubble** (or primary coach strip) updates to: **"Let's continue!"**  
   The **incorrectly moved piece** animates or snaps **back** to its origin square.
3. **Autoplay the correct move** (the engine / rules apply **1. e4** on the board as if it were the correction).
4. **Notation line in the coach:** Under the last paragraph of the coach copy, add a line such as **1. e4**; that line is **visually selected** (style per DS).  
   **Footer / CTAs:** replace the current pair with a **single primary** CTA: **"Next"**.

(Exact wiring of which bubble is “top” vs message body should match the existing two-bubble + quiz layout in `MoveTrainerView` / `CoachBubble` at implementation time.)

### 3.4 Open questions (answer before or during implementation)

1. **What is “page-2” in the codebase?** Route name, path segment (e.g. `/.../page-2`), or `moveTrainerLineOrder` slug? Should this replace **quiz-1**, a new line entry, or an **assisted** step only?
2. **Starting FEN** on land: always standard start, or a custom FEN?
3. **“Top bubble” vs “message”** after incorrect: In our layout, is “White to move / White to play” the **primary** strip, and the long copy in the **secondary** bubble? Confirm so “Incorrect” and “Let’s continue!” go to the right nodes.
4. **DS tokens:** Confirm the **bubble “title” variant** for the incorrect state (e.g. semantic color + text style from design system MCB).
5. **Next CTA:** Navigates where — next plies, next line, or next “page-3” route?
6. **Sound:** Reuse an existing `incorrect` asset from the app, or a specific file name / API?

---

## 4. File map (for implementers)

| Concern | Primary files |
|--------|----------------|
| Routes / line order | `src/data/moveTrainerLineOrder.js`, `src/router/*` |
| Main shell, board, quiz, footer | `src/views/MoveTrainerView.vue` |
| Footer frame | `src/components/PanelFooterV10.vue` |
| Coach | `src/components/CoachBubble.vue` |

No code was changed in this documentation-only pass beyond adding this file.
