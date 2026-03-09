import svgPaths from "./svg-b33tqdzgr4";

function MarkCheck() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="mark-check">
      <div className="absolute inset-[0_-37.8%_-30.23%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.0475 20.8363">
          <g filter="url(#filter0_d_13_690)" id="mark-check">
            <path d={svgPaths.p16e04ef0} fill="var(--fill-0, white)" fillOpacity="0.4" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="20.8363" id="filter0_d_13_690" width="22.0475" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_13_690" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_13_690" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function V6IconButton() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center opacity-50 relative rounded-[5px] shrink-0 size-[20px]" data-name="V6 Icon Button">
      <MarkCheck />
    </div>
  );
}

function Plys() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Plys">
      <V6IconButton />
      <div className="flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] min-h-px min-w-px not-italic overflow-hidden relative text-[14px] text-[rgba(255,255,255,0.72)] text-ellipsis whitespace-nowrap">
        <p className="leading-[20px] overflow-hidden">Learning from Proteus</p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="flex-[1_0_0] h-[44px] min-h-px min-w-px relative" data-name="Content">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[4px] items-center pl-[52px] pr-[12px] relative size-full">
          <Plys />
        </div>
      </div>
    </div>
  );
}

export default function Move() {
  return (
    <div className="content-stretch flex items-center relative size-full" data-name="Move">
      <Content />
    </div>
  );
}