function MoveClassification() {
  return <div className="shrink-0 size-[16px]" data-name="Move Classification" />;
}

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

function Ply() {
  return (
    <div className="bg-[rgba(255,255,255,0.08)] content-stretch flex items-center justify-center overflow-clip px-[4px] py-[2px] relative rounded-[2px] shadow-[0px_2px_0px_0px_rgba(255,255,255,0.5)] shrink-0" data-name="Ply">
      <PieceNotation />
    </div>
  );
}

function PlyClassification() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[100px]" data-name="Ply + Classification">
      <MoveClassification />
      <Ply />
    </div>
  );
}

function MoveClassification1() {
  return <div className="shrink-0 size-[16px]" data-name="Move Classification" />;
}

function Notation1() {
  return (
    <div className="content-stretch flex flex-col h-[18px] items-start justify-end relative shrink-0" data-name="Notation">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.72)] w-full">
        <p className="leading-[16px] whitespace-pre-wrap">d5</p>
      </div>
    </div>
  );
}

function PieceNotation1() {
  return (
    <div className="content-stretch flex gap-[2px] h-[18px] items-center justify-center relative shrink-0" data-name="Piece + Notation">
      <Notation1 />
    </div>
  );
}

function Ply1() {
  return (
    <div className="content-stretch flex items-center justify-center overflow-clip px-[4px] py-[2px] relative rounded-[2px] shrink-0" data-name="Ply">
      <PieceNotation1 />
    </div>
  );
}

function PlyClassification1() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0 w-[100px]" data-name="Ply + Classification">
      <MoveClassification1 />
      <Ply1 />
    </div>
  );
}

function Plys() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Plys">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[13px] text-[rgba(255,255,255,0.5)] w-[24px] whitespace-pre-wrap">1.</p>
      <PlyClassification />
      <PlyClassification1 />
    </div>
  );
}

export default function Move() {
  return (
    <div className="content-stretch flex items-center px-[16px] relative size-full" data-name="Move">
      <Plys />
    </div>
  );
}