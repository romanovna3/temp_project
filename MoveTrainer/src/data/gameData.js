export const SAMPLE_GAME = {
  initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  /** Shown in the move-list opening line header (review mode). */
  openingDisplayTitle: "Queen's Gambit Accepted",
  players: {
    white: { name: 'AnishGiri', avatar: '/avatars/anishgiri.png', rating: 2300, accuracy: 84.4, isWinner: true },
    black: { name: 'LongUsername123', avatar: '/avatars/hikaru.png', rating: 1450, accuracy: 76.9, isWinner: false },
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
        coachText: `Ever wanted to learn from the greatest female player in history? Now you can, with this scintillating course by Judit Polgar, former World No. 8 and attacking genius. A slayer of titans like Garry Kasparov, Anatoly Karpov, Vishwanathan Anand, and Magnus Carlsen, Judit is no stranger to victory over the chessboard, and in this course, she takes you through some of her greatest masterpieces.

Judit's brilliance over the chessboard is not just a matter of incredible talent, however. Her searing tactical play was always based on rock-solid chess principles, and this course shows you how Judit (and others) put these principles to great effect.

The course is divided into four main chapters, each covering vital aspects of the game.

Opening Disasters − Learn how to avoid major pitfalls in opening play and punish your opponent's opening mistakes!

Calculation − Learn how to out-calculate your opponent and become an awesome tactician like Judit!

Positional Play − Learn how to outclass your foes with keen positional awareness. Put your pieces on the best squares and your enemy's on the worst!

Endgame Technique − Learn how to enter the endgame with confidence. Fewer pieces don't mean fewer tactical opportunities! Explore the magical world of studies to enhance your calculation and endgame skills.


Let Judit guide you through some of the best games of chess ever played, with 7 hours of video and more than 200 trainable variations.

Judit is ably supported by award-winning International Master and chess coach Andras Toth, whose exceptionally popular courses you can also find on Chessable.

The examples provided in this Free Lesson offer a brief glimpse of what you can discover in the broader and complete course. Enjoy the puzzles and, perhaps, have a great journey further on with none other than Judit Polgar on your side!`,
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
            image: '/images/chessable-qg.png',
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

/** Scandinavian-style line for `intro-1` (move list + board plies). */
export const INTRO_1_GAME = {
  initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: [
    {
      num: 1,
      white: {
        san: 'e4',
        classification: 'book',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        coachText: 'White stakes a claim in the center.',
        eval: '+0.2',
      },
      black: {
        san: 'd5',
        classification: 'book',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2',
        coachText: 'Black immediately challenges the center.',
        eval: '0.0',
      },
    },
    {
      num: 2,
      white: {
        san: 'exd5',
        classification: 'book',
        fen: 'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2',
        coachText: 'White captures, opening the e-file.',
        eval: '+0.1',
      },
      black: {
        san: 'Qxd5',
        piece: 'Q',
        classification: 'book',
        fen: 'rnb1kbnr/ppp1pppp/8/3q4/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 3',
        coachText: 'The queen recaptures, but it can be exposed later.',
        eval: '0.0',
      },
    },
    {
      num: 3,
      white: {
        san: 'Nc3',
        piece: 'n',
        classification: 'book',
        fen: 'rnb1kbnr/ppp1pppp/8/3q4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 3',
        coachText: 'Development with tempo against the queen.',
        eval: '+0.3',
      },
      black: {
        san: 'Qc6',
        piece: 'Q',
        classification: 'book',
        fen: 'rnb1kbnr/ppp1pppp/2q5/8/8/2N5/PPPP1PPP/R1BQKBNR w KQkq - 2 4',
        coachText: 'The queen sidesteps, staying in the fight.',
        eval: '0.0',
      },
    },
    {
      num: 4,
      white: {
        san: 'Bb5',
        piece: 'b',
        classification: 'book',
        fen: 'rnb1kbnr/ppp1pppp/2q5/1B6/8/2N5/PPPP1PPP/R1BQK1NR b KQkq - 3 4',
        coachText: 'A pin on the queen along the a3–f8 diagonal.',
        eval: '+0.4',
      },
    },
  ],
  result: '',
}

/**
 * Main-line preview for Move Trainer 3 (Old Benoni) — course panel move list + board plies.
 * Line: 1.d4 c5 2.d5 e5 3.e4 d6 4.f4 exf4 5.Bxf4 Nf6 6.Nc3 a6 7.a4 g6 8.Nf3 Bg4 9.Be2 Bg7 10.O-O O-O
 */
export const MOVE_TRAINER_3_LINE_GAME = {
  initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: [
    {
      num: 1,
      white: {
        san: 'd4',
        classification: 'book',
        fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
        coachText: 'White claims space with the queen\'s pawn — a flexible start toward this Benoni-style setup.',
        eval: '+0.2',
      },
      black: {
        san: 'c5',
        classification: 'book',
        fen: 'rnbqkbnr/pp1ppppp/8/2p5/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
        coachText: 'Black stakes a Sicilian-style fight on the flank.',
        eval: '0.0',
      },
    },
    {
      num: 2,
      white: {
        san: 'd5',
        classification: 'book',
        fen: 'rnbqkbnr/pp1ppppp/8/2pP4/8/8/PPP1PPPP/RNBQKBNR b KQkq - 0 2',
        coachText: 'The advance clamps the center — typical of the Old Benoni structure.',
        eval: '+0.1',
      },
      black: {
        san: 'e5',
        classification: 'book',
        fen: 'rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq e6 0 3',
        coachText: 'Black fights for the e5 square from the semi-open files.',
        eval: '0.0',
      },
    },
    {
      num: 3,
      white: {
        san: 'e4',
        classification: 'book',
        fen: 'rnbqkbnr/pp1p1ppp/8/2pPp3/4P3/8/PPP2PPP/RNBQKBNR b KQkq - 0 3',
        coachText: 'White expands in the center — space and tension.',
        eval: '+0.2',
      },
      black: {
        san: 'd6',
        classification: 'book',
        fen: 'rnbqkbnr/pp3ppp/3p4/2pPp3/4P3/8/PPP2PPP/RNBQKBNR w KQkq - 0 4',
        coachText: 'Black reinforces the center and prepares kingside development.',
        eval: '0.0',
      },
    },
    {
      num: 4,
      white: {
        san: 'f4',
        classification: 'book',
        fen: 'rnbqkbnr/pp3ppp/3p4/2pPp3/4PP2/8/PPP3PP/RNBQKBNR b KQkq - 0 4',
        coachText: 'A sharp pawn stab — heightening the central tension.',
        eval: '+0.2',
      },
      black: {
        san: 'exf4',
        classification: 'book',
        fen: 'rnbqkbnr/pp3ppp/3p4/2pP4/4Pp2/8/PPP3PP/RNBQKBNR w KQkq - 0 5',
        coachText: 'Black captures on f4, opening lines toward White\'s king.',
        eval: '0.0',
      },
    },
    {
      num: 5,
      white: {
        san: 'Bxf4',
        piece: 'B',
        classification: 'book',
        fen: 'rnbqkbnr/pp3ppp/3p4/2pP4/4PB2/8/PPP3PP/RN1QKBNR b KQkq - 0 5',
        coachText: 'The bishop recaptures with the f-pawn gone — development follows.',
        eval: '+0.2',
      },
      black: {
        san: 'Nf6',
        piece: 'N',
        classification: 'book',
        fen: 'rnbqkb1r/pp3ppp/3p1n2/2pP4/4PB2/8/PPP3PP/RN1QKBNR w KQkq - 1 6',
        coachText: 'The knight hits e4 and d5 — a natural square.',
        eval: '0.0',
      },
    },
    {
      num: 6,
      white: {
        san: 'Nc3',
        piece: 'N',
        classification: 'book',
        fen: 'rnbqkb1r/pp3ppp/3p1n2/2pP4/4PB2/2N5/PPP3PP/R2QKBNR b KQkq - 2 6',
        coachText: 'Development with control over d5 and future e4 support.',
        eval: '+0.2',
      },
      black: {
        san: 'a6',
        classification: 'book',
        fen: 'rnbqkb1r/1p3ppp/p2p1n2/2pP4/4PB2/2N5/PPP3PP/R2QKBNR w KQkq - 0 7',
        coachText: 'A useful waiting move — often preparing …b5 ideas.',
        eval: '0.0',
      },
    },
    {
      num: 7,
      white: {
        san: 'a4',
        classification: 'book',
        fen: 'rnbqkb1r/1p3ppp/p2p1n2/2pP4/P3PB2/2N5/1PP3PP/R2QKBNR b KQkq - 0 7',
        coachText: 'White clamps queenside expansion.',
        eval: '+0.2',
      },
      black: {
        san: 'g6',
        classification: 'book',
        fen: 'rnbqkb1r/1p3p1p/p2p1np1/2pP4/P3PB2/2N5/1PP3PP/R2QKBNR w KQkq - 0 8',
        coachText: 'Fianchetto prep — the bishop will breathe on g7.',
        eval: '0.0',
      },
    },
    {
      num: 8,
      white: {
        san: 'Nf3',
        piece: 'N',
        classification: 'book',
        fen: 'rnbqkb1r/1p3p1p/p2p1np1/2pP4/P3PB2/2N2N2/1PP3PP/R2QKB1R b KQkq - 1 8',
        coachText: 'Natural development — eyes on e5 and the center.',
        eval: '+0.2',
      },
      black: {
        san: 'Bg4',
        piece: 'B',
        classification: 'book',
        fen: 'rn1qkb1r/1p3p1p/p2p1np1/2pP4/P3PBb1/2N2N2/1PP3PP/R2QKB1R w KQkq - 2 9',
        coachText: 'Pinning the knight — classic Benoni pressure.',
        eval: '0.0',
      },
    },
    {
      num: 9,
      white: {
        san: 'Be2',
        piece: 'B',
        classification: 'book',
        fen: 'rn1qkb1r/1p3p1p/p2p1np1/2pP4/P3PBb1/2N2N2/1PP1B1PP/R2QK2R b KQkq - 3 9',
        coachText: 'Breaking the pin while staying solid.',
        eval: '+0.2',
      },
      black: {
        san: 'Bg7',
        piece: 'B',
        classification: 'book',
        fen: 'rn1qk2r/1p3pbp/p2p1np1/2pP4/P3PBb1/2N2N2/1PP1B1PP/R2QK2R w KQkq - 4 10',
        coachText: 'The fianchettoed bishop dominates the long diagonal.',
        eval: '0.0',
      },
    },
    {
      num: 10,
      white: {
        san: 'O-O',
        classification: 'book',
        fen: 'rn1qk2r/1p3pbp/p2p1np1/2pP4/P3PBb1/2N2N2/1PP1B1PP/R2Q1RK1 b kq - 5 10',
        coachText: 'White castles — the king is safe; rooks connect.',
        eval: '+0.2',
      },
      black: {
        san: 'O-O',
        classification: 'book',
        fen: 'rn1q1rk1/1p3pbp/p2p1np1/2pP4/P3PBb1/2N2N2/1PP1B1PP/R2Q1RK1 w - - 6 11',
        coachText: 'Black castles — both sides are fully developed.',
        eval: '0.0',
      },
    },
  ],
  result: '',
}

/** Scholar's Mate attempt line for `intro-2` ("Don't Try Scholar's Mate!"). */
export const INTRO_2_GAME = {
  initialFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: [
    {
      num: 1,
      white: {
        san: 'e4',
        classification: 'book',
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        coachText: 'White opens with the king\'s pawn.',
        eval: '+0.2',
      },
      black: {
        san: 'e5',
        classification: 'book',
        fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
        coachText: 'Black mirrors in the center.',
        eval: '0.0',
      },
    },
    {
      num: 2,
      white: {
        san: 'Qh5',
        piece: 'q',
        classification: 'book',
        fen: 'rnbqkbnr/pppp1ppp/8/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2',
        coachText: 'An early queen sortie — tempting but risky.',
        eval: '-0.5',
      },
      black: {
        san: 'Nc6',
        piece: 'N',
        classification: 'book',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/4P3/8/PPPP1PPP/RNB1KBNR w KQkq - 2 3',
        coachText: 'Defends e5 and develops toward the center.',
        eval: '0.0',
      },
    },
    {
      num: 3,
      white: {
        san: 'Bc4',
        piece: 'b',
        classification: 'book',
        fen: 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3',
        coachText: 'Aiming at f7 — a classic Scholar\'s Mate idea.',
        eval: '-0.3',
      },
      black: {
        san: 'g6',
        classification: 'book',
        fen: 'r1bqkbnr/pppp1p1p/2n3p1/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 4',
        coachText: 'Guards f7 while developing the dark bishop.',
        eval: '+0.2',
      },
    },
    {
      num: 4,
      white: {
        san: 'Qf3',
        piece: 'q',
        classification: 'book',
        fen: 'r1bqkbnr/pppp1p1p/2n3p1/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 1 4',
        coachText: 'Doubling down on the f7 threat.',
        eval: '-0.4',
      },
      black: {
        san: 'Nf6',
        piece: 'N',
        classification: 'book',
        fen: 'r1bqkb1r/pppp1p1p/2n2np1/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 2 5',
        coachText: 'Develops and blocks the queen\'s attack on f7.',
        eval: '+0.3',
      },
    },
    {
      num: 5,
      white: {
        san: 'g4',
        classification: 'book',
        fen: 'r1bqkb1r/pppp1p1p/2n2np1/4p3/2B1P1P1/5Q2/PPPP1P1P/RNB1K1NR b KQkq - 0 5',
        coachText: 'Pushing the g-pawn — overextension.',
        eval: '-0.8',
      },
      black: {
        san: 'd5',
        classification: 'book',
        fen: 'r1bqkb1r/ppp2p1p/2n2np1/3pp3/2B1P1P1/5Q2/PPPP1P1P/RNB1K1NR w KQkq - 0 6',
        coachText: 'Strikes the center and opens lines.',
        eval: '+0.5',
      },
    },
    {
      num: 6,
      white: {
        san: 'exd5',
        classification: 'book',
        fen: 'r1bqkb1r/ppp2p1p/2n2np1/3Pp3/2B3P1/5Q2/PPPP1P1P/RNB1K1NR b KQkq - 0 6',
        coachText: 'Captures, but the center collapses around the king.',
        eval: '-0.5',
      },
      black: {
        san: 'Nd4',
        piece: 'N',
        classification: 'book',
        fen: 'r1bqkb1r/ppp2p1p/5np1/3Pp3/2Bn2P1/5Q2/PPPP1P1P/RNB1K1NR w KQkq - 1 7',
        coachText: 'Knight jumps in with tempo against the queen.',
        eval: '+1.2',
      },
    },
    {
      num: 7,
      white: {
        san: 'Qd1',
        piece: 'q',
        classification: 'book',
        fen: 'r1bqkb1r/ppp2p1p/5np1/3Pp3/2Bn2P1/8/PPPP1P1P/RNBQK1NR b KQkq - 2 7',
        coachText: 'The queen retreats — already in trouble.',
        eval: '-1.0',
      },
      black: {
        san: 'Bxg4',
        piece: 'B',
        classification: 'book',
        fen: 'r2qkb1r/ppp2p1p/5np1/3Pp3/2Bn2b1/8/PPPP1P1P/RNBQK1NR w KQkq - 0 8',
        coachText: 'Wins material; White\'s king is exposed.',
        eval: '+2.0',
      },
    },
    {
      num: 8,
      white: {
        san: 'Ne2',
        piece: 'n',
        classification: 'book',
        fen: 'r2qkb1r/ppp2p1p/5np1/3Pp3/2Bn2b1/8/PPPPNP1P/RNBQK2R b KQkq - 1 8',
        coachText: 'Trying to untangle, but it\'s too late.',
        eval: '-1.5',
      },
      black: {
        san: 'Nf3+',
        piece: 'N',
        classification: 'great',
        fen: 'r2qkb1r/ppp2p1p/5np1/3Pp3/2B3b1/5n2/PPPPNP1P/RNBQK2R w KQkq - 2 9',
        coachText: 'A crushing fork — king and rook are both hit.',
        eval: '+5.0',
      },
    },
    {
      num: 9,
      white: {
        san: 'Kf1',
        piece: 'k',
        classification: 'book',
        fen: 'r2qkb1r/ppp2p1p/5np1/3Pp3/2B3b1/5n2/PPPPNP1P/RNBQ1K1R b kq - 3 9',
        coachText: 'The only legal king move.',
        eval: '-M1',
      },
      black: {
        san: 'Bh3#',
        piece: 'B',
        classification: 'great',
        highlighted: true,
        fen: 'r2qkb1r/ppp2p1p/5np1/3Pp3/2B5/5n1b/PPPPNP1P/RNBQ1K1R w kq - 4 10',
        coachText: 'Checkmate — don\'t try Scholar\'s Mate this way!',
        eval: '#',
      },
    },
  ],
  result: '0-1',
}

/** Tactics: Double Attack #1 (`intro-3`) — one move in the list: figurine R + `f7` (see `MoveList` + `piece: 'R'` + `san: 'Rf7'`). */
export const INTRO_3_GAME = {
  initialFen: '6k1/3p1p1p/8/8/8/8/8/5RK1 w - - 0 1',
  moves: [
    {
      num: 1,
      white: {
        san: 'Rf7',
        piece: 'R',
        classification: 'best',
        highlighted: true,
        fen: '6k1/3p1R1p/8/8/8/8/8/6K1 b - - 0 1',
        coachText:
          'The rook seizes the seventh rank with tempo — a classic double-attack idea: the king is exposed and the attack continues.',
        eval: '+1.0',
      },
    },
  ],
  result: '',
}

// ChessNote font character map: lowercase = white pieces, uppercase = black pieces
export const PIECE_CHARS = {
  k: 'k', q: 'q', r: 'r', b: 'b', n: 'n', p: 'p',
  K: 'K', Q: 'Q', R: 'R', B: 'B', N: 'N', P: 'P',
}
