import imgSegment from "figma:asset/1654b6e276858fcc7111ec254ca7e2cf033a3098.png";

function Frame() {
  return (
    <div className="content-stretch flex items-baseline justify-between relative shrink-0 w-full">
      <p className="flex-[1_0_0] font-['Chess_Sans:Bold',sans-serif] leading-[20px] min-h-px min-w-px not-italic relative text-[17px] text-[rgba(255,255,255,0.85)] whitespace-pre-wrap" style={{ fontFeatureSettings: "'liga' 0" }}>
        Mastery
      </p>
    </div>
  );
}

function Segment() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px pointer-events-none relative" data-name="Segment">
      <div aria-hidden="true" className="absolute inset-0">
        <img alt="" className="absolute max-w-none object-cover size-full" src={imgSegment} />
        <div className="absolute bg-gradient-to-b from-[rgba(98,246,202,0.5)] inset-0 to-[rgba(98,246,202,0)]" />
      </div>
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0" />
    </div>
  );
}

function Segment1() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px pointer-events-none relative" data-name="Segment">
      <div aria-hidden="true" className="absolute inset-0">
        <img alt="" className="absolute max-w-none object-cover size-full" src={imgSegment} />
        <div className="absolute bg-gradient-to-b from-[rgba(98,246,202,0.5)] inset-0 to-[rgba(98,246,202,0)]" />
      </div>
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0" />
    </div>
  );
}

function Segment2() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px pointer-events-none relative" data-name="Segment">
      <div aria-hidden="true" className="absolute inset-0">
        <img alt="" className="absolute max-w-none object-cover size-full" src={imgSegment} />
        <div className="absolute bg-gradient-to-b from-[rgba(98,246,202,0.5)] inset-0 to-[rgba(98,246,202,0)]" />
      </div>
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0" />
    </div>
  );
}

function Segment3() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Segment">
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Component1stHalf() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[16px] items-center justify-end min-h-px min-w-px relative" data-name="1st Half">
      <Segment />
      <Segment1 />
      <Segment2 />
      <Segment3 />
    </div>
  );
}

function Segment4() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Segment">
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Segment5() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Segment">
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Segment6() {
  return (
    <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px relative" data-name="Segment">
      <div aria-hidden="true" className="absolute border-[#22201e] border-r-2 border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Segment7() {
  return <div className="flex-[1_0_0] h-[16px] min-h-px min-w-px" data-name="Segment" />;
}

function Component2ndHalf() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[16px] items-center justify-end min-h-px min-w-px relative" data-name="2nd Half">
      <Segment4 />
      <Segment5 />
      <Segment6 />
      <Segment7 />
    </div>
  );
}

function Bar() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex h-[16px] items-center overflow-clip relative rounded-[10px] shrink-0 w-full" data-name="Bar">
      <Component1stHalf />
      <Component2ndHalf />
    </div>
  );
}

function ProgressYellow() {
  return (
    <div className="absolute bg-[#26c2a3] h-[16px] left-[12.5%] right-[87.5%] top-0" data-name="Progress Yellow">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="size-full" />
      </div>
    </div>
  );
}

function MasteryPath() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Mastery Path 2">
      <Bar />
      <ProgressYellow />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <MasteryPath />
    </div>
  );
}

function CourseProgress() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-end relative shrink-0 w-full" data-name="Course Progress">
      <Frame />
      <Frame1 />
    </div>
  );
}

export default function CourseProgressContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start pb-[8px] pt-[12px] px-[16px] relative size-full" data-name="Course Progress Container">
      <CourseProgress />
    </div>
  );
}