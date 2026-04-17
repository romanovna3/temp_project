# Game Review Panel — Front-End Spec

## Panel Layout

Fixed-height (680px) flex column. Width resizable **300–500px**.

```
SidebarHeader
CoachSection
ScreenContent  ← flex: 1, swaps between Overview and Review
```

---

## Responsive Breakpoints

Based on **panel width** (not viewport):

| Size | Width        |
|------|--------------|
| S    | < 360px      |
| M    | 360 – 479px  |
| L    | ≥ 480px      |

---

## Horizontal Padding

Single rule, no exceptions:

| Size | Padding |
|------|---------|
| S    | 16px    |
| M, L | 24px    |

Applies to: coach section, top buttons, move list, eval graph, controls bar, overview scroll, overview bottom.

---

## Coach Component

### DOM Structure

```
.coach-section                    ← padding wrapper
  .coach-container                ← flex row: avatar + bubble
    .coach-avatar                 ← square, top-left aligned
    .bubble-wrapper               ← flex: 1
      .bubble                     ← white card, box-shadow, tip
        .tip                      ← SVG arrow pointing to avatar
        .bubble-content           ← scrollable area
          .bubble-header?         ← classification icon + label + eval badge
          .coach-message          ← text paragraph
```

### CSS Custom Properties (set on panel root)

| Token                      | S     | M     | L     |
|----------------------------|-------|-------|-------|
| `--coach-avatar-size`      | 64px  | 80px  | 96px  |
| `--coach-container-height` | 156px | 136px | 116px |
| `--bubble-max-height`      | 156px | 136px | 116px |
| `--coach-tip-top`          | 30px  | 36px  | 50px  |
| `--coach-tip-bottom`       | 12px  | 22px  | 24px  |

### Coach Section Padding

| Screen   | Top/Sides        | Bottom |
|----------|------------------|--------|
| Review   | 24px (S: 16px)   | 0      |
| Overview | 24px (S: 16px)   | 8px    |

On overview, `coach-container` height is `auto` (hugs content).
On review, `coach-container` height is fixed at `--coach-container-height`.

---

## Bubble Modes

The bubble has two modes, driven by a single condition:

```
startPosition = (coachHeaderText is empty)
```

### Start Position (no move selected)

| Property                     | Value                          |
|------------------------------|--------------------------------|
| `.bubble-wrapper` height     | `--coach-avatar-size`          |
| `.bubble-wrapper` align      | `flex-end` (bottom of avatar)  |
| `.bubble-content` min-height | 64px                           |
| Tip position                 | bottom (`--coach-tip-bottom`)  |
| Content alignment            | vertically centered            |

### Review Position (move selected)

| Property                     | Value                          |
|------------------------------|--------------------------------|
| `.bubble-wrapper` height     | auto (within container)        |
| `.bubble-wrapper` align      | `flex-start` (top of avatar)   |
| `.bubble-content` min-height | 96px                           |
| `.bubble-content` max-height | `--bubble-max-height`          |
| Tip position                 | top (`--coach-tip-top`)        |
| Content alignment            | top-aligned                    |
| Overflow                     | scrollable, hidden scrollbar   |

When content overflows, gradient fades appear at top/bottom edges of the bubble.

---

## Coach Message Logic

```
Overview screen         → "Welcome to Game Review!"
Review, move selected   → ply.coachText
Review, no move         → "Review any move to see coach analysis."
```

## Header Text

| Size | Format                                      | Example              |
|------|---------------------------------------------|----------------------|
| L    | `"{piece}{san} is a {classification} move"` | "nc3 is a best move" |
| S, M | Classification label only                   | "Best"               |

Header includes: classification icon (color variant) + text + eval badge.

---

## Scroll Shadow

Appears under the **top buttons** (Share / Next) when the move list is scrolled.

- 12px tall `linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)`
- Horizontally masked (fades at 15% and 85% from edges)
- `opacity 150ms ease` transition
- Controlled by `has-scroll-shadow` class on `.top-buttons`

---

## Screen States

### Overview

```
[SidebarHeader]
[Coach — start position, container: auto height, padding-bottom: 8px]
[OverviewPanel — scrollable]
  Eval graph (static)
  Stats grid (players, accuracy, game rating)
  Classification counts (brilliant, great, miss, blunder)
  Advanced stats
[Bottom — pinned: time control + "Start Review"]
```

### Review

```
[SidebarHeader]
[Coach — review position, container: fixed height]
[Top Buttons — Share + Next, with scroll shadow]
[Move List — scrollable]
  Move rows + Highlights/Time buttons at bottom
[Eval Graph — fixed]
[Controls Bar — start, back, play, forward, end]
```
