import svgPaths from "./svg-tms6klw0gq";

function Group1() {
  return (
    <div className="absolute inset-[17.44%_21.83%_10.61%_21.72%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 131.704 167.87">
        <g id="Group">
          <path d={svgPaths.p6ba7e00} fill="var(--fill-0, #575452)" id="Vector" />
          <path d={svgPaths.p2293ef00} fill="var(--fill-0, white)" id="Vector_2" opacity="0.2" />
          <path d={svgPaths.p1850e600} fill="var(--fill-0, white)" id="Vector_3" opacity="0.3" />
          <path d={svgPaths.p19270dc0} fill="var(--fill-0, white)" id="Vector_4" opacity="0.3" />
          <path d={svgPaths.p39b88500} fill="var(--fill-0, white)" id="Vector_5" opacity="0.3" />
          <path d={svgPaths.p2cd7d770} fill="var(--fill-0, black)" id="Vector_6" opacity="0.2" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[39.17%_33.94%_57.17%_33.72%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75.4444 8.55555">
        <g id="Group">
          <path d={svgPaths.p1bd2fa80} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[16.33%_20.67%_9.56%_20.67%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 136.89 172.926">
        <g id="Group">
          <path d={svgPaths.p7cd0c00} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[16.33%_20.67%_9.56%_20.67%]" data-name="Group">
      <Group4 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[16.33%_20.67%_9.56%_20.67%]" data-name="Group">
      <Group1 />
      <Group2 />
      <div className="absolute inset-[71.72%_29.34%_24.61%_29.16%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96.8333 8.55552">
          <path d={svgPaths.pebd1900} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </svg>
      </div>
      <Group3 />
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