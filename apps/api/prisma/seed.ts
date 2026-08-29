/**
 * CLI seed — wipes content tables and repopulates them, and ensures the admin user.
 * Run with: pnpm --filter @ibiblia/api db:seed
 */
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/seed/seed.data";

const prisma = new PrismaClient();

seedDatabase(prisma, { reset: true })
  .then(() =>
    console.log("✔ Seed complete. Admin login: admin@ibiblia.com / changeme123 (change it!)")
  )
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
