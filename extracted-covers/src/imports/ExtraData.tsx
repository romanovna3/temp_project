import svgPaths from "./svg-twmqdxd37v";

function Icon() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <div className="absolute inset-[0_-87.5%_-87.5%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 22.5">
          <g id="Icon">
            <path d={svgPaths.p3f325000} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Chip() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <Icon />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.72)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)] tracking-[0.6px] uppercase">1 day</p>
    </div>
  );
}

function PracticeIn() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[4px] items-center min-h-px min-w-px relative" data-name="Practice In">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)]">Practice in:</p>
      <Chip />
    </div>
  );
}

function Chip1() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L2</p>
    </div>
  );
}

function LevelChip() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Level + chip">
      <Chip1 />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.85)]">Novice</p>
    </div>
  );
}

function NextLevel() {
  return (
    <div className="content-stretch flex gap-[4px] items-baseline relative shrink-0" data-name="Next Level">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)]">Next Level:</p>
      <LevelChip />
    </div>
  );
}

export default function ExtraData() {
  return (
    <div className="content-stretch flex items-end justify-between p-[2px] relative size-full" data-name="Extra data">
      <PracticeIn />
      <NextLevel />
    </div>
  );
}