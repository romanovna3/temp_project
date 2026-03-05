# ToC line hover → board preview

When the user hovers a line in the table of contents (ToC) on the chapter page, the main board updates to show the position for that line.

## Current behavior

- **Position shown:** The position **after the latest (last) move** in the line.  
  Implemented via `getPositionAtEndOfLine(moves)`: we play all moves in the line and show the resulting FEN + last move highlight.

## Spec (future)

- **Key move:** When line data includes a **key move**, the board should show the position **after that key move** instead of after the last move.  
  Key moves are the pedagogically important moves in the line (e.g. the move that defines a branch). Until key-move metadata exists, we keep using the latest move’s position.

## Implementation notes

- `hoveredChapterLine` holds `{ section, move }`; the board sync `watchEffect` uses `getMovesForLine(section, move)` then `getPositionAtEndOfLine(moves)`.
- Line cards and move-item list items use `@mouseenter="setHoveredChapterLine(section, move)"` and `@mouseleave="clearHoveredChapterLine()"`.
- All line types (including ready/completed) trigger preview when hovered.
