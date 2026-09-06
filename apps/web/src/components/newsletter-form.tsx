"use client";

import * as React from "react";
import { Button } from "@ibiblia/ui";
import { subscribe } from "@/lib/forms";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await subscribe({ email });
      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (status === "done") {
    return <p className="text-sm text-navy-foreground/80">Thank you — you&apos;re subscribed.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="h-11 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-navy-foreground outline-none placeholder:text-navy-foreground/50 focus-visible:ring-2 focus-visible:ring-gold"
      />
      <Button type="submit" variant="primary" disabled={status === "loading"}>
        {status === "loading" ? "…" : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-red-300 sm:absolute sm:mt-12">{error}</p>
      )}
    </form>
  );
}
