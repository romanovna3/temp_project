import svgPaths from "./svg-isipv6jfe";

function TriangleFillSmallBottom() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="triangle-fill-small-bottom">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g filter="url(#filter0_d_4_3089)" id="triangle-fill-small-bottom">
          <path d={svgPaths.p3f5f5800} fill="var(--fill-0, white)" fillOpacity="0.5" id="Vector" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="17" id="filter0_d_4_3089" width="16" x="0" y="0">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
            <feOffset dy="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
            <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_4_3089" />
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_4_3089" mode="normal" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}

function ShowAll() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Show All">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)]">Show</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)]">All</p>
      <TriangleFillSmallBottom />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex items-center justify-end relative size-full">
      <ShowAll />
    </div>
  );
}