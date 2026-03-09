import svgPaths from "./svg-dfypcan4lj";

function Play1() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+1.77px)] size-[24px] top-[calc(50%+0.47px)]" data-name="play">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="play">
          <path d={svgPaths.p34a51100} fill="var(--fill-0, #666564)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Play() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0.85)] left-1/2 rounded-[60.789px] size-[50px] top-[calc(50%+1.2px)]" data-name="Play">
      <Play1 />
    </div>
  );
}

export default function VideoSection() {
  return (
    <div className="content-stretch flex flex-col gap-[9.788px] items-center relative size-full" data-name="Video Section">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.1)] border-b-[0.979px] border-solid inset-0 pointer-events-none" />
      <div className="aspect-[294.73468017578125/166] bg-black shrink-0 w-full" data-name="Video Placeholder Frame" />
      <Play />
    </div>
  );
}