/**
 * Server-side data layer for the public site. Fetches from the NestJS API with ISR caching.
 * All functions are safe to call from React Server Components.
 */
import type {
  ImpactStat,
  Language,
  Country,
  MissionArea,
  Project,
  Publication,
  Testimony,
  NewsPost,
  SectionBackground,
  GivingOption,
} from "@ibiblia/types";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4400";
// Accept a bare host (e.g. from Render's auto-wiring) and normalize to a full URL.
const API_URL = /^https?:\/\//.test(RAW_API_URL) ? RAW_API_URL : `https://${RAW_API_URL}`;

/** Revalidate cached content every 60s (ISR). Admin edits appear within a minute. */
const REVALIDATE = 60;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get<T>(path: string, fallback: T): Promise<T> {
  // Retry through a sleeping free-tier API's 502/503 "waking up" window before giving up.
  const maxAttempts = 6;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api${path}`, { next: { revalidate: REVALIDATE } });
      if ([502, 503, 504].includes(res.status) && attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      if (!res.ok) return fallback;
      return (await res.json()) as T;
    } catch {
      if (attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      // Still unreachable — degrade gracefully rather than crash the page.
      return fallback;
    }
  }
  return fallback;
}

export interface HomeData {
  impactStats: ImpactStat[];
  missionAreas: MissionArea[];
  featuredProjects: Project[];
  testimonies: Testimony[];
  latestNews: NewsPost[];
  publications: Publication[];
}

export const site = {
  home: () =>
    get<HomeData>("/site/home", {
      impactStats: [],
      missionAreas: [],
      featuredProjects: [],
      testimonies: [],
      latestNews: [],
      publications: [],
    }),
  impactStats: () => get<ImpactStat[]>("/impact-stats", []),
  missionAreas: () => get<MissionArea[]>("/mission-areas", []),
  missionArea: (slug: string) => get<MissionArea | null>(`/mission-areas/${slug}`, null),
  projects: (query = "") => get<Project[]>(`/projects${query}`, []),
  project: (slug: string) => get<Project | null>(`/projects/${slug}`, null),
  publications: (query = "") => get<Publication[]>(`/publications${query}`, []),
  publication: (slug: string) => get<Publication | null>(`/publications/${slug}`, null),
  news: (limit?: number) => get<NewsPost[]>(`/news${limit ? `?limit=${limit}` : ""}`, []),
  newsPost: (slug: string) => get<NewsPost | null>(`/news/${slug}`, null),
  testimonies: () => get<Testimony[]>("/testimonies", []),
  testimony: (id: string) => get<Testimony | null>(`/testimonies/${id}`, null),
  sectionBackgrounds: () => get<SectionBackground[]>("/section-backgrounds", []),
  givingOptions: () => get<GivingOption[]>("/giving-options", []),
  team: () => get<Array<{ id: string; name: string; role: string; bio?: string; photoUrl?: string }>>("/team", []),
  partners: () => get<Array<{ id: string; name: string; logoUrl?: string; url?: string }>>("/partners", []),
  media: () =>
    get<Array<{ id: string; type: string; title: string; url: string; thumbnailUrl?: string }>>(
      "/media",
      []
    ),
  languages: () => get<Language[]>("/languages", []),
  countries: () => get<Country[]>("/countries", []),
  page: (slug: string) =>
    get<{
      title: string;
      body?: string | null;
      blocks: unknown;
      seoTitle?: string;
      seoDescription?: string;
    } | null>(`/pages/${slug}`, null),
  contactInfo: () =>
    get<{
      address?: string | null;
      email?: string | null;
      phone?: string | null;
      hours?: string | null;
      mapQuery?: string | null;
      mapEmbedUrl?: string | null;
      whatsapp?: string | null;
      x?: string | null;
      instagram?: string | null;
      facebook?: string | null;
      threads?: string | null;
    } | null>("/contact-info", null),
};

/** Format integer cents as currency. */
export function formatMoney(cents?: number | null, currency = "USD"): string {
  if (cents == null) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
