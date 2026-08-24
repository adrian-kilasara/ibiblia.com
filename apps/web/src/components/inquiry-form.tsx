"use client";

import * as React from "react";
import { Button } from "@ibiblia/ui";
import { postSubmission, type SubmissionType } from "@/lib/forms";

interface Props {
  type: SubmissionType;
  withPhone?: boolean;
  withSubject?: boolean;
  messageLabel?: string;
  submitLabel?: string;
}

const inputCls =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InquiryForm({
  type,
  withPhone,
  withSubject,
  messageLabel = "Message",
  submitLabel = "Send",
}: Props) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("loading");
    setError("");
    try {
      await postSubmission({
        type,
        name: (form.get("name") as string) || undefined,
        email: (form.get("email") as string) || undefined,
        phone: (form.get("phone") as string) || undefined,
        subject: (form.get("subject") as string) || undefined,
        message: (form.get("message") as string) || undefined,
      });
      setStatus("done");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 text-center">
        <p className="font-heading text-lg font-semibold">Thank you</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve received your message and will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input name="name" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input name="email" type="email" required className={inputCls} />
        </div>
      </div>
      {withPhone && (
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input name="phone" className={inputCls} />
        </div>
      )}
      {withSubject && (
        <div>
          <label className="mb-1 block text-sm font-medium">Subject</label>
          <input name="subject" className={inputCls} />
        </div>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">{messageLabel}</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      {status === "error" && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" variant="navy" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
