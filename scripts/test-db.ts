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

  // Test each model
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

  console.log("\nDatabase is healthy.");
}

main()
  .catch((err) => {
    console.error("Database test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
