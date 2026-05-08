# Move Trainer 3 — flow specification

Product-facing description of how **Move Trainer 3** behaves in **OpeningCoursesV3** when the user **moves forward through the lesson** vs **steps through positions with the footer chevrons** (replay scrub). Implementation lives primarily in:

- `my-app/src/views/move-trainer/move-trainer-3/moveTrainer3IntroStore.js` — state, FEN, coach copy switches, footer caps  
- `my-app/src/views/move-trainer/move-trainer-3/MoveTrainer3LineCoach.vue` — which coach layout is visible  
- `my-app/src/views/move-trainer/move-trainer-3/MoveTrainer3PanelFooter.vue` — footer chrome (movelist, progress, CTAs, chevrons)  
- `my-app/src/views/OpeningCoursesV3.vue` — board sync, route alignment with furthest progress, guards (e.g. ply `0→1` snap on cold load)

Nested routes (all under **`MoveTrainer3Shell`** → single **`OpeningCoursesV3`** instance):

| Route segment | Layout role |
|----------------|-------------|
| `/move-trainer/move-trainer-3` | **Intro landing** — vertical move list under coach; **Start Learning** |
| `/move-trainer/move-trainer-3/play-move` | **Play Move** — Black tries main-line replies on board |
| `/move-trainer/move-trainer-3/opponents-move-{N}` | **Opponents Move (OM)** checkpoint **N** — scripted White reply + checkpoint coach |

---

## Glossary

- **`currentPly`** — Cursor for “which position we’re looking at.” `0` = start FEN before any half-move from the demo line; after half-move *k* has been *played on the board*, the cursor is `k` (see `currentFen` in the store). Footer chevrons and board highlights follow this value.
- **`moveTrainer3FooterNavMaxPly`** — Furthest ply **unlocked by gameplay** (correct Black moves on Play Move, scripted advances on OM). Footer **forward** chevron cannot go past `min(lineLength, footerNavMaxPly)`. Does **not** move when only scrubbing.
- **Live progression** — User is at the **frontier**: `currentPly === moveTrainer3FooterNavMaxPly` (after Start Learning). Coach copy reflects **what to do next** (“Play …”, OM checkpoint text, etc.).
- **Replay scrub** — User stepped **behind** the frontier: `moveTrainer3StartLearningNonce > 0` and `currentPly < moveTrainer3FooterNavMaxPly`. Coach shows **the same copy as live progression** where OM defines it: White **`whiteCommentary`** (**2.d5**, **4.f4**, **5.Bxf4**), step **2** **`readingLead`** for **3.e4**, Black **`afterBlackMoveAuthorNote`** when the half-move matches that step’s **`Play …`** lead; otherwise **`MOVE_TRAINER_3_LINE_GAME` `coachText`**. **1.d4** / **1...c5** stay **heading-only** in the preview bubble; **URL stays tied to furthest progress**, not the scrub cursor (see OpeningCourses route watcher).
- **`moveTrainer3CoachReplayScrubbing`** — Store flag for replay scrub; drives coach bubble mode and Play Move heading/subtitle behavior.

---

## Layout types (coach + footer)

These are the **distinct coach/footer presentations** users see. **`MoveTrainer3LineCoach`** chooses coach branch **top to bottom**; the **replay scrub** branch wins whenever replay scrub is active (even on OM routes or during phases that would otherwise show reading OM UI).

### L1 — Intro landing

- **Route:** `/move-trainer/move-trainer-3`
- **Coach:** Default combined bubble — insight header when move context exists, short intro message (“Let’s learn…”), **start-position** styling when applicable.
- **Below coach:** Vertical **`MoveList`** (scrolls with intro stack).
- **Footer:** Intro variant — **Video** + **Start Learning** (no horizontal movelist, no progress bar in Play Move shell layout).

### L2 — Play Move (live)

- **Route:** `/play-move`
- **Coach:** Single **combined** bubble, **fill height** — pinned heading **`Play {san}`** when Black is on move; **“Black to play”** subtitle in live mode; body empty for current product (`MOVE_TRAINER_3_PLAY_MOVE_COACH_MESSAGE`).
- **Footer:** Play Move shell — horizontal **PG-style movelist** (plies ≤ frontier), **progress bar** (Black steps completed / total Black moves in line), **Video** + **Hint**, chevrons.

### L3 — Play Move (replay scrub)

- **Same route as L2**, but **`showMt3ReplayCoachPreview`** in `MoveTrainer3LineCoach`.
- **Coach:** Separate **non-fill** combined bubble — **notation** + body matching **live OM / chapter copy** when defined (**`whiteCommentary`** for **`2.d5`**, **`4.f4`**, **`5.Bxf4`**; **`readingLead`** for **`3.e4`**; **`afterBlackMoveAuthorNote`** for matching Black replies such as **`…e5`** / **`…Nf6`**), else **line `coachText`**; **1.d4** / **1...c5** remain **heading-only**. At **`currentPly === 0`**, heading shows **first White move** (e.g. `1.d4`) with no body.
- **Footer:** Same shell as L2; movelist highlights **san** for `currentPly - 1` (no pill highlight at ply `0`); chevrons move **`currentPly`** within `[0, footerNavMaxPly]`.

### L4 — OM variant 1 (live)

- **Route:** `/opponents-move-{N}` with configured checkpoint (e.g. `whiteCommentary` + `nextBlackLeadBold`).
- **Coach:** **Two bubbles** — (1) informational-style **White commentary**; (2) combined **Play …** + turn strip (avatar hidden on second row via scoped CSS).
- **Footer:** Same Play Move **shell** as L2 (horizontal movelist, progress, Video + Hint, chevrons).

### L5 — OM variant 1 (replay scrub)

- **Same route as L4**, replay scrub active.
- **Coach:** **Same single replay bubble as L3** (unified replay coach) — **not** the two-bubble OM layout while scrubbing behind the frontier.
- **Footer:** Same as L2/L4.

### L6 — OM author reading

- **Route:** Still `/opponents-move-{N}`; triggered after successful graded Black move only when checkpoint defines non-empty **`afterBlackMoveAuthorNote`**. Live OM chapter fields (**`readingLead`**, rails, etc.) do **not** open this overlay — they run **before** Black plays on that OM step.
- **Coach:** One **informational single** bubble, **fill height**, long author text; **Continue** in footer instead of Hint (same toolbar chevrons).
- **Replay scrub:** If user scrubs behind frontier while this phase is active, **replay coach (L3/L5 style)** still takes **precedence** in `MoveTrainer3LineCoach` (template order). Product should be aware of this interaction.

### L7 — OM placeholder / unconfigured

- **Route:** `/opponents-move-{N}` without variant-1 checkpoint data.
- **Coach:** Single placeholder bubble.

---

## Flow A — Progressing forward (gameplay)

Steps describe **typical** demo line behavior; **coach copy is product-authored** — `MOVE_TRAINER_3_OPPONENTS_MOVE_CHECKPOINTS` (**`whiteCommentary`**, **`readingLead`** / rails, **`afterBlackMoveAuthorNote`**) only. **`MOVE_TRAINER_3_LINE_GAME`** fields `coachText` stay **empty**. **Replay scrub** may still show **`whiteCommentary`** for **White `4.f4`** and **`5.Bxf4`** (checkpoints **3** and **4** — same strings as live OM variant 1).

### A0 — Intro

| Surface | Behavior |
|--------|----------|
| Board | Initial line FEN (or intro-specific sync from OpeningCourses). |
| Coach | L1 — welcome / line framing. |
| Footer | Start Learning only (intro footer). |
| `currentPly` | Often `0`; intro route watcher resets footer max ply. |

### A1 — Start Learning

| Surface | Behavior |
|--------|----------|
| Animation | White plays **1.d4** (OpeningCourses owns animation; store may skip board sync briefly). |
| `currentPly` | Advances to **1** after first checkpoint (after 1.d4). |
| Route | Navigates to **`/play-move`**. |
| `footerNavMaxPly` | Bumped as gameplay advances (not by footer taps). |

### A2 — Play Move live (Black to move)

| Surface | Behavior |
|--------|----------|
| Board | FEN for **frontier** position; hint arrows when implemented use **next Black SAN** at `currentPly`. |
| Coach | L2 — **Play {san}** + **Black to play**. |
| Footer | Horizontal movelist through frontier; progress reflects **completed Black successes**; forward chevron **disabled** at frontier until next ply unlocked by correct move / automation. |

### A3 — After correct Black move on Play Move

| Surface | Behavior |
|--------|----------|
| Progress | `moveTrainer3BlackMovesCompleted` increments. |
| `currentPly` / max | Advanced via **`advanceMoveTrainer3PlyFromGameplay`** (may step through scripted White half-moves depending on OpeningCourses). |
| Route | Stays **`/play-move`** until Black-move count implies an OM step; OpeningCourses aligns **`/opponents-move-{N}`** from **`footerNavMaxPly`** / Black-move-through-ply helper — **not** from transient scrub cursor. |

### A4 — OM checkpoint live (variant 1)

| Surface | Behavior |
|--------|----------|
| Board | Scripted White reply animates on entry; then Black may be on move per checkpoint. |
| Coach | L4 — checkpoint **commentary** + **Play …** strip. |
| Footer | Same shell as Play Move; frontier caps forward chevron. |

### A4b — OM step 2 → step 3 after …d6

| Surface | Behavior |
|--------|----------|
| Trigger | Correct **…d6** on **`/opponents-move-2`** (live chapter already consumed via **Continue**). |
| Post-move | No Black “coach after move” linger — **`afterBlackMoveAuthorNote`** is absent on step 2; flow routes forward immediately. |
| Route | **`/opponents-move-3`**. |
| Board | **`advanceMoveTrainer3PlyFromGameplay`** after **d6**, then scripted **4.f4** (OpeningCourses OM White-reply watcher). |
| Coach | L4 — **`whiteCommentary`**: *Direct play like this does not threaten Black at all.* + **Play exf4** / Black turn strip (main line). |

### A4c — OM step 4 after …exf4 (post-**Bxf4** commentary)

| Surface | Behavior |
|--------|----------|
| Trigger | Correct **…exf4** on **`/opponents-move-3`**. |
| Route | **`/opponents-move-4`**. |
| Board | Ply advances after **exf4**, then scripted **Bxf4** (OM White-reply watcher). |
| Coach | L4 — top **`whiteCommentary`** on rapid White development / **e5** outpost / **e4** weakness + bottom instruction bubble **Play Nf6** + Black turn strip. |

### A4d — OM step 4 after …Nf6: author note → scripted White → **Play Move**

| Surface | Behavior |
|--------|----------|
| Trigger | Correct **…Nf6** on **`/opponents-move-4`**. |
| Post-move | L6 — **`afterBlackMoveAuthorNote`** only (*For now, we just develop.*); **no** OM Play strip until **Continue**. Footer **Continue** (no Hint). |
| Continue | Scripted **Nc3** from OpeningCourses (`afterAuthorContinuePlayWhiteSan` on checkpoint **4**), ply advances, then **`/play-move`**. |
| Next | L2 — **Play a6** (and Black strip only — empty Play Move body; no extra coach copy). |

Learn-shell routing after Black milestones uses **`moveTrainer3LearnShellTargetFromFrontier`** / **`moveTrainer3LearnShellPathAfterBlackSuccessCount`**: **`/opponents-move-{N}`** only when checkpoint **N** exists; otherwise **`/play-move`** (so there is no empty **`opponents-move-5`** after this segment).

### A5 — OM author reading (optional checkpoint field)

| Surface | Behavior |
|--------|----------|
| Coach | L6 — long note; **Continue** dismisses overlay (`resetMoveTrainer3OmAuthorNoteStep`). Either **`router.replace`** to **`moveTrainer3LearnShellTargetFromFrontier()`**, or checkpoint **`afterAuthorContinue*`** runs scripted White then **`/play-move`**. |
| Footer | Video + **Continue** + chevrons (chevrons still tied to `currentPly` / max rules). |

---

## Flow B — Going back (and forward within cap) via chevrons

Assumes **Start Learning has run** (`moveTrainer3StartLearningNonce > 0`) so Play Move **shell** footer (movelist + progress + chevrons) applies on **`/play-move`** and **`/opponents-move-*`**.

### B1 — What changes vs live

| Mechanism | Behavior |
|-----------|----------|
| **`currentPly`** | Decremented/incremented by **`goBack` / `goForward`**; **does not** shrink `footerNavMaxPly`. |
| **Replay scrub flag** | **`currentPly < footerNavMaxPly`** ⇒ replay coach + replay-specific headings on Play Move path inside unified replay bubble. |
| **Route** | Remains aligned to **furthest gameplay** (OpeningCourses watcher); scrubbing does **not** flip OM ⇄ Play Move arbitrarily — avoids coach/movelist flicker. |
| **Board** | Always reflects **`currentFen`** from **`currentPly`** (initial position at ply `0`). Last-move highlight follows last applied half-move for that ply. |

### B2 — Chevron bounds (after Start Learning)

| Direction | Bound |
|-----------|--------|
| **Back** | Down to **`currentPly === 0`** (starting position before **1.d4**). Prev disabled at **0**. |
| **Forward** | Up to **`footerNavMaxPly`** (cannot preview beyond unlocked line). |

### B3 — Coach while scrubbing

| Context | UI |
|---------|-----|
| **Play Move or OM route**, replay scrub | **L3 / L5** — single **replay preview** bubble: bold **half-move label** + body when defined: Black → matching **`afterBlackMoveAuthorNote`**; White **`4.f4`** / **`5.Bxf4`** → checkpoints **3** / **4** **`whiteCommentary`** (same as OM); otherwise **heading-only**; **ply 0** → **1.d4** heading-only. |
| **At frontier** (`currentPly === footerNavMaxPly`) | Back to **live** coach for that route: **L2** or **L4** / **L6** per phase — **not** replay bubble. |

### B4 — Footer movelist during scrub

| Element | Behavior |
|---------|----------|
| **Visible SANs** | All half-moves up to **frontier** (`footerNavMaxPly`), not merely up to `currentPly` — list stays stable while scrubbing. |
| **Highlight** | Tracks **`currentPly`**: active index `currentPly - 1` in horizontal list; **none** at ply `0`. |

### B5 — Cold load / guards (reference)

| Situation | Behavior |
|-----------|----------|
| **`/play-move` reload** with store ply **0** | OpeningCourses may **snap ply `0→1`** so coach/board aren’t stuck in an empty “White to move” state — **unless** replay scrub guard applies (`currentPly < footerNavMaxPly` with nonce), so scrubbing to **0** after learning **does not** get snapped away. |

---

## Summary matrix

| | **Live at frontier** | **Replay scrub (`currentPly < max`)** |
|--|----------------------|--------------------------------------|
| **Route** | Matches Black milestones / OM step from progress | **Same URL** as frontier (progress-anchored) |
| **Board** | Frontier position | Position at **`currentPly`** (can be start FEN) |
| **Play Move coach** | **Play …** + Black subtitle | **Unified replay bubble** — notation + **`afterBlackMoveAuthorNote`** when matched, or **`whiteCommentary`** for replay on **4.f4** / **5.Bxf4** (checkpoints 3–4) |
| **OM variant 1 coach** | Two bubbles (commentary + Play strip) | **Unified replay bubble** (two-bubble OM hidden) |
| **Intro coach** | N/A after shell switch | N/A |
| **Footer forward cap** | At `footerNavMaxPly` | Same cap |
| **Footer movelist** | Highlights frontier half-move when cursor there | Highlight follows scrub cursor |

---

## Maintenance

When adding a new OM checkpoint or coach branch:

1. Decide whether it should appear **only live**, **only in replay**, or both — replay body: Black uses **`afterBlackMoveAuthorNote`** when matched; White **4.f4** / **5.Bxf4** use checkpoints **3** / **4** **`whiteCommentary`**; no generic line JSON narration.  
2. If replay should **not** override a phase (e.g. author reading), adjust template **`v-if`** order / conditions in **`MoveTrainer3LineCoach.vue`** explicitly — today replay wins first.  
3. Keep **footer variant isolation** (see `.cursor/rules/footer-variants-isolation.mdc`) — do not reuse unrelated **`PanelFooterV10`** modifiers.
