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
      { key: "hero", label: "Hero (top banner)", order: 0 },
      { key: "impact", label: "Impact numbers", order: 1 },
      { key: "mission", label: "Mission areas", order: 2 },
      { key: "preamble", label: "Preamble", order: 3 },
      { key: "projects", label: "Featured projects", order: 4 },
      { key: "publications", label: "Publications", order: 5 },
      { key: "testimonies", label: "Testimonies", order: 6 },
      { key: "getInvolved", label: "Get involved", order: 7 },
      { key: "news", label: "Latest news", order: 8 },
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
