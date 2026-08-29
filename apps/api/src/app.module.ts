import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";
import { ContentModule } from "./content/content.module";
import { ProjectsModule } from "./projects/projects.module";
import { PublicationsModule } from "./publications/publications.module";
import { NewsModule } from "./news/news.module";
import { AuthModule } from "./auth/auth.module";
import { AdminModule } from "./admin/admin.module";
import { SubmissionsModule } from "./submissions/submissions.module";
import { DonationsModule } from "./donations/donations.module";
import { StorageModule } from "./storage/storage.module";
import { SeedService } from "./seed/seed.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    AdminModule,
    ContentModule,
    ProjectsModule,
    PublicationsModule,
    NewsModule,
    SubmissionsModule,
    DonationsModule,
  ],
  controllers: [HealthController],
  providers: [SeedService],
})
export class AppModule {}
