import svgPaths from "./svg-99n1vbptmy";

function Group1() {
  return (
    <div className="absolute inset-[9.72%_21.88%_10.61%_21.67%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 131.704 185.889">
        <g id="Group">
          <path d={svgPaths.p17fa4700} fill="var(--fill-0, #575452)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[8.61%_20.66%_9.44%_20.66%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 136.905 191.204">
        <g id="Group">
          <path d={svgPaths.p2f3eb280} fill="var(--fill-0, #1A1A1A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[8.61%_20.66%_9.44%_20.66%]" data-name="Group">
      <Group3 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[8.61%_20.66%_9.44%_20.66%]" data-name="Group">
      <Group1 />
      <div className="absolute inset-[32.28%_27.33%_26.63%_49.84%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.2776 95.8708">
          <path d={svgPaths.p2f728f0} fill="var(--fill-0, black)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <div className="absolute inset-[21.81%_52.6%_39.66%_26.94%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47.7219 89.9012">
          <path d={svgPaths.p1da36980} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <div className="absolute inset-[10.44%_49.55%_80.67%_42.12%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.4352 20.759">
          <path d={svgPaths.p2eb15400} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <div className="absolute inset-[73.61%_23.38%_20.11%_23.12%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 124.833 14.6481">
          <path d={svgPaths.p176c4f00} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <div className="absolute inset-[10.78%_43.38%_47.11%_41.95%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34.2222 98.2592">
          <path d={svgPaths.p3219ee00} fill="var(--fill-0, black)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <Group2 />
      <div className="absolute inset-[71.67%_35.38%_25.56%_35.06%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 68.963 6.48149">
          <path d={svgPaths.p1f35800} fill="var(--fill-0, #1A1A1A)" id="Vector" />
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