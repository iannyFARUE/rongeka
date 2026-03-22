/**
 * Deletes all users and their content except demo@rongeka.io.
 *
 * Dry run by default — pass --confirm to actually delete.
 *
 * Usage:
 *   npx tsx scripts/reset-users.ts            # dry run
 *   npx tsx scripts/reset-users.ts --confirm  # execute
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const PROTECTED_EMAIL = "demo@rongeka.io";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

async function main() {
  const confirm = process.argv.includes("--confirm");

  // Find all non-demo users
  const usersToDelete = await prisma.user.findMany({
    where: { email: { not: PROTECTED_EMAIL } },
    select: { id: true, email: true, name: true },
  });

  if (usersToDelete.length === 0) {
    console.log("No users to delete (only demo user exists).");
    return;
  }

  const emails = usersToDelete.map((u) => u.email);

  // Count what will be deleted
  const [itemCount, collectionCount, tokenCount] = await Promise.all([
    prisma.item.count({ where: { userId: { in: usersToDelete.map((u) => u.id) } } }),
    prisma.collection.count({ where: { userId: { in: usersToDelete.map((u) => u.id) } } }),
    prisma.verificationToken.count({ where: { identifier: { in: emails } } }),
  ]);

  console.log(`\nUsers to delete (${usersToDelete.length}):`);
  usersToDelete.forEach((u) =>
    console.log(`  - ${u.email} (${u.name ?? "no name"})`)
  );
  console.log(`\nContent that will be removed:`);
  console.log(`  items:               ${itemCount}`);
  console.log(`  collections:         ${collectionCount}`);
  console.log(`  verification tokens: ${tokenCount}`);
  console.log(`  (accounts, sessions, custom item types cascade automatically)`);

  if (!confirm) {
    console.log("\nDry run — no changes made. Pass --confirm to execute.");
    return;
  }

  console.log("\nDeleting...");

  // Delete verification tokens (no FK cascade)
  const { count: deletedTokens } = await prisma.verificationToken.deleteMany({
    where: { identifier: { in: emails } },
  });

  // Delete users — cascades to items, collections, custom itemTypes, accounts, sessions
  const { count: deletedUsers } = await prisma.user.deleteMany({
    where: { email: { not: PROTECTED_EMAIL } },
  });

  // Clean up orphaned tags (tags no longer linked to any item)
  const { count: deletedTags } = await prisma.tag.deleteMany({
    where: { items: { none: {} } },
  });

  console.log(`  deleted ${deletedUsers} user(s)`);
  console.log(`  deleted ${deletedTokens} verification token(s)`);
  console.log(`  deleted ${deletedTags} orphaned tag(s)`);
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
