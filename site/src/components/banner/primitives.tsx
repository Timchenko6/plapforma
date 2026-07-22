import { Drop, Flame, Lightning, Wind } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const icons = { drop: Drop, flame: Flame, bolt: Lightning, wind: Wind };

export function DirIcon({
  name,
  size = 28,
  color,
}: {
  name: keyof typeof icons;
  size?: number;
  color?: string;
}) {
  const Icon = icons[name];
  return <Icon size={size} weight="regular" color={color} aria-hidden />;
}

/** Карточка-бейдж с баннера: прозрачный фон, лаймовая рамка, иконка + текст (tz-site §2.4). */
export function BadgePill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-plex text-xs tracking-[0.14em] uppercase",
        className,
      )}
      style={{ borderColor: "var(--lime)", color: "var(--lime-bright)" }}
    >
      {children}
    </span>
  );
}

/** Микро-лейбл в духе баннера: uppercase, широкий трекинг, часто с лаймовой второй строкой. */
export function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-plex text-xs tracking-[0.18em] text-mute uppercase">{children}</p>
  );
}

/** Лаймовый хайрлайн-разделитель секций. */
export function SectionDivider() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
      <div className="lime-hairline" />
    </div>
  );
}
