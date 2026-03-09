import svgPaths from "./svg-tw475i6qps";
import imgV6Button from "figma:asset/d1e0ccb76a91196803b346b08c8efcacd4f4cdee.png";
import imgV6Button1 from "figma:asset/cf6f5ca81d793eada6b8a0115cbf03233b9e8b1c.png";

function MediaCameraVideoOn() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="media-camera-video-on">
      <div className="absolute inset-[0_0_0_-0.04%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.01 24">
          <g filter="url(#filter0_d_16_1539)" id="media-camera-video-on">
            <path d={svgPaths.p19353000} fill="var(--fill-0, white)" fillOpacity="0.72" id="Vector" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="25" id="filter0_d_16_1539" width="24.01" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_16_1539" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_16_1539" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function V6Button() {
  return (
    <div className="flex-[1_0_0] h-[48px] max-h-[48px] min-h-px min-w-px relative rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.14),0px_2px_4px_0px_rgba(0,0,0,0.1)]" data-name="V6 Button">
      <img alt="" className="absolute backdrop-blur-[25px] inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgV6Button} />
      <div className="flex flex-row items-center justify-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center max-h-[inherit] px-[16px] py-[12px] relative size-full">
          <MediaCameraVideoOn />
          <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]" style={{ fontFeatureSettings: "'liga' 0" }}>
            Video
          </p>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

function V6Button1() {
  return (
    <div className="flex-[1_0_0] h-[48px] max-h-[48px] min-h-px min-w-px relative rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.14),0px_2px_4px_0px_rgba(0,0,0,0.1)]" data-name="V6 Button">
      <img alt="" className="absolute backdrop-blur-[25px] inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgV6Button} />
      <div className="flex flex-row items-center justify-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center max-h-[inherit] px-[16px] py-[12px] relative size-full">
          <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-[rgba(255,255,255,0.85)] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)]" style={{ fontFeatureSettings: "'liga' 0" }}>
            Learn
          </p>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.08)]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-full">
      <V6Button />
      <V6Button1 />
    </div>
  );
}

function NotificationBadge() {
  return (
    <div className="bg-[rgba(255,255,255,0.72)] content-stretch flex flex-col items-center justify-center min-w-[16px] px-[4px] relative rounded-[10px] shrink-0" data-name="Notification Badge">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#45753c] text-[12px] text-center tracking-[0.6px] uppercase">32</p>
    </div>
  );
}

function BadgeFrame() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[2px] relative shrink-0" data-name="Badge Frame">
      <NotificationBadge />
    </div>
  );
}

function V6Button2() {
  return (
    <div className="flex-[1_0_0] h-[48px] max-h-[48px] min-h-px min-w-px relative rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.14),0px_2px_4px_0px_rgba(0,0,0,0.1)]" data-name="V6 Button">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgV6Button1} />
      <div className="flex flex-row items-center justify-center max-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[4px] items-center justify-center max-h-[inherit] px-[16px] py-[12px] relative size-full">
          <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)] text-white" style={{ fontFeatureSettings: "'liga' 0" }}>
            Practice All
          </p>
          <BadgeFrame />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(178,224,104,0.4),inset_0px_-1px_0px_0px_#45753c,inset_0px_2px_4px_0px_rgba(178,224,104,0.5),inset_0px_-2px_4px_0px_rgba(69,117,60,0.5)]" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full">
      <V6Button2 />
    </div>
  );
}

export default function Buttons() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pb-[16px] pt-[8px] px-[16px] relative size-full" data-name="Buttons">
      <Frame />
      <Frame1 />
    </div>
  );
}