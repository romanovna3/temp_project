import svgPaths from "./svg-z4ef421ai2";

function Group() {
  return (
    <div className="absolute inset-[22.5%_23.61%_9.33%_23.61%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 123.148 159.056">
        <g id="Group">
          <path d={svgPaths.p370f4780} fill="var(--fill-0, #F9F9F9)" id="Vector" />
          <path d={svgPaths.p39d6a680} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.pe35f870} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p36273d00} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p13b8f900} fill="var(--fill-0, black)" id="Vector_5" opacity="0.15" />
          <g id="Group_2">
            <path d={svgPaths.p23883d00} fill="var(--fill-0, #333333)" id="Vector_6" />
          </g>
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