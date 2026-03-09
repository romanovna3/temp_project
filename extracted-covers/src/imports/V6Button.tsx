import imgV6Button from "figma:asset/b9352dd82a07ad4068298c1d4d9d2a99931474f4.png";

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

export default function V6Button() {
  return (
    <div className="content-stretch flex gap-[4px] items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.14),0px_2px_4px_0px_rgba(0,0,0,0.1)] size-full" data-name="V6 Button">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[10px] size-full" src={imgV6Button} />
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[17px] text-center text-shadow-[0px_1px_0px_rgba(0,0,0,0.2)] text-white" style={{ fontFeatureSettings: "'liga' 0" }}>
        Practice All
      </p>
      <BadgeFrame />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(178,224,104,0.4),inset_0px_-1px_0px_0px_#45753c,inset_0px_2px_4px_0px_rgba(178,224,104,0.5),inset_0px_-2px_4px_0px_rgba(69,117,60,0.5)]" />
    </div>
  );
}