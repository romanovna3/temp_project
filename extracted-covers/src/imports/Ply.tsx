function Notation() {
  return (
    <div className="content-stretch flex flex-col h-[18px] items-start justify-end relative shrink-0" data-name="Notation">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-white w-full">
        <p className="leading-[16px] whitespace-pre-wrap">d4</p>
      </div>
    </div>
  );
}

function PieceNotation() {
  return (
    <div className="content-stretch flex gap-[2px] h-[18px] items-center justify-center relative shrink-0" data-name="Piece + Notation">
      <Notation />
    </div>
  );
}

export default function Ply() {
  return (
    <div className="bg-[rgba(255,255,255,0.08)] content-stretch flex items-center justify-center overflow-clip px-[4px] py-[2px] relative rounded-[2px] shadow-[0px_2px_0px_0px_rgba(255,255,255,0.5)] size-full" data-name="Ply">
      <PieceNotation />
    </div>
  );
}