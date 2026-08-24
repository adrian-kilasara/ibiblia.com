"use client";

import * as React from "react";
import { Button } from "@ibiblia/ui";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/input";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("admin@ibiblia.com");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border border-border bg-card p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <p className="font-heading text-2xl font-bold text-primary">iBiblia</p>
          <p className="mt-1 text-sm text-muted-foreground">Content Management</p>
        </div>

        <label className="mb-1 block text-sm font-medium">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="mb-1 mt-4 block text-sm font-medium">Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button type="submit" variant="navy" className="mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
