export const SAMPLE_GAME = {
  initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  players: {
    white: { name: 'AnishGiri', avatar: '/avatars/anishgiri.svg', rating: 2300, accuracy: 84.4, isWinner: true },
    black: { name: 'LongUsername123', avatar: '/avatars/hikaru.svg', rating: 1450, accuracy: 76.9, isWinner: false },
  },
  timeControl: { label: '3 min', icon: 'game-time-blitz' },
  advancedStats: [
    { label: 'Opening',  icon: 'classification-great-find', rating: 1801, change: +5 },
    { label: 'Tactics',  icon: 'classification-blunder',    rating: 1976, change: -7 },
    { label: 'Strategy', icon: 'classification-best',       rating: 1592, change: +1 },
    { label: 'Endgame',  icon: 'classification-mistake',    rating: 1423, change: -2 },
  ],
  moves: [
    {
      num: 1,
      white: {
        san: 'd4',
        classification: 'book',
        fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1',
        coachText: 'Solid opening, controlling the center.',
        eval: '+0.3',
      },
      black: {
        san: 'd5',
        classification: 'book',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2',
        coachText: 'Classical response, matching in the center.',
        eval: '+0.3',
      },
    },
    {
      num: 2,
      white: {
        san: 'c4',
        classification: 'book', highlighted: true, lastBook: true,
        opening: {
          name: 'Queens Gambit Opening',
          stats: 'Played 240 times. 64% win rate.',
          course: {
            title: 'Chessable Course',
            subtitle: 'Short & Sweet: 1. d4',
            image: '/avatars/fabianocaruana.svg',
          },
        },
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
        coachText: 'The Queen\'s Gambit! White offers the c-pawn to gain rapid central control and open lines for development.',
        eval: '+0.5',
      },
      black: {
        san: 'e6', piece: 'B',
        classification: 'book',
        fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
        coachText: 'The Queen\'s Gambit Declined — solid and resilient.',
        eval: '+0.4',
      },
    },
    {
      num: 3,
      white: {
        san: 'e3',
        classification: 'good',
        fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3',
        coachText: 'Supports the center but Nc3 is more ambitious.',
        eval: '+0.2',
      },
      black: {
        san: 'dxc4',
        classification: 'good',
        fen: 'rnbqkbnr/ppp2ppp/4p3/8/2pP4/4P3/PP3PPP/RNBQKBNR w KQkq - 0 4',
        coachText: 'Grabs the gambit pawn and dares White to come get it back.',
        eval: '+0.3',
      },
    },
    {
      num: 4,
      white: {
        san: 'c3', piece: 'n',
        classification: 'best',
        fen: 'rnbqkbnr/ppp2ppp/4p3/8/2pP4/2N1P3/PP3PPP/R1BQKBNR b KQkq - 1 4',
        coachText: 'Developing with tempo, eyeing the c4 pawn for recapture.',
        eval: '+0.5',
      },
      black: {
        san: 'a6', piece: 'N',
        classification: 'inaccuracy',
        fen: 'r1bqkbnr/ppp2ppp/n3p3/8/2pP4/2N1P3/PP3PPP/R1BQKBNR w KQkq - 2 5',
        coachText: 'An unusual square for the knight. Nf6 develops more naturally toward the center.',
        eval: '+0.8',
      },
    },
    {
      num: 5,
      white: {
        san: 'f3', piece: 'n',
        classification: 'best',
        fen: 'r1bqkbnr/ppp2ppp/n3p3/8/2pP4/2N1PN2/PP3PPP/R1BQKB1R b KQkq - 3 5',
        coachText: 'Natural development, controlling e5 and keeping the pressure on.',
        eval: '+0.9',
      },
      black: {
        san: 'b4', piece: 'N',
        classification: 'mistake', highlighted: true,
        fen: 'r1bqkbnr/ppp2ppp/4p3/8/1npP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 4 6',
        coachText: 'Jumping to b4 looks aggressive but the knight is stranded. After Qa4+ there is no safe retreat and White gains a huge tempo.',
        eval: '+1.5',
      },
    },
    {
      num: 6,
      white: {
        san: 'a4+', piece: 'q',
        classification: 'great',
        fen: 'r1bqkbnr/ppp2ppp/4p3/8/QnpP4/2N1PN2/PP3PPP/R1B1KB1R b KQkq - 5 6',
        coachText: 'The check forces the knight back and wins valuable time for White.',
        eval: '+2.1',
      },
      black: {
        san: 'c6', piece: 'N',
        classification: 'best',
        fen: 'r1bqkbnr/ppp2ppp/2n1p3/8/Q1pP4/2N1PN2/PP3PPP/R1B1KB1R w KQkq - 6 7',
        coachText: 'Forced retreat — no better square available.',
        eval: '+2.0',
      },
    },
    {
      num: 7,
      white: {
        san: 'xc4', piece: 'b',
        classification: 'best',
        fen: 'r1bqkbnr/ppp2ppp/2n1p3/8/Q1BP4/2N1PN2/PP3PPP/R1B1K2R b KQkq - 0 7',
        coachText: 'Recaptures and eyes the f7 diagonal.',
        eval: '+2.3',
      },
      black: {
        san: 'f5', piece: 'B',
        classification: 'blunder', highlighted: true,
        fen: 'r2qkbnr/ppp2ppp/2n1p3/5b2/Q1BP4/2N1PN2/PP3PPP/R1B1K2R w KQkq - 1 8',
        coachText: 'A serious mistake! The bishop ignores the danger on f7. White now has a devastating shot exploiting the open diagonal and the uncastled king.',
        eval: '+4.1',
      },
    },
    {
      num: 8,
      white: {
        san: 'O-O',
        classification: 'blunder', highlighted: true,
        fen: 'r2qkbnr/ppp2ppp/2n1p3/5b2/Q1BP4/2N1PN2/PP3PPP/R1B2RK1 b kq - 2 8',
        coachText: 'Castling is safe, but Bxf7+ was winning on the spot! The sacrifice would have exposed the king to a mating attack.',
        eval: '+3.8',
      },
      black: {
        san: 'f6', piece: 'N',
        classification: 'good',
        fen: 'r2qkb1r/ppp2ppp/2n1pn2/5b2/Q1BP4/2N1PN2/PP3PPP/R1B2RK1 w kq - 3 9',
        coachText: 'Develops the last minor piece, but the position is already difficult to hold.',
        eval: '+3.9',
      },
    },
    {
      num: 9,
      white: {
        san: 'd1', piece: 'r',
        classification: 'excellent',
        fen: 'r2qkb1r/ppp2ppp/2n1pn2/5b2/Q1BP4/2N1PN2/PP3PPP/R1BR2K1 b kq - 4 9',
        coachText: 'Centralizes the rook and adds pressure down the open d-file.',
        eval: '+4.5',
      },
      black: {
        san: 'd7', piece: 'B',
        classification: 'mistake',
        fen: 'r2qkb1r/pppb1ppp/2n1pn2/8/Q1BP4/2N1PN2/PP3PPP/R1BR2K1 w kq - 5 10',
        coachText: 'Moving the bishop again wastes a crucial tempo. The f7 weakness is becoming fatal.',
        eval: '+6.2',
      },
    },
    {
      num: 10,
      white: {
        san: 'b3', piece: 'q',
        classification: 'best',
        fen: 'r2qkb1r/pppb1ppp/2n1pn2/8/2BP4/1QN1PN2/PP3PPP/R1BR2K1 b kq - 6 10',
        coachText: 'Redirects the queen, adding a second attacker to the f7 square.',
        eval: '+7.8',
      },
      black: {
        san: 'a5', piece: 'N',
        classification: 'blunder', highlighted: true,
        fen: 'r2qkb1r/pppb1ppp/4pn2/n7/2BP4/1QN1PN2/PP3PPP/R1BR2K1 w kq - 7 11',
        coachText: 'Chasing the queen but walking into a mating net. The knight leaves f7 undefended and White delivers checkmate in one.',
        eval: '#1',
      },
    },
    {
      num: 11,
      white: {
        san: 'xf7#', piece: 'b',
        classification: 'great', highlighted: true,
        fen: 'r2qkb1r/pppb1Bpp/4pn2/n7/3P4/1QN1PN2/PP3PPP/R1BR2K1 b kq - 0 11',
        coachText: 'Checkmate! The bishop delivers the final blow on f7, supported by the queen on b3. A beautiful finish to the game.',
        eval: '1-0',
      },
    },
  ],
  result: '1-0',
}

// ChessNote font character map: lowercase = white pieces, uppercase = black pieces
export const PIECE_CHARS = {
  k: 'k', q: 'q', r: 'r', b: 'b', n: 'n', p: 'p',
  K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N', P: 'P',
}
