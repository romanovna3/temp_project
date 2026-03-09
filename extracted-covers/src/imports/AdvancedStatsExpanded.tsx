import svgPaths from "./svg-1sr93vr5m1";

function PracticeFIlter() {
  return (
    <div className="bg-[rgba(0,0,0,0.14)] relative shrink-0 w-full" data-name="Practice FIlter">
      <div className="content-stretch flex font-['Inter:Semi_Bold',sans-serif] font-semibold items-start justify-between leading-[16px] not-italic px-[16px] py-[12px] relative text-[14px] text-[rgba(255,255,255,0.5)] w-full">
        <p className="relative shrink-0">Level</p>
        <p className="relative shrink-0">Variations</p>
      </div>
    </div>
  );
}

function Chip1() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L1</p>
    </div>
  );
}

function Chip() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Chip">
      <Chip1 />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Rookie</p>
    </div>
  );
}

function SecondaryInfo() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Secondary Info">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-right" style={{ fontFeatureSettings: "'liga' 0" }}>
        120
      </p>
    </div>
  );
}

function MasteryLevelItemContainer() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative w-full">
          <LeftPanel />
          <SecondaryInfo />
        </div>
      </div>
    </div>
  );
}

function Chip2() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L2</p>
    </div>
  );
}

function LeftPanel1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip2 />
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

function MasteryLevelItemContainer1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative w-full">
          <LeftPanel1 />
          <Counter />
        </div>
      </div>
    </div>
  );
}

function Chip3() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L3</p>
    </div>
  );
}

function LeftPanel2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip3 />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Apprentice</p>
    </div>
  );
}

function SecondaryInfo1() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Secondary Info">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-right" style={{ fontFeatureSettings: "'liga' 0" }}>
        80
      </p>
    </div>
  );
}

function MasteryLevelItemContainer2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative w-full">
          <LeftPanel2 />
          <SecondaryInfo1 />
        </div>
      </div>
    </div>
  );
}

function Chip4() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L4</p>
    </div>
  );
}

function LeftPanel3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip4 />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Rank Riser</p>
    </div>
  );
}

function SecondaryInfo2() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Secondary Info">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-right" style={{ fontFeatureSettings: "'liga' 0" }}>
        68
      </p>
    </div>
  );
}

function MasteryLevelItemContainer3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative w-full">
          <LeftPanel3 />
          <SecondaryInfo2 />
        </div>
      </div>
    </div>
  );
}

function Chip5() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L5</p>
    </div>
  );
}

function LeftPanel4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip5 />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Booked Up</p>
    </div>
  );
}

function SecondaryInfo3() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Secondary Info">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-right" style={{ fontFeatureSettings: "'liga' 0" }}>
        54
      </p>
    </div>
  );
}

function MasteryLevelItemContainer4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative w-full">
          <LeftPanel4 />
          <SecondaryInfo3 />
        </div>
      </div>
    </div>
  );
}

function Chip6() {
  return (
    <div className="bg-[rgba(98,246,202,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#26c2a3] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L6</p>
    </div>
  );
}

function LeftPanel5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Left Panel">
      <Chip6 />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Expert</p>
    </div>
  );
}

function SecondaryInfo4() {
  return (
    <div className="content-stretch flex gap-[2px] items-center relative shrink-0" data-name="Secondary Info">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-right" style={{ fontFeatureSettings: "'liga' 0" }}>
        1
      </p>
    </div>
  );
}

function MasteryLevelItemContainer5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[16px] py-[2px] relative w-full">
          <LeftPanel5 />
          <SecondaryInfo4 />
        </div>
      </div>
    </div>
  );
}

function Chip8() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.72)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L7</p>
    </div>
  );
}

function Chip7() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Chip">
      <Chip8 />
    </div>
  );
}

function LeftPanel6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px opacity-40 relative" data-name="Left Panel">
      <Chip7 />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Encyclopaedic</p>
    </div>
  );
}

function LeadingIcon() {
  return (
    <div className="opacity-40 relative shrink-0 size-[20px]" data-name="Leading Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Frame">
          <path d={svgPaths.p2ea56d70} fill="var(--fill-0, white)" fillOpacity="0.4" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MasteryLevelItemContainer6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[2px] relative w-full">
          <LeftPanel6 />
          <LeadingIcon />
        </div>
      </div>
    </div>
  );
}

function Chip10() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex gap-[4px] items-center justify-center min-h-[20px] px-[4px] py-[2px] relative rounded-[3px] shrink-0" data-name="Chip">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.72)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">L8</p>
    </div>
  );
}

function Chip9() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Chip">
      <Chip10 />
    </div>
  );
}

function LeftPanel7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px opacity-40 relative" data-name="Left Panel">
      <Chip9 />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] min-h-px min-w-px not-italic relative text-[14px] text-[rgba(255,255,255,0.72)] whitespace-pre-wrap">Master</p>
    </div>
  );
}

function LeadingIcon1() {
  return (
    <div className="opacity-40 relative shrink-0 size-[20px]" data-name="Leading Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Frame">
          <path d={svgPaths.p2ea56d70} fill="var(--fill-0, white)" fillOpacity="0.4" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MasteryLevelItemContainer7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Mastery Level Item - Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[2px] relative w-full">
          <LeftPanel7 />
          <LeadingIcon1 />
        </div>
      </div>
    </div>
  );
}

function VariationsContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start py-[12px] relative shrink-0 w-full" data-name="Variations Container">
      <MasteryLevelItemContainer />
      <MasteryLevelItemContainer1 />
      <MasteryLevelItemContainer2 />
      <MasteryLevelItemContainer3 />
      <MasteryLevelItemContainer4 />
      <MasteryLevelItemContainer5 />
      <MasteryLevelItemContainer6 />
      <MasteryLevelItemContainer7 />
    </div>
  );
}

function AdvancedStats() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[500px]" data-name="Advanced Stats">
      <PracticeFIlter />
      <VariationsContainer />
    </div>
  );
}

function ArrowChevronBottom() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="arrow-chevron-bottom">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g filter="url(#filter0_d_10_948)" id="arrow-chevron-bottom">
          <path d={svgPaths.pa2a9d00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="17" id="filter0_d_10_948" width="16" x="0" y="0">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_10_948" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_10_948" mode="normal" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function V6IconButton() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative rounded-[5px] size-[24px]" data-name="V6 Icon Button">
      <ArrowChevronBottom />
    </div>
  );
}

function VariationsChevron() {
  return (
    <button className="content-stretch cursor-pointer flex gap-[4px] items-center relative shrink-0" data-name="Variations + Chevron">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.72)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">Less Stats</p>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <V6IconButton />
        </div>
      </div>
    </button>
  );
}

function Less() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[8px] pt-[4px] relative shrink-0 w-[500px]" data-name="Less">
      <VariationsChevron />
    </div>
  );
}

export default function AdvancedStatsExpanded() {
  return (
    <div className="content-stretch flex flex-col items-start relative size-full" data-name="Advanced Stats Expanded">
      <AdvancedStats />
      <Less />
    </div>
  );
}