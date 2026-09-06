"use client";

import * as React from "react";
import { BellPlus, Check, Newspaper, MessageCircleReply } from "lucide-react";
import { Button } from "@ibiblia/ui";
import { subscribe } from "@/lib/forms";

const inputCls =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SubscribeSection() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await subscribe({ email, name: name || undefined });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
        {status === "done" ? (
          <div className="text-center">
            <span className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-7" />
            </span>
            <h2 className="font-heading text-2xl font-semibold">You&apos;re subscribed!</h2>
            <p className="mt-2 text-muted-foreground">
              Welcome to the iBiblia family. Watch your inbox — we&apos;ll keep you posted.
            </p>
          </div>
        ) : (
          <>
            <span className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BellPlus className="size-6" />
            </span>
            <h2 className="font-heading text-2xl font-semibold">Subscribe to the mission</h2>
            <p className="mt-2 text-muted-foreground">
              Add your name and email to join. You&apos;ll get news updates, and when you ask a
              question we can email you the answer.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              {status === "error" && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={status === "loading"}>
                <BellPlus className="size-5" />
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Benefits */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface/60 p-4">
          <Newspaper className="mt-0.5 size-5 shrink-0 text-gold" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">News updates</span> — get an email whenever
            we publish a new story from the field.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-border bg-surface/60 p-4">
          <MessageCircleReply className="mt-0.5 size-5 shrink-0 text-gold" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Answered questions</span> — ask us anything
            and, as a subscriber, we&apos;ll email you the answer.
          </p>
        </div>
      </div>
    </div>
  );
}
