export interface ResourceConfig {
  /** PrismaService delegate property name, e.g. "project". */
  delegate: string;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  include?: Record<string, boolean>;
  /** Read-only resources (donations, submissions) reject create/update/delete. */
  readOnly?: boolean;
}

/** Maps a URL resource slug to a Prisma model. The admin UI drives CRUD through these. */
export const RESOURCES: Record<string, ResourceConfig> = {
  "impact-stats": { delegate: "impactStat", orderBy: { order: "asc" } },
  "mission-areas": { delegate: "missionArea", orderBy: { order: "asc" } },
  projects: {
    delegate: "project",
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: { language: true, country: true },
  },
  publications: {
    delegate: "publication",
    orderBy: { createdAt: "desc" },
    include: { language: true },
  },
  news: { delegate: "newsPost", orderBy: { publishedAt: "desc" } },
  testimonies: { delegate: "testimony", orderBy: { order: "asc" } },
  media: { delegate: "mediaItem", orderBy: { publishedAt: "desc" } },
  partners: { delegate: "partner", orderBy: { order: "asc" } },
  team: { delegate: "teamMember", orderBy: { order: "asc" } },
  languages: { delegate: "language", orderBy: { name: "asc" } },
  countries: { delegate: "country", orderBy: { name: "asc" } },
  events: { delegate: "event", orderBy: { startsAt: "asc" } },
  careers: { delegate: "career", orderBy: { createdAt: "desc" } },
  gallery: { delegate: "galleryImage", orderBy: { order: "asc" } },
  pages: { delegate: "page", orderBy: { updatedAt: "desc" } },
  "contact-info": { delegate: "contactInfo", orderBy: { updatedAt: "desc" } },
  "section-backgrounds": { delegate: "sectionBackground", orderBy: { order: "asc" } },
  "giving-options": { delegate: "givingOption", orderBy: { order: "asc" } },
  donations: { delegate: "donation", orderBy: { createdAt: "desc" }, readOnly: true },
  submissions: { delegate: "submission", orderBy: { createdAt: "desc" } },
  subscribers: { delegate: "subscriber", orderBy: { createdAt: "desc" } },
  questions: { delegate: "question", orderBy: { createdAt: "desc" } },
};

export type ResourceSlug = keyof typeof RESOURCES;
