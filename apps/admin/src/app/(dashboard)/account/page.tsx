"use client";

import * as React from "react";
import { Button } from "@ibiblia/ui";
import { api, ApiError } from "@/lib/api";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/lib/auth";

export default function AccountPage() {
  const { user } = useAuth();
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("New passwords do not match.");
    setStatus("saving");
    try {
      await api.changePassword(current, next);
      setStatus("done");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError ? err.message : "Could not change the password.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email}</p>

      <div className="mt-8 max-w-md rounded-lg border border-border bg-card p-6">
        <h2 className="font-heading text-lg font-semibold">Change password</h2>

        {status === "done" ? (
          <p className="mt-4 rounded-md bg-primary/10 px-4 py-3 text-sm text-primary">
            Password changed. Use your new password next time you sign in.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Current password</label>
              <PasswordInput value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New password</label>
              <PasswordInput value={next} onChange={(e) => setNext(e.target.value)} required />
              <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm new password</label>
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" variant="navy" disabled={status === "saving"}>
              {status === "saving" ? "Saving…" : "Change password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
