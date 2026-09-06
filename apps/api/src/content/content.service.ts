import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** Read access for the smaller, list-style content types + the homepage aggregate. */
@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  impactStats() {
    return this.prisma.impactStat.findMany({ orderBy: { order: "asc" } });
  }

  missionAreas() {
    return this.prisma.missionArea.findMany({ orderBy: { order: "asc" } });
  }

  missionArea(slug: string) {
    return this.prisma.missionArea.findUnique({ where: { slug } });
  }

  testimony(id: string) {
    return this.prisma.testimony.findUnique({ where: { id } });
  }

  testimonies() {
    return this.prisma.testimony.findMany({ orderBy: { order: "asc" } });
  }

  partners() {
    return this.prisma.partner.findMany({ orderBy: { order: "asc" } });
  }

  team() {
    return this.prisma.teamMember.findMany({ orderBy: { order: "asc" } });
  }

  media() {
    return this.prisma.mediaItem.findMany({ orderBy: { publishedAt: "desc" } });
  }

  languages() {
    return this.prisma.language.findMany({ orderBy: { name: "asc" } });
  }

  countries() {
    return this.prisma.country.findMany({ orderBy: { name: "asc" } });
  }

  page(slug: string) {
    return this.prisma.page.findFirst({ where: { slug, published: true } });
  }

  contactInfo() {
    return this.prisma.contactInfo.findFirst();
  }

  sectionBackgrounds() {
    return this.prisma.sectionBackground.findMany({ orderBy: { order: "asc" } });
  }

  /** Everything the homepage needs, in one round-trip. */
  async home() {
    const [impactStats, missionAreas, featuredProjects, testimonies, latestNews, publications] =
      await Promise.all([
        this.prisma.impactStat.findMany({ orderBy: { order: "asc" } }),
        this.prisma.missionArea.findMany({ orderBy: { order: "asc" } }),
        this.prisma.project.findMany({
          where: { featured: true },
          include: { language: true, country: true },
          orderBy: { updatedAt: "desc" },
          take: 3,
        }),
        this.prisma.testimony.findMany({ orderBy: { order: "asc" }, take: 6 }),
        this.prisma.newsPost.findMany({
          where: { published: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
        }),
        this.prisma.publication.findMany({
          where: { published: true, featured: true },
          include: { language: true },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);
    return { impactStats, missionAreas, featuredProjects, testimonies, latestNews, publications };
  }
}
