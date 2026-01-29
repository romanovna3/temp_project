# Missing CSS Styles

CSS variables and styles we define in the app because they are not (yet) in the design system. Add new entries as we go. When the DS or design tokens add these, we can remove the local definitions.

**Theme:** Dark mode by default. Definitions below are for `.dark-mode` unless noted.

---

## Tokens / Variables

| Token (name) | Where used | Current definition | Notes |
|--------------|------------|--------------------|------|
| `--color-bg-progress-completed-gradient` | Progress bar fill (course progress, Figma node 2-5697) | `linear-gradient(0deg, var(--color-green-500, #45753C) 0%, var(--color-green-300, #81B64C) 100%)` | Defined in `my-app/src/App.vue` unscoped `.dark-mode`. Fill also uses gradient + shadow inline. |
| `--color-elevation-foreground-dark-only` | Progress bar fill box-shadow (Button/Icon/button-icon-shadow) | Fallback: `rgba(0, 0, 0, 0.20)` | Used as `var(--color-elevation-foreground-dark-only, rgba(0, 0, 0, 0.20))`. Add to DS if missing. |
| `--size-small` | Filter label, Progress "Learned", section row typography | Fallback: `12px` | Used as `var(--size-small, 12px)`. Add to DS or design tokens if desired. |
| `--line-height-small` | Same as above | Fallback: `16px` | Used as `var(--line-height-small, 16px)`. Add to DS or design tokens if desired. |

---

## Adding more

1. Add a new row to the **Tokens / Variables** table (or a new section if it’s a full rule, not a variable).
2. Columns: **Token (name)** | **Where used** | **Current definition** | **Notes**.
3. In code, define the variable in the appropriate place (e.g. `.dark-mode` in App.vue unscoped style, or a shared tokens file), and use the token name in components.

---

*Last updated: when this file was created. Extend the table as we discover more missing styles.*
