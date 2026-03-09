function Chip() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L2</p>
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Keen Learner</p>
    </div>
  );
}

function Counter() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Counter">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-right" style={{ fontFeatureSettings: "'liga' 0" }}>
        100
      </p>
    </div>
  );
}

export default function MasteryLevelItemContainer() {
  return (
    <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative size-full" data-name="Mastery Level Item - Container">
      <LeftPanel />
      <Counter />
    </div>
  );
}