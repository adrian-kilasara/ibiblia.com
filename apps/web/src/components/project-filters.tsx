"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Language, Country } from "@ibiblia/types";
import { cn } from "@ibiblia/ui";

const STATUSES = [
  { value: "", label: "All" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "NEEDS_FUNDING", label: "Needs Funding" },
  { value: "UPCOMING", label: "Upcoming" },
];

export function ProjectFilters({
  languages,
  countries,
}: {
  languages: Language[];
  countries: Country[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const languageId = params.get("languageId") ?? "";
  const countryId = params.get("countryId") ?? "";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setParam("status", s.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              status === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-foreground hover:bg-muted"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          value={languageId}
          onChange={(e) => setParam("languageId", e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All languages</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select
          value={countryId}
          onChange={(e) => setParam("countryId", e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
