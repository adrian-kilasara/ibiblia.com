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
      if (users > 0) return; // already set up
      this.logger.log("Empty database detected — seeding starter content + admin user…");
      await seedDatabase(this.prisma, { reset: false });
      this.logger.log("Seed complete. Admin login: admin@ibiblia.com / changeme123 (change it!)");
    } catch (err) {
      this.logger.error(`Auto-seed skipped: ${(err as Error).message}`);
    }
  }
}
