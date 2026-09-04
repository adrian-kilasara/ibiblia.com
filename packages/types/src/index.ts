/**
 * Shared domain types for iBiblia — used by the public site, the admin CMS, and mirrored
 * by the API. Keep these framework-agnostic (no Prisma or React imports).
 */

export type ID = string;

export type ProjectStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_FUNDING";

export type PublicationCategory =
  | "BIBLE"
  | "DEVOTIONAL"
  | "STUDY_GUIDE"
  | "CHILDREN"
  | "MAGAZINE"
  | "AUDIO"
  | "VIDEO";

export type PublicationFormat = "PDF" | "EPUB" | "AUDIO" | "PRINT" | "VIDEO";

export type MediaType = "VIDEO" | "PODCAST" | "AUDIO";

export type TestimonyRole = "MISSIONARY" | "TRANSLATOR" | "READER" | "PASTOR";

export type MissionAreaKey =
  | "TRANSLATION"
  | "PUBLISHING"
  | "DIGITAL"
  | "DISTRIBUTION"
  | "INNOVATION";

export type DonationDesignation =
  | "TRANSLATION"
  | "PUBLISHING"
  | "DISTRIBUTION"
  | "TECHNOLOGY"
  | "GENERAL";

export type DonationProvider = "STRIPE" | "PAYSTACK" | "FLUTTERWAVE";

export type DonationStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type DonationInterval = "ONE_TIME" | "MONTHLY";

export type SubmissionType =
  | "VOLUNTEER"
  | "PARTNER"
  | "CONTACT"
  | "PRAYER"
  | "NEWSLETTER";

export interface ImpactStat {
  id: ID;
  label: string;
  value: number;
  suffix?: string | null;
  order: number;
}

export interface Language {
  id: ID;
  name: string;
  code: string;
  region?: string | null;
}

export interface Country {
  id: ID;
  name: string;
  code: string;
}

/** A labelled external link (resource, PDF, article, apply page…). */
export interface LinkItem {
  label: string;
  url: string;
}

export interface Project {
  id: ID;
  slug: string;
  title: string;
  language?: Language | null;
  country?: Country | null;
  region?: string | null;
  status: ProjectStatus;
  progressPct: number;
  fundingNeeded?: number | null;
  fundingRaised?: number | null;
  team?: string | null;
  summary: string;
  body?: string | null;
  coverImageUrl?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  links?: LinkItem[];
  featured: boolean;
}

export interface Publication {
  id: ID;
  slug: string;
  title: string;
  author?: string | null;
  language?: Language | null;
  category: PublicationCategory;
  formats: PublicationFormat[];
  coverImageUrl?: string | null;
  description?: string | null;
  downloadUrl?: string | null;
  previewUrl?: string | null;
  price?: number | null;
  gallery?: string[];
  videoUrl?: string | null;
  links?: LinkItem[];
}

export interface Testimony {
  id: ID;
  name: string;
  role: TestimonyRole;
  quote: string;
  photoUrl?: string | null;
  location?: string | null;
}

export interface NewsPost {
  id: ID;
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  coverImageUrl?: string | null;
  category?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  links?: LinkItem[];
  publishedAt: string;
}

export interface MissionAreaLink {
  label: string;
  url: string;
}

export interface MissionArea {
  id: ID;
  key: MissionAreaKey;
  slug: string;
  title: string;
  summary: string;
  process?: string | null;
  impact?: string | null;
  images?: string[];
  links?: MissionAreaLink[];
}

export interface Donation {
  id: ID;
  amount: number;
  currency: string;
  provider: DonationProvider;
  status: DonationStatus;
  interval: DonationInterval;
  designation: DonationDesignation;
  donorName?: string | null;
  donorEmail?: string | null;
  createdAt: string;
}

export interface DonationRequest {
  amount: number;
  currency: string;
  interval: DonationInterval;
  designation: DonationDesignation;
  provider: DonationProvider;
  donorName?: string;
  donorEmail: string;
}
