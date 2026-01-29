# Pinned to-do: Right panel implementation

**Design (Figma):** Use Figma Desktop MCP with this file.
- File: [Untitled](https://www.figma.com/design/O2d8ez8ywG4wuh4t7Tlu3b/Untitled?node-id=1-10190&m=dev)
- Node ID: `1-10190` (Dev Mode: add `&m=dev` to URL)
- Previous ref: node `1-10063` (course detail view)

**Theme:** Dark Mode by default. We design in dark mode; use dark-mode tokens (e.g. `--color-bg-primary`, `--color-text-default` as light-on-dark) when implementing.

**Note for devs:** Advanced Stats (More/Less) panel has a dedicated spec and developer note: see **`docs/Advanced-Stats-Spec.md`**. It covers: single More/Less control (no separate “Less Stats” button), scroll-into-view so Less is visible when expanded, DOM order (header as sibling of expanded block), DS chip usage (aqua vs gray, no gray color override), and lock icon `tool-lock-blank`.

Track progress here. Add more items as we go.

**Next to implement:** (Optional) Expandable section content; start-lesson flow.

| # | Item | Status |
|---|------|--------|
| 1 | **Panel container** – Design tokens (--color-bg-primary, --radius-l) | done |
| 2 | **Panel header** – "Courses" + open book icon; back/trailing icons (work on later) | later |
| 3 | **Course card** – Thumbnail, title, author; layout and spacing from Figma | done |
| 4 | **Progress (node 2-5697)** – Title, bar, Learned X/Y under course card; derived from courseSections | done |
| 5 | **Course "120 lines" + "Show All"** – Line count, filter (Show bold + value regular); Figma node 2-1762 | done |
| 6 | **Sections list** – Scrollable; section rows with progress, expand/collapse (chevron), click to toggle | done |
| 7 | **Progress indicators** – circle-fill-check, circle-dashboard-fill, circle-hollow-blank | done |
| 8 | **Panel footer** – Lesson buttons row hidden in course view (showLessonActions); toolbar always visible | done |
| 9 | **Placeholder data and tokens** – courseSections; progress computed from sections | done |

---

*(Add more rows above or below as needed.)*
