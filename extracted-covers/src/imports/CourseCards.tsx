import imgCoverImage from "figma:asset/551f432d14ad1dbb5284fd2e507c1645bada6f4b.png";
import imgCoverImage1 from "figma:asset/0b4bca0e0106f6afadf0bf56a61f2b69b3b50f39.png";

function CoverImage() {
  return (
    <div className="relative rounded-[3px] shrink-0 size-[80px]" data-name="Cover Image">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[3px]">
        <img alt="" className="absolute max-w-none object-cover rounded-[3px] size-full" src={imgCoverImage} />
        <img alt="" className="absolute max-w-none object-cover rounded-[3px] size-full" src={imgCoverImage1} />
      </div>
    </div>
  );
}

function TitleAuthor() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[8px] items-start min-h-px min-w-px not-italic py-[2px] relative self-stretch" data-name="Title + Author">
      <div className="flex flex-col font-['Chess_Sans:Bold',sans-serif] justify-end leading-[0] min-w-full overflow-hidden relative shrink-0 text-[14px] text-[rgba(255,255,255,0.72)] text-ellipsis w-[min-content]" style={{ fontFeatureSettings: "'liga' 0" }}>
        <p className="leading-[16px] whitespace-pre-wrap">The Master’s Hand: Capablanca’s Endgame Technique</p>
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)]">GM Alex Colovich</p>
    </div>
  );
}

export default function CourseCards() {
  return (
    <div className="content-stretch flex gap-[12px] items-start p-[16px] relative size-full" data-name="Course Cards">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.1)] border-b border-solid inset-0 pointer-events-none" />
      <CoverImage />
      <TitleAuthor />
    </div>
  );
}