import { cn } from "@/lib/utils";

export function Section({
  children,
  tone = "base",
  className,
  id,
}: {
  children: React.ReactNode;
  tone?: "base" | "alt";
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn(tone === "alt" && "bg-bg2", className)}>
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 md:py-28">{children}</div>
    </section>
  );
}

export function SectionHeading({
  title,
  lead,
  className,
}: {
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      <h2 className="font-display max-w-[24ch] text-3xl leading-[1.15] font-medium tracking-tight md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {lead ? <p className="mt-5 max-w-[58ch] text-lg text-mute">{lead}</p> : null}
    </div>
  );
}
