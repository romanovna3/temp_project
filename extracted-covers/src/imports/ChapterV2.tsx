import svgPaths from "./svg-ezn220u57a";

function ProgressCircle() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Progress Circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Progress Circle">
          <path clipRule="evenodd" d={svgPaths.p1aaffa10} fill="var(--fill-0, white)" fillOpacity="0.1" fillRule="evenodd" id="track" />
          <path clipRule="evenodd" d={svgPaths.p2b971df0} fill="var(--fill-0, #81B64C)" fillRule="evenodd" id="completed" />
        </g>
      </svg>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center min-h-px min-w-px relative" data-name="Content">
      <ProgressCircle />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] min-h-px min-w-px not-italic overflow-hidden relative text-[14px] text-[rgba(255,255,255,0.72)] text-ellipsis whitespace-pre-wrap">Tactical Section</p>
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="content">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] text-[rgba(255,255,255,0.5)] whitespace-nowrap">
        <p className="leading-[16px]">5/7</p>
      </div>
    </div>
  );
}

function ArrowChevronBottom() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="arrow-chevron-bottom">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g filter="url(#filter0_d_3_3004)" id="arrow-chevron-bottom">
          <path d={svgPaths.pa2a9d00} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="17" id="filter0_d_3_3004" width="16" x="0" y="0">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3_3004" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_3_3004" mode="normal" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function V6IconButton() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative rounded-[5px] shrink-0 size-[24px]" data-name="V6 Icon Button">
      <ArrowChevronBottom />
    </div>
  );
}

function VariationsChevron() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Variations + Chevron">
      <Content1 />
      <V6IconButton />
    </div>
  );
}

function ProgressChapterName() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Progress + Chapter Name">
      <Content />
      <VariationsChevron />
    </div>
  );
}

export default function ChapterV() {
  return (
    <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full" data-name="Chapter V2">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <ProgressChapterName />
    </div>
  );
}