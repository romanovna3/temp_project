import { BlackPawn, WhitePawn, BlackKnight, WhiteKnight, WhiteBishop, BlackBishop, BlackRook, WhiteRook, BlackQueen, WhiteQueen, BlackKing, WhiteKing } from "./ChessPieces";

type PieceType = "wp" | "bp" | "wn" | "bn" | "wb" | "bb" | "wr" | "br" | "wq" | "bq" | "wk" | "bk" | null;

interface ChessBoardProps {
  // positions is an object mapping square names (like "e4") to piece types
  positions?: Record<string, PieceType>;
}

export function ChessBoard({ positions = {} }: ChessBoardProps) {
  // Center 4x4 squares: c3-f6
  const files = ['c', 'd', 'e', 'f']; // indices 2, 3, 4, 5 in full board
  const ranks = [6, 5, 4, 3]; // center ranks
  const fileIndices = [2, 3, 4, 5]; // actual file indices for color calculation

  // Helper to determine if a square is dark
  const isDarkSquare = (fileIndex: number, rank: number) => {
    // Convert rank to index (8=7, 7=6, ..., 1=0)
    const rankIndex = 8 - rank;
    return (fileIndex + rankIndex) % 2 === 0;
  };

  // Render a piece based on type
  const renderPiece = (pieceType: PieceType) => {
    if (!pieceType) return null;
    
    const pieceComponents = {
      wp: WhitePawn,
      bp: BlackPawn,
      wn: WhiteKnight,
      bn: BlackKnight,
      wb: WhiteBishop,
      bb: BlackBishop,
      wr: WhiteRook,
      br: BlackRook,
      wq: WhiteQueen,
      bq: BlackQueen,
      wk: WhiteKing,
      bk: BlackKing,
    };
    
    const PieceComponent = pieceComponents[pieceType];
    return PieceComponent ? <PieceComponent /> : null;
  };

  return (
    <div className="relative" style={{ width: '96px', height: '96px' }}>
      {/* Render center 4x4 squares (16 squares) */}
      {files.map((file, idx) => {
        const fileIndex = fileIndices[idx];
        return ranks.map((rank, rankIdx) => {
          const squareName = `${file}${rank}`;
          const x = idx * 24; // 96px / 4 squares = 24px per square
          const y = rankIdx * 24;
          const isDark = isDarkSquare(fileIndex, rank);
          const bgColor = isDark ? '#779556' : '#EBECD0';
          const piece = positions[squareName];

          return (
            <div
              key={squareName}
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                width: '24px',
                height: '24px',
                backgroundColor: bgColor,
              }}
            >
              {piece && (
                <div style={{ 
                  width: '100%', 
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {renderPiece(piece)}
                </div>
              )}
            </div>
          );
        });
      })}
    </div>
  );
}

// Example opening positions
export const openingPositions = {
  // Alekhine's Defense
  alekhine: {
    e4: "wp" as PieceType,
    f6: "bn" as PieceType,
  },
  // Italian Game
  italian: {
    e4: "wp" as PieceType,
    e5: "bp" as PieceType,
    f3: "wn" as PieceType,
    c6: "bn" as PieceType,
    c4: "wb" as PieceType,
  },
  // Sicilian Defense
  sicilian: {
    e4: "wp" as PieceType,
    c5: "bp" as PieceType,
  },
  // French Defense
  french: {
    e4: "wp" as PieceType,
    e6: "bp" as PieceType,
  },
  // Center Control
  centerControl: {
    d4: "wq" as PieceType,
    e4: "wk" as PieceType,
    c5: "br" as PieceType,
    f5: "bk" as PieceType,
  },
  // All Pieces Demo
  allPieces: {
    c6: "wp" as PieceType,
    d6: "wn" as PieceType,
    e6: "wb" as PieceType,
    f6: "wr" as PieceType,
    c5: "wq" as PieceType,
    d5: "wk" as PieceType,
    c4: "bp" as PieceType,
    d4: "bn" as PieceType,
    e4: "bb" as PieceType,
    f4: "br" as PieceType,
    c3: "bq" as PieceType,
    d3: "bk" as PieceType,
  },
};