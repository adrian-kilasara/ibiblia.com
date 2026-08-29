import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seeds the database with the admin user + starter content.
 * - `reset: true` (CLI) wipes content tables first for a clean repeatable seed.
 * - `reset: false` (auto-seed on first boot) assumes empty tables and only creates.
 *
 * The admin credentials come from ADMIN_EMAIL / ADMIN_PASSWORD when set, else safe defaults.
 */
export async function seedDatabase(
  prisma: PrismaClient,
  opts: { reset?: boolean } = {}
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ibiblia.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: "iBiblia Admin", role: "ADMIN", passwordHash },
  });

  if (opts.reset) {
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
      prisma.contactInfo.deleteMany(),
    ]);
  }

  const swa = await prisma.language.create({
    data: { name: "Swahili", code: "swa", region: "East Africa" },
  });
  await prisma.language.createMany({
    data: [
      { name: "Maasai", code: "mas", region: "East Africa" },
      { name: "Luo", code: "luo", region: "East Africa" },
    ],
  });
  await prisma.country.createMany({
    data: [
      { name: "Kenya", code: "KE" },
      { name: "Tanzania", code: "TZ" },
    ],
  });

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

  await prisma.missionArea.createMany({
    data: [
      {
        key: "TRANSLATION",
        slug: "bible-translation",
        title: "Bible Translation",
        summary: "Helping unreached communities receive Scripture in their own language.",
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

  await prisma.publication.createMany({
    data: [
      {
        slug: "swahili-study-bible-book",
        title: "Swahili Study Bible",
        author: "iBiblia Publishing",
        languageId: swa.id,
        category: "BIBLE",
        formats: ["PRINT", "PDF"],
        featured: true,
      },
      {
        slug: "walking-with-christ-devotional",
        title: "Walking with Christ — 40 Day Devotional",
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

  const aboutBlocks: Prisma.InputJsonValue = [
    { type: "heading", text: "About iBiblia" },
    {
      type: "paragraph",
      text: "PLACEHOLDER: Replace with the foundational document content in the CMS.",
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
  await prisma.page.create({
    data: {
      slug: "donate",
      title: "Partner with us in reaching every language",
      published: true,
      seoDescription:
        "Your generosity helps translate, publish, and distribute the Word of God so that no community remains unreached.",
      body: `PLACEHOLDER — replace with real transfer details in the CMS (Pages → donate → Body).

Account Name: iBiblia
Bank: [Bank name]
Account Number: [Account number]
Branch: [Branch]
SWIFT / Reference: [Code]

For mobile money or other methods, contact us via the Contact page.`,
    },
  });

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
}
