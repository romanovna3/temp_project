# Progress Circle – Item List

Spec for the Progress Circle component used in the Item List (section rows). [Figma node 3-6240](https://www.figma.com/design/O2d8ez8ywG4wuh4t7Tlu3b/Untitled?node-id=3-6240&t=FCccPBxVP2bXFbh9-4).

---

## Common Structure (All States)

### Layout
- **relative** – Relative positioning
- **size-full** – Full width and height (24×24px viewBox)

### SVG Properties
- **block** – Display block
- **size-full** – Full size
- **fill="none"** – No default fill
- **preserveAspectRatio="none"** – Don't preserve aspect ratio (or `xMidYMid meet` to keep aspect)
- **viewBox="0 0 24 24"** – 24×24 coordinate system

### Data Attributes
- **data-name="Progress Circle"**

---

## State 1: Completed (Green with Checkmark)

### Elements
- **Background circle (#completed)**
  - `fill="var(--fill-0, #81B64C)"` – Green background
  - `rx="12"` – 12px border radius (full circle)
  - `width="24"` `height="24"` – Full 24×24 size
  - Element: `<rect>` (or `<circle>`)

- **Checkmark shadow (#checkmark-shadow)**
  - `fill="var(--fill-0, #45753C)"` – Dark green shadow
  - Uses imported SVG path: `svgPaths.p6ea700`
  - Element: `<path>`

- **Checkmark (#checkmark)**
  - `fill="var(--fill-0, white)"` – White checkmark
  - Uses imported SVG path: `svgPaths.p2d471980`
  - Element: `<path>`

---

## State 2: Empty (Outline Only)

### Elements
- **Track outline (#track)**
  - `fill="var(--fill-0, white)"` – White fill
  - `fillOpacity="0.1"` – 10% opacity
  - `fillRule="evenodd"` – Even-odd fill rule
  - `clipRule="evenodd"` – Even-odd clip rule
  - Uses imported SVG path: `svgPaths.p325a1b00`
  - Element: `<path>`

---

## State 3: Partial Progress (~25%)

### Elements
- **Track outline (#track)** – Same as State 2
  - `fill="var(--fill-0, white)"` with `fillOpacity="0.1"`
  - Uses path: `svgPaths.p1aaffa10`

- **Completed arc (#completed)**
  - `fill="var(--fill-0, #81B64C)"` – Green fill
  - `fillRule="evenodd"` and `clipRule="evenodd"`
  - Uses imported SVG path: `svgPaths.p3e82a080`
  - Element: `<path>`

---

## State 4: Partial Progress (~50%)

### Elements
- **Track outline (#track)** – Same as State 3
  - Uses path: `svgPaths.p1aaffa10`

- **Completed arc (#completed)**
  - `fill="var(--fill-0, #81B64C)"` – Green fill
  - `fillRule="evenodd"` and `clipRule="evenodd"`
  - Uses imported SVG path: `svgPaths.p311c9d00` (different path = more coverage)

---

## State 5: Partial Progress (~75%)

### Elements
- **Track outline (#track)** – Same as States 3 & 4
  - Uses path: `svgPaths.p1aaffa10`

- **Completed arc (#completed)**
  - `fill="var(--fill-0, #81B64C)"` – Green fill
  - `fillRule="evenodd"` and `clipRule="evenodd"`
  - Uses imported SVG path: `svgPaths.p2b971df0` (different path = even more coverage)

---

## Color Palette

| Token / value | Usage |
|---------------|--------|
| `#81B64C` | Primary green (completed state, arc fill) |
| `#45753C` | Dark green (checkmark shadow) |
| `white` | Checkmark and track outline base |
| `fillOpacity="0.1"` | 10% opacity for empty track |

---

## SVG Techniques

- **fillRule="evenodd"** and **clipRule="evenodd"** – For proper rendering of circular paths
- Custom SVG path data imported from separate files (Figma export)
- CSS variable fallbacks: `var(--fill-0, [default-color])`

---

## Component Logic

- **5 states** by progress: `0%` (empty), `1–33%` (partial ~25%), `34–66%` (partial ~50%), `67–99%` (partial ~75%), `100%` (completed).
- **Props:** `state` (e.g. `'empty' | 'partial' | 'completed'`) and/or `progress` (0–100).
- **Derivation:** From section `completed`/`total` → `progress = (completed / total) * 100`, then map to one of 5 states.
- **Implementation note:** Without Figma path exports, the app uses equivalent SVG (circle + stroke-dasharray for arcs, simple checkmark path) to match the spec visually.
