import svgPaths from "./svg-mcmtu98ote";

function Group() {
  return (
    <div className="absolute inset-[8.61%_20.66%_9.44%_20.67%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 136.905 191.204">
        <g id="Group">
          <g id="Group_2">
            <path d={svgPaths.pb4a1e00} fill="var(--fill-0, #F9F9F9)" id="Vector" />
          </g>
          <path d={svgPaths.pb3bd600} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p209ee780} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p36c48e00} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.pd1bfec0} fill="var(--fill-0, black)" id="Vector_5" opacity="0.15" />
          <path d={svgPaths.p16e7df00} fill="var(--fill-0, black)" id="Vector_6" opacity="0.15" />
          <g id="Group_3">
            <path d={svgPaths.p19f4a680} fill="var(--fill-0, #333333)" id="Vector_7" />
          </g>
          <path d={svgPaths.p1ea99700} fill="var(--fill-0, #333333)" id="Vector_8" />
        </g>
      </svg>
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