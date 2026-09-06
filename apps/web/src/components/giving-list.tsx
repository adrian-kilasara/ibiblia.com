"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import type { GivingOption } from "@ibiblia/types";

/**
 * Renders the giving/payment entries. Each number has a faint highlight and copies to the
 * clipboard on click, popping a "Thank you for spreading the gospel" bubble that fades away.
 */
export function GivingList({ options }: { options: GivingOption[] }) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy(option: GivingOption) {
    try {
      await navigator.clipboard.writeText(option.value);
    } catch {
      // Fallback for browsers without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = option.value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    setCopiedId(option.id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopiedId(null), 2400);
  }

  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  if (options.length === 0) {
    return (
      <p className="rounded-lg bg-surface p-6 text-center text-sm text-muted-foreground">
        Giving details will appear here soon.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((o) => {
        const copied = copiedId === o.id;
        return (
          <div key={o.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-eyebrow">{o.label}</p>
            {o.name && <p className="mt-1 font-heading text-lg font-semibold">{o.name}</p>}

            <div className="relative mt-3">
              <button
                type="button"
                onClick={() => copy(o)}
                aria-label={`Copy ${o.label} number ${o.value}`}
                className="group flex w-full items-center justify-between gap-3 rounded-lg bg-gold/10 px-4 py-3 text-left ring-1 ring-inset ring-gold/25 transition-colors hover:bg-gold/20"
              >
                <span className="select-all font-mono text-base font-semibold tracking-wide text-foreground sm:text-lg">
                  {o.value}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-eyebrow">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>

              {/* Fading "thank you" bubble */}
              {copied && (
                <span
                  role="status"
                  className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2 -translate-y-full animate-giftpop whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg"
                >
                  Thank you for spreading the gospel
                  <span className="absolute left-1/2 top-full -ml-1.5 border-x-[6px] border-t-[6px] border-x-transparent border-t-primary" />
                </span>
              )}
            </div>

            {o.note && <p className="mt-2 text-sm text-muted-foreground">{o.note}</p>}
          </div>
        );
      })}
    </div>
  );
}
