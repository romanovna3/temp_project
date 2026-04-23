/**
 * Copy for informational dream opening (e.g. `/move-trainer/page-2/informational-1`) — coach bubble body.
 * Segments: `{ type: 'text' }` and `{ type: 'move', ply, san }` — chip wraps **SAN only** (e4, Bc4);
 * move numbers live in adjacent `text` segments. No `--` in headings.
 * Rendered by `CoachMessageRichNotationsLine` (shared with other coach lines; see `../lib/coachRichNotationsLine.js` to build segments from a single `notation` string).
 */
export function hasInteractiveMoveSegments(segments) {
  return segments?.some((s) => s.type === 'move') ?? false
}

/** Largest `ply` among `{ type: 'move' }` segments — cap for board/footer on that info line. */
export function maxPlyFromMoveSegments(segments) {
  let max = 0
  for (const s of segments || []) {
    if (s.type === 'move' && typeof s.ply === 'number') {
      max = Math.max(max, s.ply)
    }
  }
  return max
}

export const INFORMATIONAL_DREAM_OPENING = {
  lineHeaderTitle: 'The Dream Opening',

  segments: [
    {
      type: 'text',
      text: `The opening phase of a chess game starts on the first move, and can be said to be finished once the rooks are connected. This means all the other pieces will have joined the action by moving off their starting squares on the back rank.

The goals of the opening phase of the game are the following:

1. Control the center of the board.

2. Develop all your pieces into the game.

3. Get your king to safety (usually by castling) .

Let's walk through the ideal opening moves and explain them one by one.

`,
    },
    { type: 'text', text: '1. ' },
    { type: 'move', ply: 1, san: 'e4' },
    {
      type: 'text',
      text: `

A phenomenal first move - controlling central squares and opening lines for development of the bishop and queen.

1... 2. `,
    },
    { type: 'move', ply: 2, san: 'd4' },
    {
      type: 'text',
      text: `

If you are allowed, it's usually a good idea to take the center with both pawns! This opens lines for the dark-squared bishop and controls more key central squares.

2... 3. `,
    },
    { type: 'move', ply: 3, san: 'Nf3' },
    {
      type: 'text',
      text: `

Developing your pieces is essential, as you will learn in my 10 opening rules. The knight moves towards the center, controlling key central squares.

3... 4. `,
    },
    { type: 'move', ply: 4, san: 'Nc3' },
    {
      type: 'text',
      text: `

Likewise, the queen's knight moves towards the center, controlling the central e4 and d5-squares. The knights are ideally placed.

4... 5. `,
    },
    { type: 'move', ply: 5, san: 'Bc4' },
    {
      type: 'text',
      text: `

An active square for the bishop, playing a role in controlling the center and allowing room for White to castle kingside.
Likewise, a great square for the dark-squared bishop. As long as we are bringing our pieces into play, we are in good shape.
The queen finally joins the action, supporting her forces safely from behind and introducing the possibility of castling queenside!
The position shown is a dream opening for White. Of course, Black gets to move too but for illustration purposes, each of White's pieces is on its most active square controlling the center of the board and ready to engage in battle. White's next move might be Re1, bringing the last piece into the middle of the board.

Notice in order to finish development and connect the rooks, White had to castle! This serves the dual purpose of bringing the king to safety and finishing development.`,
    },
  ],
}
