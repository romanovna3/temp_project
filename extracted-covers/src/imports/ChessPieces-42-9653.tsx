import svgPaths from "./svg-amfdldozd5";

function Group1() {
  return (
    <div className="absolute inset-[12.67%_58.88%_47.28%_16.61%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.19 93.463">
        <g id="Group">
          <path d={svgPaths.p25d23280} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[27.72%_56.48%_65.89%_35.66%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3471 14.9191">
        <g id="Group">
          <path d={svgPaths.p1a2d9600} fill="var(--fill-0, #333333)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute bottom-1/4 left-[27.18%] right-[21.62%] top-[19.82%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 119.473 128.752">
        <g id="Group">
          <path d={svgPaths.p35082f00} fill="var(--fill-0, black)" id="Vector" opacity="0.15" />
          <path d={svgPaths.p21519a80} fill="var(--fill-0, black)" id="Vector_2" opacity="0.15" />
          <path d={svgPaths.p27575200} fill="var(--fill-0, black)" id="Vector_3" opacity="0.15" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute inset-[10.44%_17.73%_9.5%_14.89%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 157.219 186.796">
        <g id="Group">
          <path d={svgPaths.p1a162b00} fill="var(--fill-0, #333333)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[10.44%_17.73%_9.5%_14.89%]" data-name="Group">
      <Group4 />
      <Group5 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[10.44%_17.73%_9.5%_14.89%]" data-name="Group">
      <div className="absolute inset-[11.56%_18.9%_10.56%_16.07%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 151.742 181.741">
          <path d={svgPaths.p2ed3000} fill="var(--fill-0, #F9F9F9)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[73.61%_20.12%_20.11%_26.38%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 124.833 14.6481">
          <path d={svgPaths.p22f74600} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <Group1 />
      <Group2 />
      <Group3 />
      <div className="absolute inset-[71.72%_26.34%_24.61%_32.16%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96.8334 8.55545">
          <path d={svgPaths.p12e5ee00} fill="var(--fill-0, #333333)" id="Vector" />
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