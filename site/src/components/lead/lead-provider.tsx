"use client";

import { createContext, useCallback, useContext, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react/dist/ssr";
import { LeadForm } from "./lead-form";

type LeadContextValue = { openLead: (topic?: string) => void };

const LeadContext = createContext<LeadContextValue>({ openLead: () => {} });

export function useLead() {
  return useContext(LeadContext);
}

/** Модалка заявки доступна с любой страницы (design-direction.md §4). */
export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState<string | undefined>();

  const openLead = useCallback((t?: string) => {
    setTopic(t);
    setOpen(true);
  }, []);

  return (
    <LeadContext.Provider value={{ openLead }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[min(94vw,480px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-line bg-bg2 p-6 shadow-[0_24px_64px_rgb(0_0_0/0.5)] sm:p-8"
            aria-describedby={undefined}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <Dialog.Title className="font-display text-xl leading-snug font-medium">
                Заявка на просчёт
              </Dialog.Title>
              <Dialog.Close
                className="cursor-pointer rounded-sm p-2 text-mute transition-colors hover:text-ink"
                aria-label="Закрыть"
              >
                <X size={20} aria-hidden />
              </Dialog.Close>
            </div>
            {open ? <LeadForm defaultTopic={topic} idPrefix="lead-modal" /> : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </LeadContext.Provider>
  );
}
