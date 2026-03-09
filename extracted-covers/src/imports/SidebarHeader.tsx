import svgPaths from "./svg-ohrrd1m9hj";

function LeftIcon() {
  return <div className="content-stretch flex h-full items-center justify-center p-[12px] shrink-0 w-[48px]" data-name="Left Icon" />;
}

function BookMarkAqua() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="book-mark-aqua">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="book-mark-aqua">
          <path d={svgPaths.pf523c80} fill="var(--fill-0, #543426)" id="Vector" />
          <path d={svgPaths.p1def4600} fill="var(--fill-0, #9D6C3E)" id="Vector_2" />
          <path clipRule="evenodd" d={svgPaths.p1846f430} fill="var(--fill-0, #CA9350)" fillRule="evenodd" id="Vector_3" />
          <path d={svgPaths.p20513900} fill="var(--fill-0, #6A4632)" id="Vector_4" />
          <path d={svgPaths.p329eacf0} fill="var(--fill-0, #BEBDB9)" id="Vector_5" />
          <path d={svgPaths.p21620c00} fill="var(--fill-0, #8B8987)" id="Vector_6" />
          <path d={svgPaths.p2f69600} fill="var(--fill-0, #E7E6E5)" id="Vector_7" />
          <path d={svgPaths.p1dc74000} fill="var(--fill-0, #F8F8F8)" id="Vector_8" />
          <path d={svgPaths.p575c900} fill="var(--fill-0, #10777C)" id="Vector_9" />
          <path d={svgPaths.p2fa45580} fill="var(--fill-0, #26C2A3)" id="Vector_10" />
          <path d={svgPaths.p1ca8a300} fill="var(--fill-0, #26C2A3)" id="Vector_11" />
          <path d={svgPaths.p264b3e00} fill="var(--fill-0, #DAD8D6)" id="Vector_12" />
          <path d={svgPaths.p16fbdc80} fill="var(--fill-0, #DAD8D6)" id="Vector_13" />
          <path d={svgPaths.p3f44a770} fill="var(--fill-0, #DAD8D6)" id="Vector_14" />
          <path d={svgPaths.p2a96bd00} fill="var(--fill-0, #DAD8D6)" id="Vector_15" />
          <path d={svgPaths.p28ca5400} fill="var(--fill-0, #26C2A3)" id="Vector_16" />
          <path d={svgPaths.p14052d80} fill="var(--fill-0, #10777C)" id="Vector_17" />
          <path d={svgPaths.p1f5a6c40} fill="var(--fill-0, #109888)" id="Vector_18" opacity="0.5" />
          <path d={svgPaths.p1df54cf2} fill="var(--fill-0, #BEBDB9)" id="Vector_19" />
          <path d={svgPaths.p180b3a00} fill="var(--fill-0, #BEBDB9)" id="Vector_20" />
          <path clipRule="evenodd" d={svgPaths.p1b600e00} fill="var(--fill-0, #8B8987)" fillRule="evenodd" id="Vector_21" />
        </g>
      </svg>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] h-full items-center justify-center min-h-px min-w-px relative" data-name="Title">
      <BookMarkAqua />
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] max-h-[20px] not-italic overflow-hidden relative shrink-0 text-[17px] text-center text-ellipsis text-white" style={{ fontFeatureSettings: "'liga' 0" }}>
        Courses
      </p>
    </div>
  );
}

function RightIcon() {
  return <div className="content-stretch flex h-full items-center justify-center p-[12px] shrink-0 w-[48px]" data-name="Right Icon 01" />;
}

export default function SidebarHeader() {
  return (
    <div className="bg-[rgba(0,0,0,0.14)] content-stretch flex items-center justify-center relative size-full" data-name="Sidebar Header">
      <LeftIcon />
      <Title />
      <RightIcon />
    </div>
  );
}