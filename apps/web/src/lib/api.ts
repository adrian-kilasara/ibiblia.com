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
} from "@ibiblia/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4400";

/** Revalidate cached content every 60s (ISR). Admin edits appear within a minute. */
const REVALIDATE = 60;

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL}/api${path}`, { next: { revalidate: REVALIDATE } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    // API unreachable at build/runtime — degrade gracefully rather than crash the page.
    return fallback;
  }
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
    } | null>("/contact-info", null),
};

/** Format integer cents as currency. */
export function formatMoney(cents?: number | null, currency = "USD"): string {
  if (cents == null) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
