# Opening Courses V1 – Product Spec (Management Summary)

**Purpose:** High-level overview of the Opening Courses experience for non-technical stakeholders. Describes main features and product decisions.

---

## 1. What This Is

**Opening Courses V1** is the “Courses” view where users see a list of opening courses (e.g. Italian Game, French Defense), can search and filter, pick a course, choose a side (White/Black) when relevant, and start or continue learning. The layout includes a coach at the top, search/filters, and course cards. The design supports three user scenarios so product and design can test different experiences.

---

## 2. User Scenarios (Preset Bar)

We support three scenarios, selectable from a **preset bar** at the top of the screen (next to viewport size, when that is shown):

| Scenario | Who it’s for | Main behavior |
|----------|--------------|----------------|
| **New User** | First-time or no progress | Single list of all openings. Search, sort, and “X Courses” + Sort by row. One CTA: Start Course. |
| **Returning User A** | Has started some courses | Two sections: **“My Openings”** (started + completed) and **“All Openings”** (the rest). Each section has a header with a course count. No Sort by row. |
| **Returning User B** | Same as A, different layout | Same split of content (My Openings vs All), but with **tabs** and **Sort by**, and no section headers with counts. |

**Product decision:** Returning User B gives a cleaner, tabbed layout and a Sort by control similar to New User, while still separating “my” courses from “all” courses.

---

## 3. Layout and Navigation

- **Coach** at the top with avatar and message bubble (fixed; content scrolls below).
- **Returning User B only:** Two tabs under the coach: **“My Openings”** and **“All”**. Same tab style as the Course page (Learn / Practice). Tabs stay visible when scrolling (sticky).
- **Search bar** below coach (or below tabs for Returning User B): search field + Filters button. Sticky behavior so it can hide on scroll down and show on scroll up.
- **Course list** in the scrollable area:
  - **New User:** One list; optional “X Courses” and **Sort by** (Name, Lines, Type, Popular).
  - **Returning User A:** Two sections with headers: “My Openings (X courses)” and “All Openings (X courses).”
  - **Returning User B:** Tabs “My Openings” | “All”; no section headers; “X Courses” + Sort by row (same as New User).

---

## 4. Header (Panel Title)

- **Icon:** Same icon everywhere from the Courses list through to an open course: **book-stack-pawn** (design system).
- **Title:** “Courses” on the list; when a course is open, the course name (e.g. “French Defense”).
- **Back:** Returns to courses list from an open course, or back to chapter/line when in line view.

---

## 5. Course Cards

- **Not started:** Card shows title, description, and “X Lines” chip.
- **Started or completed:** Card shows:
  - **Headline:** Course title + **king icon** (White/Black) right after the title with a small gap (icon in a wrapper for alignment).
  - **Row under headline:** One chip only:
    - **Completed:** Green “Completed” chip.
    - **Started (not completed):** Gray “X Lines” chip.
  - **Progress row:** Progress bar + percentage, or **Mastery** bar for completed courses.
  - **Practice count:** Next to the progress/mastery bar we show how many lines are **ready for Practice** in an **aqua badge** (pill style, same look as the Practice tab badge), not a chip.

**Product decision:** King icon next to the title and a single chip (Completed or Lines) keeps the card simple. The aqua badge aligns “ready for Practice” with the rest of the product’s visual language.

---

## 6. Color Picker (Footer)

When the user **selects a course card** (and that course is **not** started), the footer shows:

- **Color picker** (White/Black):
  - **Two-color courses** (e.g. Italian Game): **Dropdown** with chevron; user picks “Play For White” or “Play For Black.” Default is **White**.
  - **Single-color courses** (e.g. Queen’s Gambit Accepted – one color only): **Indicator only** (no dropdown, no chevron), showing the one available color.
- **Primary button:** “Start Course” (or “Continue” for already started courses). Disabled when no card is selected.

**Product decision:** Color choice is clear for two-color openings; for single-color we only show an indicator to avoid unnecessary interaction. Sentence-style labels (“Play For White” / “Play For Black”) and consistent styling keep the footer easy to scan.

---

## 7. Course List Data and “Course Number”

- The list of openings is defined in data with a **Course number** (1 or 2) per row:
  - **Course number = 2:** This opening has **both** White and Black. We show the **dropdown** color picker and default to White.
  - **Course number = 1:** This opening has **one** color only. We show the **indicator** only; the **Color** column in the data says which (White or Black).

The same data can be maintained in a source like Notion (e.g. “Course number” and “Color” columns) and then reflected here.

---

## 8. Summary Table

| Area | New User | Returning User A | Returning User B |
|------|----------|------------------|-------------------|
| List structure | One list | Two sections with headers + counts | Tabs: My Openings \| All (no section headers) |
| Sort by | Yes | No | Yes |
| “X Courses” row | Yes | No | Yes (per tab) |
| Tabs under coach | No | No | Yes (sticky) |
| Course cards | Same card types | Same; started/completed show progress, mastery, aqua badge | Same |

---

## 9. Out of Scope for This Spec

- Content of coach messages, filters logic, or sort algorithm details.
- Opening course page (chapter view) after “Start Course” / “Continue.”
- Board behavior (e.g. syncing to selected opening) is a feature but not described in detail here.

---

*Document generated from implementation in `Courses.vue` and related components. Last updated to reflect: preset bar (New User, Returning User A/B), tabs and Sort by for RUB, header icon, color picker (dropdown vs indicator), course card layout (king icon, chips, aqua badge), and Course number–based behavior.*
