import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { seedDatabase } from "./seed.data";

/**
 * Seeds the database automatically the first time the API boots against an empty database
 * (fresh deploy). If any user already exists, it does nothing — so it's safe on every restart.
 * Disable by setting AUTO_SEED=false.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.AUTO_SEED === "false") return;
    try {
      const users = await this.prisma.user.count();
      if (users === 0) {
        this.logger.log("Empty database detected — seeding starter content + admin user…");
        await seedDatabase(this.prisma, { reset: false });
        this.logger.log("Seed complete. Admin login: admin@ibiblia.com / changeme123 (change it!)");
      }
      // Always ensure the homepage section-background rows exist (idempotent), so both fresh
      // and already-seeded databases get them without wiping any images already uploaded.
      await this.ensureSectionBackgrounds();
    } catch (err) {
      this.logger.error(`Auto-seed skipped: ${(err as Error).message}`);
    }
  }

  private async ensureSectionBackgrounds(): Promise<void> {
    const sections = [
      // ── Homepage sections ──
      { key: "hero", label: "Home · Hero (top banner)", order: 0 },
      { key: "impact", label: "Home · Impact numbers", order: 1 },
      { key: "mission", label: "Home · Mission areas", order: 2 },
      { key: "preamble", label: "Home · Preamble", order: 3 },
      { key: "projects", label: "Home · Featured projects", order: 4 },
      { key: "publications", label: "Home · Publications", order: 5 },
      { key: "testimonies", label: "Home · Testimonies", order: 6 },
      { key: "getInvolved", label: "Home · Get involved", order: 7 },
      { key: "news", label: "Home · Latest news", order: 8 },
      // ── Inner pages (each: header banner + body). Detail pages reuse the listing keys. ──
      { key: "about:header", label: "About · Header", order: 10 },
      { key: "about:body", label: "About · Body", order: 11 },
      { key: "mission:header", label: "Mission page · Header", order: 12 },
      { key: "mission:body", label: "Mission page · Body", order: 13 },
      { key: "projects:header", label: "Projects page · Header", order: 14 },
      { key: "projects:body", label: "Projects page · Body", order: 15 },
      { key: "publications:header", label: "Publications page · Header", order: 16 },
      { key: "publications:body", label: "Publications page · Body", order: 17 },
      { key: "news:header", label: "News page · Header", order: 18 },
      { key: "news:body", label: "News page · Body", order: 19 },
      { key: "getinvolved:header", label: "Get Involved page · Header", order: 20 },
      { key: "getinvolved:body", label: "Get Involved page · Body", order: 21 },
      { key: "donate:header", label: "Donate page · Header", order: 22 },
      { key: "donate:body", label: "Donate page · Body", order: 23 },
      { key: "contact:header", label: "Contact page · Header", order: 24 },
      { key: "contact:body", label: "Contact page · Body", order: 25 },
      { key: "media:header", label: "Media page · Header", order: 26 },
      { key: "media:body", label: "Media page · Body", order: 27 },
    ];
    for (const s of sections) {
      await this.prisma.sectionBackground.upsert({
        where: { key: s.key },
        create: s,
        update: { label: s.label, order: s.order }, // keep any imageUrl already set
      });
    }
  }
}
