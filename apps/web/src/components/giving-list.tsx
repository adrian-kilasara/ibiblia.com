"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import type { GivingOption } from "@ibiblia/types";

/**
 * Renders the giving/payment entries. Each number has a faint highlight and copies to the
 * clipboard on click, popping a "Thank you for spreading the gospel" bubble that fades away.
 * The bubble is visible by default and fades via a state-driven transition (so it always shows,
 * even under reduced-motion where keyframe animations collapse).
 */
export function GivingList({ options }: { options: GivingOption[] }) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [fading, setFading] = React.useState(false);
  const timers = React.useRef<Array<ReturnType<typeof setTimeout>>>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  async function copy(option: GivingOption) {
    try {
      await navigator.clipboard.writeText(option.value);
    } catch {
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
    clearTimers();
    setCopiedId(option.id);
    setFading(false);
    timers.current.push(setTimeout(() => setFading(true), 1600)); // start the slow fade
    timers.current.push(setTimeout(() => setCopiedId(null), 2500)); // remove after it fades
  }

  React.useEffect(() => clearTimers, []);

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

              {/* "Thank you" bubble — visible immediately, then fades out. */}
              {copied && (
                <span
                  role="status"
                  className="pointer-events-none absolute -top-3 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg"
                  style={{
                    opacity: fading ? 0 : 1,
                    transform: `translateX(-50%) translateY(${fading ? "-118%" : "-100%"})`,
                    transition: "opacity 800ms ease, transform 800ms ease",
                  }}
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
