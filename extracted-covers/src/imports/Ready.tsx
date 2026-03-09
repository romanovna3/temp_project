import svgPaths from "./svg-pw885jktfc";

function CircleFillCheck() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="circle-fill-check">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="circle-fill-check">
          <path d={svgPaths.p2076700} fill="var(--fill-0, #26C2A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IconFrame() {
  return (
    <div className="content-stretch flex items-center justify-center pr-[2px] py-[2px] relative shrink-0" data-name="Icon Frame">
      <CircleFillCheck />
    </div>
  );
}

export default function Ready() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative size-full" data-name="Ready">
      <IconFrame />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.85)]">Ready for Practice!</p>
    </div>
  );
}