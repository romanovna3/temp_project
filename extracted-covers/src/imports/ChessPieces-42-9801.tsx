import svgPaths from "./svg-7yke5m4ve9";

function Group2() {
  return (
    <div className="absolute inset-[42.39%_27.5%_37.89%_56.66%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.9447 46.0186">
        <g id="Group">
          <path d={svgPaths.p294a2780} fill="var(--fill-0, #333333)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents inset-[42.39%_27.5%_37.89%_56.66%]" data-name="Group">
      <Group2 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[42.39%_56.73%_37.94%_27.44%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.9445 45.8888">
        <g id="Group">
          <path d={svgPaths.p2e78d700} fill="var(--fill-0, #333333)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[42.39%_56.73%_37.94%_27.44%]" data-name="Group">
      <Group4 />
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute inset-[7.83%_11.11%_9.39%_11.11%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 181.481 193.148">
        <g id="Group">
          <path d={svgPaths.p40acf40} fill="var(--fill-0, #333333)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[7.83%_11.11%_9.39%_11.11%]" data-name="Group">
      <Group6 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-[7.83%_11.11%_9.39%_11.11%]" data-name="Group">
      <div className="absolute inset-[8.94%_12.34%_10.56%_12.22%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 176.04 187.833">
          <path d={svgPaths.p1a6b40c0} fill="var(--fill-0, #F9F9F9)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[16%_38.39%_82.17%_52.78%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.6111 4.27764">
          <path d={svgPaths.p383ae400} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[8.94%_45.06%_74.39%_38.27%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38.8886 38.8889">
          <path d={svgPaths.p2bbae680} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[73.61%_23.34%_20.11%_23.16%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 124.833 14.6481">
          <path d={svgPaths.p36f1b00} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[29.87%_64.61%_40.44%_12.18%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54.1415 69.2562">
          <path d={svgPaths.p32f71780} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[34.72%_12.28%_25.78%_63.61%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56.2592 92.1667">
          <path d={svgPaths.p1db26e00} fill="var(--fill-0, black)" id="Vector" opacity="0.15" />
        </svg>
      </div>
      <Group1 />
      <Group3 />
      <div className="absolute inset-[71.67%_29.34%_24.67%_29.16%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96.8335 8.55545">
          <path d={svgPaths.p34a5a100} fill="var(--fill-0, #333333)" id="Vector" />
        </svg>
      </div>
      <Group5 />
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