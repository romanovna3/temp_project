import svgPaths from "./svg-cfoxdf4o15";

function PlayBlack() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="play-black">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="play-black">
          <path d={svgPaths.p398f1e00} fill="var(--fill-0, #666564)" id="Vector" />
          <path d={svgPaths.p13d48600} fill="var(--fill-0, #4B4847)" id="Vector_2" />
          <path d={svgPaths.p23ca3580} fill="var(--fill-0, #D5A47D)" id="Vector_3" />
          <path d={svgPaths.p3fa03a70} fill="var(--fill-0, #8D694B)" id="Vector_4" />
          <path d={svgPaths.p37d4ef00} fill="var(--fill-0, #8D694B)" id="Vector_5" />
          <path d={svgPaths.pb97ec00} fill="var(--fill-0, #E3C29C)" id="Vector_6" />
          <path d={svgPaths.p34884380} fill="var(--fill-0, #8B8987)" id="Vector_7" />
          <path d={svgPaths.p1dd6ee80} fill="var(--fill-0, #8B8987)" id="Vector_8" />
          <path d={svgPaths.p1042b600} fill="var(--fill-0, #8B8987)" id="Vector_9" />
          <path d={svgPaths.p3fb5c080} fill="var(--fill-0, #8B8987)" id="Vector_10" />
          <path d={svgPaths.p8f79600} fill="var(--fill-0, #FADAAE)" id="Vector_11" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Title">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#312e2b] text-[18px]">Ready?</p>
    </div>
  );
}

function Header() {
  return (
    <div className="content-stretch flex items-start relative shrink-0 w-full" data-name="Header">
      <Title />
    </div>
  );
}

function Message() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-h-px min-w-px relative" data-name="message">
      <Header />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#312e2b] text-[15px] w-full whitespace-pre-wrap">These are the moves you’ll learn. Review them and let’s start whenever you’re ready</p>
    </div>
  );
}

function Quiz() {
  return (
    <div className="bg-white min-h-[36px] relative rounded-[10px] shrink-0 w-full" data-name="Quiz">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="flex flex-row items-center min-h-[inherit] size-full">
        <div className="content-stretch flex gap-[12px] items-center min-h-[inherit] px-[16px] py-[12px] relative w-full">
          <PlayBlack />
          <Message />
        </div>
      </div>
    </div>
  );
}

export default function CoachNew() {
  return (
    <div className="bg-gradient-to-b content-stretch flex flex-col from-[#1e1d1a] items-start px-[16px] py-[12px] relative size-full to-[rgba(38,36,33,0)]" data-name="Coach/New">
      <Quiz />
    </div>
  );
}