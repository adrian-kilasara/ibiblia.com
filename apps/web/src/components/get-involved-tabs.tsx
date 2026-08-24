"use client";

import * as React from "react";
import { cn } from "@ibiblia/ui";
import { InquiryForm } from "./inquiry-form";
import type { SubmissionType } from "@/lib/forms";

const TABS: { type: SubmissionType; label: string; blurb: string; messageLabel: string }[] = [
  {
    type: "VOLUNTEER",
    label: "Volunteer",
    blurb: "Translators, editors, designers, and prayer partners — there's a place for your gifts.",
    messageLabel: "Tell us about your skills and availability",
  },
  {
    type: "PARTNER",
    label: "Partner",
    blurb: "Churches and organizations joining the mission together.",
    messageLabel: "Tell us about your organization",
  },
  {
    type: "PRAYER",
    label: "Prayer",
    blurb: "Share a prayer request or commit to praying for the work.",
    messageLabel: "Your prayer request",
  },
];

export function GetInvolvedTabs() {
  const [active, setActive] = React.useState(0);
  const tab = TABS[active]!;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button
            key={t.type}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
              i === active
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-6 max-w-xl text-muted-foreground">{tab.blurb}</p>

      <div className="mt-6 max-w-2xl">
        <InquiryForm
          key={tab.type}
          type={tab.type}
          withPhone={tab.type !== "PRAYER"}
          messageLabel={tab.messageLabel}
          submitLabel="Submit"
        />
      </div>
    </div>
  );
}
