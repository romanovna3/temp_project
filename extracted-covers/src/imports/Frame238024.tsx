import svgPaths from "./svg-n8sfv5o73b";

function ArrowChevronBottom() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="arrow-chevron-bottom">
      <div className="absolute inset-[0_-37.8%_-16.05%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.0475 18.5675">
          <g filter="url(#filter0_d_5_1658)" id="arrow-chevron-bottom">
            <path d={svgPaths.p290c1b80} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="18.5675" id="filter0_d_5_1658" width="22.0475" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_5_1658" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_5_1658" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function V6Button() {
  return (
    <div className="content-stretch flex gap-[8px] h-[32px] items-center justify-center max-h-[32px] overflow-clip px-[16px] py-[8px] relative rounded-[5px] shrink-0" data-name="V6 Button">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.72)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]">{`More `}</p>
      <ArrowChevronBottom />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center pb-[4px] relative size-full">
      <V6Button />
    </div>
  );
}