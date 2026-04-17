export const SAMPLE_GAME = {
  moves: [
    {
      num: 1,
      white: { san: 'd4' },
      black: { san: 'd5' },
    },
    {
      num: 2,
      white: { san: 'c4', classification: 'book' },
      black: { san: 'e6', piece: 'B' },
    },
    {
      num: 3,
      white: { san: 'e3' },
      black: { san: 'dxc4' },
    },
    {
      num: 4,
      white: { san: 'c3', piece: 'n' },
      black: { san: 'a6', piece: 'N' },
    },
    {
      num: 5,
      white: { san: 'f3', piece: 'n' },
      black: { san: 'b4', piece: 'N', classification: 'mistake' },
    },
    {
      num: 6,
      white: { san: 'a4+', piece: 'q' },
      black: { san: 'c6', piece: 'N' },
    },
    {
      num: 7,
      white: { san: 'xc4', piece: 'b' },
      black: { san: 'f5', piece: 'B', classification: 'blunder' },
    },
    {
      num: 8,
      white: { san: 'O-O', classification: 'miss' },
      black: { san: 'f6', piece: 'N' },
    },
    {
      num: 9,
      white: { san: 'd1', piece: 'r' },
      black: { san: 'd7', piece: 'B' },
    },
    {
      num: 10,
      white: { san: 'b3', piece: 'q' },
      black: { san: 'a5', piece: 'N', classification: 'blunder' },
    },
    {
      num: 11,
      white: { san: 'xf7#', piece: 'b', classification: 'great', selected: true },
    },
  ],
  result: '1-0',
}

// ChessNote font character map: lowercase = white pieces, uppercase = black pieces
export const PIECE_CHARS = {
  k: 'k', q: 'q', r: 'r', b: 'b', n: 'n', p: 'p',
  K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N', P: 'P',
}
