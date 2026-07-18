"use client";

import { Button } from "@/components/ui/button";
import { useLead } from "./lead-provider";

/** Единый CTA-интент всего сайта: заявка на просчёт. */
export function LeadButton({
  topic,
  size = "lg",
  variant = "primary",
  className,
  children,
}: {
  topic?: string;
  size?: "md" | "lg";
  variant?: "primary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}) {
  const { openLead } = useLead();
  return (
    <Button size={size} variant={variant} className={className} onClick={() => openLead(topic)}>
      {children ?? "Получить просчёт"}
    </Button>
  );
}
