# Move Trainer 3 — classification badges (best / great)

After a graded Black move, the UI shows a small chip on the **destination square**. There are two **assets**: **`best.png`** and **`great.png`**. Placement uses either **best-badge geometry** or **great-badge geometry** (constants + optional `sessionStorage`), independent of which PNG is shown.

Implemented in **`OpeningCoursesV3.vue`** (desktop + Mobile B boards).

---

## Which asset on which square?

| Black reply (demo line) | Asset | Placement source |
|-------------------------|-------|-------------------|
| Most replies (e.g. **…c5**) | **`best.png`** | **Best-badge** (`MT3_BEST_BADGE_*`, `mt3BestBadgeDev*`) |
| **`…g6`** | **`great.png`** | **Best-badge** placement — same X/Y/size as **`best.png`** (great icon, best position). Listed in **`MT3_GREAT_BADGE_USE_BEST_GEOMETRY_SQUARES`**. |
| **`…a6`** (viewer **a**‑file when Black at bottom — edge row) | **`great.png`** | **Great-badge** placement — edge left/top vs default right/top (`MT3_GREAT_BADGE_*`, `mt3GreatBadgeDev*`). Listed in **`MT3_GREAT_MOVE_BADGE_SQUARES`** but **not** in **`MT3_GREAT_BADGE_USE_BEST_GEOMETRY_SQUARES`**. |

Constants in code:

- **`MT3_GREAT_MOVE_BADGE_SQUARES`** — destinations that show **`great.png`** (`a6`, `g6` for this product).
- **`MT3_GREAT_BADGE_USE_BEST_GEOMETRY_SQUARES`** — subset of the above that reuse **`buildMt3BestBadgePlacementStyle()`** (currently **`g6`** only).

---

## Canonical geometry (700×700 reference board, px)

Values ship as fallbacks when `sessionStorage` has no dev keys.

### Best placement (`best.png`, and **`great.png` on `g6`**)

| Constant | Value | Meaning |
|----------|-------|---------|
| `MT3_BEST_BADGE_RIGHT_INSET_FALLBACK_PX` | **-13** | CSS `right` (negative shifts outward). |
| `MT3_BEST_BADGE_TOP_OFFSET_FALLBACK_PX` | **-9** | CSS `top`. |
| `MT3_BEST_BADGE_SIZE_FALLBACK_PX` | **33** | Chip side length. |

### Great placement (`great.png` on **edge `a6`** — not `g6`)

| Constant | Value | Meaning |
|----------|-------|---------|
| `MT3_GREAT_BADGE_R_FALLBACK_PX` | **2** | Non-edge: `right` inset. |
| `MT3_GREAT_BADGE_T_FALLBACK_PX` | **2** | Non-edge: `top`. |
| `MT3_GREAT_BADGE_EDGE_LEFT_FALLBACK_PX` | **55** | Edge file: `left` inset. |
| `MT3_GREAT_BADGE_EDGE_TOP_FALLBACK_PX` | **-12** | Edge file: `top`. |
| `MT3_GREAT_BADGE_SIZE_FALLBACK_PX` | **33** | Used for **`great.png`** when **great-badge** placement applies (`a6`). |

---

## Scaling on smaller boards

Chip layout uses **`min`/`max` with percentages of `.square`** vs **`MT3_BADGE_REF_SQUARE_PX` (= 700 ÷ 8)**. Non-positive offsets use **`max(px, %)`**; positive use **`min(px, %)`**.

---

## Persistence (optional overrides)

- Best (and **g6** great placement): **`chesscom.mt3.bestBadgeDev.v1`** — `{ x, y, size }`.
- Great edge/interior **`a6`**: **`chesscom.mt3.greatBadgeDev.v1`** — `{ r, t, el, et, size }`.

---

## Visibility timing

- **`MT3_CLASSIFICATION_BADGES_AUTO_HIDE`** — when `true`, chips clear after **`MT3_BEST_BADGE_VISIBLE_MS`**.

---

## Dev UI

Floating tuning panels are **not** shipped; edit fallbacks / session during development.

---

## Related code

- **`buildMt3BestBadgePlacementStyle()`** / **`getMt3GreatBadgeImgStyle(square)`** in **`OpeningCoursesV3.vue`**.
- Footer **Start Quiz** (OM-7): **`MoveTrainer3PanelFooter.vue`**.
