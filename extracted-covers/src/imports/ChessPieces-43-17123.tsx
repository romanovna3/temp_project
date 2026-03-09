import svgPaths from "./svg-fbhlineu1w";

function Group() {
  return (
    <div className="absolute inset-[22.5%_23.61%_9.33%_23.61%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 123.148 159.056">
        <g id="Group">
          <path d={svgPaths.p8630200} fill="var(--fill-0, #575452)" id="Vector" />
          <path d={svgPaths.pca02800} fill="var(--fill-0, black)" id="Vector_2" opacity="0.2" />
          <path d={svgPaths.p32ab300} fill="var(--fill-0, white)" id="Vector_3" opacity="0.2" />
          <path d={svgPaths.pda72d00} fill="var(--fill-0, white)" id="Vector_4" opacity="0.2" />
          <path d={svgPaths.p35564d00} fill="var(--fill-0, white)" id="Vector_5" opacity="0.2" />
          <g id="Group_2">
            <path d={svgPaths.p18248e80} fill="var(--fill-0, #1A1A1A)" id="Vector_6" />
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