# Move Trainer 3 — classification badges (best / great)

Visual chips on Black’s **destination square** after a graded success: **`best.png`** (default) or **`great.png`** on squares listed in code (`MT3_GREAT_MOVE_BADGE_SQUARES`). Implemented in **`OpeningCoursesV3.vue`** (same board markup for desktop + Mobile B).

## Canonical geometry (700×700 reference board, px)

Values ship as fallbacks in source when `sessionStorage` has no dev keys yet.

### Best (`best.png`)

| Constant | Value | Meaning |
|----------|-------|---------|
| `MT3_BEST_BADGE_RIGHT_INSET_FALLBACK_PX` | **-13** | CSS `right` on the chip (negative shifts outward past the square corner). |
| `MT3_BEST_BADGE_TOP_OFFSET_FALLBACK_PX` | **-9** | CSS `top`. |
| `MT3_BEST_BADGE_SIZE_FALLBACK_PX` | **33** | Square chip side length. |

### Great (`great.png`)

| Constant | Value | Meaning |
|----------|-------|---------|
| `MT3_GREAT_BADGE_R_FALLBACK_PX` | **2** | Default files: `right` inset. |
| `MT3_GREAT_BADGE_T_FALLBACK_PX` | **2** | Default files: `top` offset. |
| `MT3_GREAT_BADGE_EDGE_LEFT_FALLBACK_PX` | **55** | Viewer **edge file** (Black POV: **a**; White POV: **h**): `left` inset so the asset is not clipped. |
| `MT3_GREAT_BADGE_EDGE_TOP_FALLBACK_PX` | **-12** | Edge file: `top` offset. |
| `MT3_GREAT_BADGE_SIZE_FALLBACK_PX` | **33** | Independent from best size. |

## Scaling on smaller boards

Chip layout uses **`min`/`max` with percentages of `.square`** derived from **`MT3_BADGE_REF_SQUARE_PX` (= 700 ÷ 8)** so geometry stays proportional on narrow layouts (e.g. Mobile B in-panel board). Non-positive offsets use **`max(px, %)`**; positive insets use **`min(px, %)`**.

## Persistence (optional overrides)

- Best: `sessionStorage` key **`chesscom.mt3.bestBadgeDev.v1`** — JSON `{ x, y, size }` (same semantics as fallbacks).
- Great: **`chesscom.mt3.greatBadgeDev.v1`** — JSON `{ r, t, el, et, size }`.

Reactive refs load these at startup; fallbacks apply when keys are missing.

## Visibility timing

- **`MT3_CLASSIFICATION_BADGES_AUTO_HIDE`** — when `true`, chips clear after **`MT3_BEST_BADGE_VISIBLE_MS`** (ms). When `false`, chips stay until the next graded move or shell restart (useful while iterating).

## Dev UI

Floating **Best Δ** / **Great pos** tuning panels are **not** shipped in product UI; geometry is edited via constants above (and optional session overrides during development).

## Related code

- Styles: `.mt3-black-move-classification-badge` (scoped in `OpeningCoursesV3.vue`).
- Footer **Start Quiz** (OM-7): **`MoveTrainer3PanelFooter.vue`** — MT3 route uses enabled primary with **no navigation** until Move Trainer 4 flow is wired; MT4 landing keeps quiz navigation.
