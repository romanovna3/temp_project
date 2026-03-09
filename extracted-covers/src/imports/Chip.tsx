import svgPaths from "./svg-ytugo1r1xb";

function Icon() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d={svgPaths.p6179800} fill="var(--fill-0, #8B8987)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Chip() {
  return (
    <div className="bg-[#dad8d6] content-stretch flex gap-[4px] items-center justify-center px-[4px] py-[2px] relative rounded-[3px] size-full" data-name="Chip">
      <Icon />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] not-italic relative shrink-0 text-[#666564] text-[12px] text-center text-shadow-[0px_1px_0px_rgba(255,255,255,0)] tracking-[0.6px] uppercase">1 day</p>
    </div>
  );
}