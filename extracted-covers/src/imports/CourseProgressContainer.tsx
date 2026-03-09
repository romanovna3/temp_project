import img1 from "figma:asset/d2487cd8c0eb421dbab28e9b315921f7cd1a805c.png";

function Header() {
  return (
    <div className="content-stretch flex items-baseline justify-between not-italic relative shrink-0 w-full" data-name="Header">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)]" style={{ fontFeatureSettings: "'liga' 0" }}>
        Progress
      </p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)]">{`Learned: 45/150 `}</p>
    </div>
  );
}

function Component() {
  return (
    <div className="relative rounded-[999px] shadow-[0px_1px_0px_0px_rgba(0,0,0,0.2)] size-full" data-name="1">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[999px] size-full" src={img1} />
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex h-[16px] items-center overflow-clip relative rounded-[10px] w-full" data-name=".ProgressBar">
      <div className="absolute flex h-[16px] items-center justify-center left-0 right-[58.67%] top-0">
        <div className="flex-none h-[16px] rotate-180 w-[152.107px]">
          <Component />
        </div>
      </div>
    </div>
  );
}

function V6ProgressBar() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="v6 Progress Bar">
      <div className="flex items-center justify-center relative shrink-0 w-full">
        <div className="-scale-y-100 flex-none w-full">
          <ProgressBar />
        </div>
      </div>
    </div>
  );
}

function CourseProgress() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-end relative shrink-0 w-full" data-name="Course Progress">
      <Header />
      <V6ProgressBar />
    </div>
  );
}

export default function CourseProgressContainer() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[8px] pt-[12px] px-[16px] relative size-full" data-name="Course Progress Container">
      <CourseProgress />
    </div>
  );
}