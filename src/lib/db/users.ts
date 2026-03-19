import { prisma } from "@/lib/db";

const DEMO_USER_EMAIL = "demo@rongeka.io";

// Swap this for session.user.id once auth is set up
export async function getDemoUserId(): Promise<string> {
  const user = await prisma.user.findFirstOrThrow({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  return user.id;
}
