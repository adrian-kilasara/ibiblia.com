"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@ibiblia/ui";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "BIBLE", label: "Bibles" },
  { value: "DEVOTIONAL", label: "Devotionals" },
  { value: "STUDY_GUIDE", label: "Study Guides" },
  { value: "CHILDREN", label: "Children" },
  { value: "MAGAZINE", label: "Magazines" },
  { value: "AUDIO", label: "Audio" },
  { value: "VIDEO", label: "Video" },
];

export function PublicationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category") ?? "";

  function setCategory(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("category", value);
    else next.delete("category");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-6">
      {CATEGORIES.map((c) => (
        <button
          key={c.value}
          onClick={() => setCategory(c.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            category === c.value
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-foreground hover:bg-muted"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
