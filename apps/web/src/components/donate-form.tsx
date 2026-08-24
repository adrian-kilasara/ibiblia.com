"use client";

import * as React from "react";
import { cn, Button } from "@ibiblia/ui";
import type { DonationDesignation, DonationInterval } from "@ibiblia/types";

const PRESETS = [25, 50, 100, 250];

const DESIGNATIONS: { value: DonationDesignation; label: string }[] = [
  { value: "TRANSLATION", label: "Translation" },
  { value: "PUBLISHING", label: "Publishing" },
  { value: "DISTRIBUTION", label: "Distribution" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "GENERAL", label: "Where needed most" },
];

export function DonateForm({ defaultDesignation }: { defaultDesignation?: DonationDesignation }) {
  const [interval, setInterval] = React.useState<DonationInterval>("ONE_TIME");
  const [amount, setAmount] = React.useState(50);
  const [custom, setCustom] = React.useState("");
  const [designation, setDesignation] = React.useState<DonationDesignation>(
    defaultDesignation ?? "GENERAL"
  );
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = React.useState("");

  const finalAmount = custom ? Math.max(0, Math.round(Number(custom))) : amount;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4400";
      const res = await fetch(`${API_URL}/api/donations/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount * 100,
          currency: "USD",
          interval,
          designation,
          provider: "STRIPE",
          donorEmail: email,
        }),
      });
      if (!res.ok) throw new Error("Payment processing is not yet available. Please check back soon.");
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
      else throw new Error("Could not start checkout.");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
      {/* interval */}
      <div className="inline-flex rounded-full bg-surface p-1">
        {(["ONE_TIME", "MONTHLY"] as DonationInterval[]).map((iv) => (
          <button
            key={iv}
            type="button"
            onClick={() => setInterval(iv)}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-semibold transition-colors",
              interval === iv ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {iv === "ONE_TIME" ? "One-time" : "Monthly"}
          </button>
        ))}
      </div>

      {/* amount */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {PRESETS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setAmount(v);
              setCustom("");
            }}
            className={cn(
              "rounded-lg border py-3 text-sm font-semibold transition-colors",
              !custom && amount === v
                ? "border-gold bg-gold/10 text-foreground"
                : "border-border hover:bg-surface"
            )}
          >
            ${v}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <div className="flex items-center rounded-lg border border-border px-3">
          <span className="text-muted-foreground">$</span>
          <input
            type="number"
            min={1}
            placeholder="Custom amount"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="h-11 w-full bg-transparent px-2 text-sm outline-none"
          />
        </div>
      </div>

      {/* designation */}
      <label className="mt-6 block text-sm font-medium">Designate your gift</label>
      <div className="mt-2 flex flex-wrap gap-2">
        {DESIGNATIONS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setDesignation(d.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              designation === d.value
                ? "bg-primary text-primary-foreground"
                : "bg-surface hover:bg-muted"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* email */}
      <label className="mt-6 block text-sm font-medium">Email for your receipt</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {status === "error" && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={status === "loading"}>
        {status === "loading"
          ? "Redirecting…"
          : `Give ${finalAmount ? `$${finalAmount}` : ""}${interval === "MONTHLY" ? " / month" : ""}`}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Secure payment via Stripe. You&apos;ll be redirected to complete your gift.
      </p>
    </form>
  );
}
