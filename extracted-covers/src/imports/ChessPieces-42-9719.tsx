import svgPaths from "./svg-d5b317xbka";

function Group() {
  return (
    <div className="absolute inset-[16.33%_20.67%_9.56%_20.67%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 136.89 172.926">
        <g id="Group">
          <g id="Group_2">
            <path d={svgPaths.p3b7ac000} fill="var(--fill-0, #F9F9F9)" id="Vector" />
            <path d={svgPaths.p27d3c780} fill="var(--fill-0, white)" id="Vector_2" />
            <path d={svgPaths.p10651e00} fill="var(--fill-0, white)" id="Vector_3" />
            <path d={svgPaths.p9129d00} fill="var(--fill-0, white)" id="Vector_4" />
            <path d={svgPaths.p36e5ba00} fill="var(--fill-0, white)" id="Vector_5" />
            <path d={svgPaths.p351bb180} fill="var(--fill-0, black)" id="Vector_6" opacity="0.15" />
          </g>
          <g id="Group_3">
            <path d={svgPaths.p6345280} fill="var(--fill-0, #333333)" id="Vector_7" />
          </g>
          <g id="Group_4">
            <path d={svgPaths.p3c2deb80} fill="var(--fill-0, #333333)" id="Vector_8" />
          </g>
          <path d={svgPaths.pebef0f0} fill="var(--fill-0, #333333)" id="Vector_9" />
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