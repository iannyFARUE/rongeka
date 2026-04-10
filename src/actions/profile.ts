"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/action-utils";

export async function changePassword(
  _prevState: string | null | undefined,
  formData: FormData
): Promise<string | null> {
  const user = await requireAuth();
  if (!user) return "Not authenticated.";

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return "All fields are required.";
  }
  if (newPassword.length < 8) {
    return "New password must be at least 8 characters.";
  }
  if (newPassword !== confirmPassword) {
    return "Passwords do not match.";
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { password: true },
  });

  if (!dbUser?.password) {
    return "Password change is not available for this account.";
  }

  const passwordsMatch = await bcrypt.compare(currentPassword, dbUser.password);
  if (!passwordsMatch) {
    return "Current password is incorrect.";
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.userId },
    data: { password: hashed },
  });

  return null;
}

export async function deleteAccount(): Promise<void> {
  const user = await requireAuth();
  if (!user) return;

  await prisma.user.delete({ where: { id: user.userId } });
  await signOut({ redirect: false });
  redirect("/sign-in");
}
