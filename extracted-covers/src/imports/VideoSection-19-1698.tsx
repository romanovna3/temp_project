import svgPaths from "./svg-d1vdb2s4cc";

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
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0.85)] left-1/2 rounded-[60.789px] size-[50px] top-1/2" data-name="Play">
      <Play1 />
    </div>
  );
}

export default function VideoSection() {
  return (
    <div className="content-stretch flex flex-col gap-[9.788px] items-center relative size-full" data-name="Video Section">
      <div className="bg-black h-[112px] shrink-0 w-[198px]" data-name="Video Placeholder Frame" />
      <Play />
    </div>
  );
}