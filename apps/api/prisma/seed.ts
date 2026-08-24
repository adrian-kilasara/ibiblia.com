/**
 * Seed placeholder content so the site looks alive before real data lands.
 * Idempotent: clears and repopulates the content tables (leaves Donations/Submissions).
 *
 * NOTE: copy here is PLACEHOLDER. Replace About/Mission text and impact numbers with the
 * real foundational-document content once available.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Admin user (dev only) — change the password in production.
  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ibiblia.com" },
    update: {},
    create: {
      email: "admin@ibiblia.com",
      name: "iBiblia Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  // Wipe content tables for a clean, repeatable seed.
  await prisma.$transaction([
    prisma.project.deleteMany(),
    prisma.publication.deleteMany(),
    prisma.newsPost.deleteMany(),
    prisma.testimony.deleteMany(),
    prisma.missionArea.deleteMany(),
    prisma.impactStat.deleteMany(),
    prisma.mediaItem.deleteMany(),
    prisma.partner.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.language.deleteMany(),
    prisma.country.deleteMany(),
    prisma.page.deleteMany(),
  ]);

  // Languages & countries
  const [maa, swa, luo] = await Promise.all([
    prisma.language.create({ data: { name: "Maasai", code: "mas", region: "East Africa" } }),
    prisma.language.create({ data: { name: "Swahili", code: "swa", region: "East Africa" } }),
    prisma.language.create({ data: { name: "Luo", code: "luo", region: "East Africa" } }),
  ]);
  const [kenya, tanzania] = await Promise.all([
    prisma.country.create({ data: { name: "Kenya", code: "KE" } }),
    prisma.country.create({ data: { name: "Tanzania", code: "TZ" } }),
  ]);

  // Impact stats
  await prisma.impactStat.createMany({
    data: [
      { label: "Languages in Progress", value: 24, order: 1 },
      { label: "Bibles Distributed", value: 48000, suffix: "+", order: 2 },
      { label: "Christian Books Published", value: 130, order: 3 },
      { label: "Partner Churches", value: 310, order: 4 },
      { label: "Countries Reached", value: 17, order: 5 },
      { label: "Volunteers", value: 540, order: 6 },
    ],
  });

  // Mission areas
  await prisma.missionArea.createMany({
    data: [
      {
        key: "TRANSLATION",
        slug: "bible-translation",
        title: "Bible Translation",
        summary: "Helping unreached communities receive Scripture in their own language.",
        process: "Placeholder: linguistic survey, drafting, community checking, publishing.",
        impact: "Placeholder impact statement.",
        order: 1,
      },
      {
        key: "PUBLISHING",
        slug: "christian-publishing",
        title: "Christian Publishing",
        summary: "Publishing Bibles, study guides, children's books, and devotionals.",
        order: 2,
      },
      {
        key: "DIGITAL",
        slug: "digital-scripture",
        title: "Digital Scripture",
        summary: "Apps, podcasts, audiobooks, and eBooks for every device.",
        order: 3,
      },
      {
        key: "DISTRIBUTION",
        slug: "distribution",
        title: "Distribution",
        summary: "Reaching churches, schools, mission partners, and remote villages.",
        order: 4,
      },
      {
        key: "INNOVATION",
        slug: "innovation",
        title: "Innovation",
        summary: "Using technology to accelerate translation and access.",
        order: 5,
      },
    ],
  });

  // Projects — none seeded. Administrators add real translation projects via the CMS;
  // the public Projects page keeps its card/status/progress design for uploaded data.

  // Publications
  await prisma.publication.createMany({
    data: [
      {
        slug: "swahili-study-bible-book",
        title: "Swahili Study Bible",
        author: "iBiblia Publishing",
        languageId: swa.id,
        category: "BIBLE",
        formats: ["PRINT", "PDF"],
        description: "Placeholder description.",
        featured: true,
      },
      {
        slug: "walking-with-christ-devotional",
        title: "Walking with Christ — 40 Day Devotional",
        author: "Placeholder Author",
        languageId: swa.id,
        category: "DEVOTIONAL",
        formats: ["PDF", "EPUB"],
        featured: true,
      },
      {
        slug: "childrens-bible-stories",
        title: "Children's Bible Stories",
        category: "CHILDREN",
        formats: ["PRINT", "PDF"],
        featured: true,
      },
    ],
  });

  // Testimonies
  await prisma.testimony.createMany({
    data: [
      {
        name: "Placeholder Translator",
        role: "TRANSLATOR",
        quote: "Placeholder testimony from a translator on the field.",
        location: "Kenya",
        order: 1,
      },
      {
        name: "Placeholder Reader",
        role: "READER",
        quote: "Placeholder testimony from a first-time reader in their heart language.",
        location: "Tanzania",
        order: 2,
      },
      {
        name: "Placeholder Pastor",
        role: "PASTOR",
        quote: "Placeholder testimony from a partner pastor.",
        location: "Kenya",
        order: 3,
      },
    ],
  });

  // News — none seeded. Administrators publish real updates via the CMS; the public News
  // page keeps its card/list design for uploaded articles.

  // Team & partners
  await prisma.teamMember.createMany({
    data: [
      { name: "Placeholder Name", role: "Executive Director", order: 1 },
      { name: "Placeholder Name", role: "Head of Translation", order: 2 },
      { name: "Placeholder Name", role: "Head of Publishing", order: 3 },
    ],
  });
  await prisma.partner.createMany({
    data: [
      { name: "Partner Organization A", order: 1 },
      { name: "Partner Organization B", order: 2 },
      { name: "Partner Organization C", order: 3 },
    ],
  });

  // About page (placeholder blocks — replace with foundational document content)
  const aboutBlocks: Prisma.InputJsonValue = [
    { type: "heading", text: "About iBiblia" },
    {
      type: "paragraph",
      text: "PLACEHOLDER: Replace with the foundational document — history, why iBiblia, the meaning of the name, vision, mission, and core values.",
    },
  ];
  await prisma.page.create({
    data: {
      slug: "about",
      title: "About iBiblia",
      blocks: aboutBlocks,
      published: true,
      seoTitle: "About iBiblia",
      seoDescription: "Who we are and why we exist.",
    },
  });

  // Donate page — invitation + admin-editable bank/transfer details (Body field).
  await prisma.page.create({
    data: {
      slug: "donate",
      title: "Partner with us in reaching every language",
      published: true,
      seoDescription:
        "Your generosity helps translate, publish, and distribute the Word of God so that no community remains unreached. Every gift moves Scripture closer to a language still waiting.",
      body: `PLACEHOLDER — replace with real transfer details in the CMS (Pages → donate → Body).

Account Name: iBiblia
Bank: [Bank name]
Account Number: [Account number]
Branch: [Branch]
SWIFT / Reference: [Code]

For mobile money or other methods, contact us via the Contact page.`,
    },
  });

  // Contact info (single editable row for the Contact page + embedded map).
  await prisma.contactInfo.deleteMany();
  await prisma.contactInfo.create({
    data: {
      address: "iBiblia (placeholder address — edit in the CMS)",
      email: "hello@ibiblia.com",
      phone: "+000 000 0000",
      hours: "Mon–Fri, 9:00–17:00",
      mapQuery: "Nairobi, Kenya",
      mapEmbedUrl: "",
    },
  });

  console.log("✔ Seed complete. Admin login: admin@ibiblia.com / changeme123 (dev only)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
