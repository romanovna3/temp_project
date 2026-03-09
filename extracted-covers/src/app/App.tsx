import { ChessBoard, openingPositions } from "./components/ChessBoard";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-[#262421] p-8">
      <div className="flex flex-col gap-8">
        <div className="text-white text-2xl font-bold">Chess Board Patterns</div>
        
        <div className="flex flex-wrap gap-6">
          {/* Empty Board */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard />
            <span className="text-white text-sm">Empty Board</span>
          </div>

          {/* Alekhine's Defense */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard positions={openingPositions.alekhine} />
            <span className="text-white text-sm">Alekhine's Defense</span>
          </div>

          {/* Italian Game */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard positions={openingPositions.italian} />
            <span className="text-white text-sm">Italian Game</span>
          </div>

          {/* Sicilian Defense */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard positions={openingPositions.sicilian} />
            <span className="text-white text-sm">Sicilian Defense</span>
          </div>

          {/* French Defense */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard positions={openingPositions.french} />
            <span className="text-white text-sm">French Defense</span>
          </div>

          {/* Center Control */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard positions={openingPositions.centerControl} />
            <span className="text-white text-sm">Center Control</span>
          </div>

          {/* All Pieces Demo */}
          <div className="flex flex-col gap-2 items-center">
            <ChessBoard positions={openingPositions.allPieces} />
            <span className="text-white text-sm">All Pieces Demo</span>
          </div>
        </div>

        <div className="text-white text-sm max-w-2xl">
          <p className="mb-2">The chess board shows the center 4×4 squares (c3-f6):</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Only 16 center squares are shown (files c-f, ranks 3-6)</li>
            <li>Each square is 24×24px, total board is 96×96px</li>
            <li>Dark squares: #779556 (olive green)</li>
            <li>Light squares: #EBECD0 (cream)</li>
            <li>Pieces are rendered centered on the squares</li>
          </ul>
        </div>
      </div>
    </div>
  );
}