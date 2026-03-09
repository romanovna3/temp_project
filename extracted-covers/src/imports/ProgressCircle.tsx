import svgPaths from "./svg-8yh2eecowx";

export default function ProgressCircle() {
  return (
    <div className="relative size-full" data-name="Progress Circle">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Progress Circle">
          <rect fill="var(--fill-0, #81B64C)" height="24" id="completed" rx="12" width="24" />
          <path d={svgPaths.p6ea700} fill="var(--fill-0, #45753C)" id="checkmark-shadow" />
          <path d={svgPaths.p2d471980} fill="var(--fill-0, white)" id="checkmark" />
        </g>
      </svg>
    </div>
  );
}