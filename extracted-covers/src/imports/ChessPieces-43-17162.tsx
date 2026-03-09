import svgPaths from "./svg-21b1n9lg2n";

function Group1() {
  return (
    <div className="absolute inset-[12.67%_58.88%_47.28%_16.61%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.19 93.463">
        <g id="Group" opacity="0.2">
          <path d={svgPaths.p2d253820} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[27.72%_56.47%_65.89%_35.66%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3471 14.9195">
        <g id="Group">
          <path d={svgPaths.p1ba12700} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute bottom-1/4 left-[27.18%] right-[21.61%] top-[19.82%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 119.471 128.752">
        <g id="Group">
          <path d={svgPaths.pe9b400} fill="var(--fill-0, black)" id="Vector" opacity="0.2" />
          <path d={svgPaths.p1a2f6900} fill="var(--fill-0, black)" id="Vector_2" opacity="0.2" />
          <path d={svgPaths.pc159500} fill="var(--fill-0, black)" id="Vector_3" opacity="0.2" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute inset-[10.44%_17.72%_9.5%_14.9%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 157.219 186.796">
        <g id="Group">
          <path d={svgPaths.p3ff11400} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[10.44%_17.72%_9.5%_14.9%]" data-name="Group">
      <Group3 />
      <Group4 />
      <Group5 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[10.44%_17.72%_9.5%_14.9%]" data-name="Group">
      <div className="absolute inset-[11.56%_18.89%_10.56%_16.08%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 151.742 181.741">
          <path d={svgPaths.p18929b00} fill="var(--fill-0, #575452)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[73.61%_20.11%_20.11%_26.39%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 124.833 14.6481">
          <path d={svgPaths.p3bae0ec0} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <Group1 />
      <Group2 />
      <div className="absolute inset-[71.72%_26.11%_24.61%_32.39%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96.8333 8.55554">
          <path d={svgPaths.p3ee9af00} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function ChessPieces() {
  return (
    <div className="relative size-full" data-name="Chess Pieces">
      <Group />
    </div>
  );
}