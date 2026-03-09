function NotificationBadge() {
  return (
    <div className="bg-[rgba(255,255,255,0.72)] content-stretch flex flex-col items-center justify-center min-w-[16px] px-[4px] relative rounded-[10px] shrink-0" data-name="Notification Badge">
      <p className="font-['Chess_Sans:Bold',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#45753c] text-[12px] text-center tracking-[0.6px] uppercase">32</p>
    </div>
  );
}

export default function BadgeFrame() {
  return (
    <div className="content-stretch flex flex-col items-start pl-[2px] relative size-full" data-name="Badge Frame">
      <NotificationBadge />
    </div>
  );
}