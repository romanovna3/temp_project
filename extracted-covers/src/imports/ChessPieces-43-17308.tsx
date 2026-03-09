import svgPaths from "./svg-g7sj886ro4";

function Group2() {
  return (
    <div className="absolute inset-[42.39%_27.5%_37.94%_27.44%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 105.139 45.8889">
        <g id="Group">
          <path d={svgPaths.p13996f80} fill="var(--fill-0, #1A1A1A)" id="Vector" />
          <path d={svgPaths.p188aa80} fill="var(--fill-0, #1A1A1A)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[42.39%_27.5%_37.94%_27.44%]" data-name="Group">
      <Group2 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[7.83%_11.11%_9.39%_11.11%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 181.481 193.148">
        <g id="Group">
          <path d={svgPaths.p16421200} fill="var(--fill-0, #1A1A1A)" id="Vector" />
          <path d={svgPaths.p161c9180} fill="var(--fill-0, #1A1A1A)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[7.83%_11.11%_9.39%_11.11%]" data-name="Group">
      <div className="absolute inset-[8.94%_12.33%_10.56%_12.22%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 176.04 187.833">
          <path d={svgPaths.p316ba680} fill="var(--fill-0, #575452)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[16%_38.39%_82.17%_52.78%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.6111 4.27777">
          <path d={svgPaths.p7876100} fill="var(--fill-0, white)" id="Vector" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute inset-[8.94%_45.06%_74.39%_38.28%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38.8886 38.8889">
          <path d={svgPaths.p3b158c00} fill="var(--fill-0, white)" id="Vector" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute inset-[73.61%_23.34%_20.11%_23.16%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 124.833 14.6482">
          <path d={svgPaths.pee6e780} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <div className="absolute inset-[29.87%_64.61%_40.44%_12.18%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54.1415 69.2562">
          <path d={svgPaths.p464ae00} fill="var(--fill-0, white)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <div className="absolute inset-[34.72%_12.28%_25.78%_63.61%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56.2592 92.1667">
          <path d={svgPaths.p1b0600} fill="var(--fill-0, black)" id="Vector" opacity="0.2" />
        </svg>
      </div>
      <Group1 />
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