import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  console.log("Testing database connection...\n");

  // Test connection with a simple query
  const tableNames = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;

  console.log("Connected! Tables found:");
  tableNames.forEach((t) => console.log(`  - ${t.tablename}`));

  // Row counts
  const [userCount, itemTypeCount, itemCount, collectionCount, tagCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.itemType.count(),
      prisma.item.count(),
      prisma.collection.count(),
      prisma.tag.count(),
    ]);

  console.log("\nRow counts:");
  console.log(`  users:       ${userCount}`);
  console.log(`  item_types:  ${itemTypeCount}`);
  console.log(`  items:       ${itemCount}`);
  console.log(`  collections: ${collectionCount}`);
  console.log(`  tags:        ${tagCount}`);

  // Demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@rongeka.io" },
    select: { id: true, name: true, email: true, isPro: true, emailVerified: true },
  });

  if (demoUser) {
    console.log("\nDemo user:");
    console.log(`  name:          ${demoUser.name}`);
    console.log(`  email:         ${demoUser.email}`);
    console.log(`  isPro:         ${demoUser.isPro}`);
    console.log(`  emailVerified: ${demoUser.emailVerified}`);
  }

  // System item types
  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
    select: { name: true, icon: true, color: true },
  });

  console.log("\nSystem item types:");
  systemTypes.forEach((t) =>
    console.log(`  ${t.name.padEnd(8)} icon=${t.icon.padEnd(12)} color=${t.color}`)
  );

  // Collections with item counts
  const collections = await prisma.collection.findMany({
    where: { user: { email: "demo@rongeka.io" } },
    orderBy: { name: "asc" },
    include: { _count: { select: { itemCollections: true } } },
  });

  console.log("\nCollections:");
  collections.forEach((c) =>
    console.log(`  ${c.name.padEnd(22)} items=${c._count.itemCollections} favorite=${c.isFavorite}`)
  );

  // All items with type
  const items = await prisma.item.findMany({
    where: { user: { email: "demo@rongeka.io" } },
    orderBy: { createdAt: "asc" },
    include: { itemType: { select: { name: true } }, tags: { select: { name: true } } },
  });

  console.log("\nItems:");
  items.forEach((item) => {
    const tags = item.tags.map((t) => `#${t.name}`).join(" ");
    console.log(
      `  [${item.itemType.name.padEnd(8)}] ${item.title.padEnd(45)} ${tags}`
    );
  });

  console.log("\nDatabase is healthy.");
}

main()
  .catch((err) => {
    console.error("Database test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
