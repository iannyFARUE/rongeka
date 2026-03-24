"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";

export async function changePassword(
  _prevState: string | null | undefined,
  formData: FormData
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return "Not authenticated.";

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return "Password change is not available for this account.";
  }

  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) {
    return "Current password is incorrect.";
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return null;
}

export async function deleteAccount(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirect: false });
  redirect("/sign-in");
}
