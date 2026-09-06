"use client";

import * as React from "react";
import { Button } from "@ibiblia/ui";
import { askQuestion } from "@/lib/forms";

const inputCls =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function QuestionForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sub, setSub] = React.useState(true);
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await askQuestion({ name: name || undefined, email, message, subscribe: sub });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
        <p className="font-heading text-lg font-semibold">Thank you — we&apos;ve received it.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {sub
            ? "You're subscribed, so we'll email you the answer and keep you posted on updates."
            : "To receive our answer by email you'll need to subscribe. Otherwise, feel free to reach us directly using the contact options."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Your question or comment</label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={sub}
          onChange={(e) => setSub(e.target.checked)}
          className="mt-0.5 size-4 accent-[hsl(var(--primary))]"
        />
        <span className="text-muted-foreground">
          Email me the answer and subscribe me to updates.{" "}
          <span className="text-foreground">Answers are sent to subscribers only</span> — otherwise please use
          the contact options to reach us.
        </span>
      </label>

      {status === "error" && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="primary" size="lg" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
