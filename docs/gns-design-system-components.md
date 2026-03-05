# GNS Design System Components

Components available in GNS under `teams.design.public.components`.  
Source: `gns get teams.design.public.components.index` and `gns list teams.design.public.components --tree`.

**42 components** across 6 categories (Web, iOS, Android).

---

## Typography (heading styles)

**Source of truth for heading font-size, line-height, and weight:**

- **GNS key:** `teams.design.public.tokens.semantic.typography.headings`
- **Fetch:** `gns get teams.design.public.tokens.semantic.typography.headings`

Use this whenever implementing or changing any heading typography (e.g. `--heading-xxx-small`, `--heading-xx-small`). The scale includes 14 styles from heading-x-large through heading-xxx-small (and -bold variants). Do not guess values; confirm from GNS. Cursor rule: `.cursor/rules/design-system.mdc` → "Typography verification".

---

## Input (9+)

| Component       | GNS key |
|----------------|---------|
| button         | `teams.design.public.components.input.button` |
| icon-button    | `teams.design.public.components.input.icon-button` |
| input          | `teams.design.public.components.input.input` |
| input-group    | (see index) |
| select         | (see index) |
| checkbox       | (see index) |
| switch         | (see index) |
| radio-button   | (see index) |
| textarea       | (see index) |
| close-button   | `teams.design.public.components.input.close-button` |
| dropdown-button | `teams.design.public.components.input.dropdown-button` |
| segmented-control | `teams.design.public.components.input.segmented-control` |

---

## Layout (5)

| Component     | GNS key |
|---------------|---------|
| card          | (see index) |
| section       | (see index) |
| section-footer | (see index) |
| page-header   | (see index) |
| template      | (see index) |

Index: `teams.design.public.components.layout.index`

---

## Navigation (8)

| Component        | GNS key |
|------------------|---------|
| aside-header     | (see index) |
| aside-item       | (see index) |
| sidebar-header   | (see index) |
| tabs             | `teams.design.public.components.navigation.tabs` |
| dropdown-button  | (see index) |
| dropdown-item    | (see index) |
| segmented-control | `teams.design.public.components.navigation.segmented-control` |

Index: `teams.design.public.components.navigation.index`

---

## Display (10)

| Component         | GNS key |
|-------------------|---------|
| avatar            | `teams.design.public.components.display.avatar` |
| contact-avatar    | (see index) |
| icon              | `teams.design.public.components.display.icon` |
| image             | (see index) |
| chip              | `teams.design.public.components.display.chip` |
| rank              | (see index) |
| rank-direction    | (see index) |
| notification-badge | `teams.design.public.components.display.notification-badge` |
| new-badge         | (see index) |
| tooltip           | (see index) |

Index: `teams.design.public.components.display.index`

---

## Feedback (6)

| Component     | GNS key |
|---------------|---------|
| loader        | `teams.design.public.components.feedback.loader` |
| progress-bar  | (see index) |
| inline-alert  | (see index) |
| skeleton      | (see index) |
| skeleton-grid | (see index) |
| empty-state   | (see index) |

Index: `teams.design.public.components.feedback.index`

---

## Overlay (6)

| Component           | GNS key |
|---------------------|---------|
| modal               | (see index) |
| modal-hero          | (see index) |
| modal-list-content  | (see index) |
| confirmation-modal  | (see index) |
| close-button        | (see index) |
| outside-close       | (see index) |
| tooltip             | `teams.design.public.components.overlay.tooltip` |

Index: `teams.design.public.components.overlay.index`

---

## Package info (from GNS index)

| Platform | Package | Import example |
|----------|---------|----------------|
| Web (Vue) | `@chesscom/design-system` | `import { CcButton } from '@chesscom/design-system'` |
| iOS (SwiftUI) | ChessComponents | `import ChessComponents` |
| Android (Compose) | compose-shared | `import com.chess.palette.compose.shared.component.*` |

**Web component naming:** kebab-case with `cc-` prefix (e.g. `cc-button`).

---

## How to fetch a component from GNS

```bash
gns get teams.design.public.components.index
gns get teams.design.public.components.input.button
gns get teams.design.public.components.display.icon
# etc.
```

Last updated from GNS: March 2026.
