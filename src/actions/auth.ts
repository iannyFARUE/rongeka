"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/resend";

export async function registerUser(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return "All fields are required.";
  }
  if (!email.includes("@")) {
    return "Enter a valid email address.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return "Email already in use.";
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    await prisma.$transaction([
      prisma.user.create({ data: { name, email, password: hashedPassword } }),
      prisma.verificationToken.create({ data: { identifier: email, token, expires } }),
    ]);
  } catch {
    return "Registration failed. Please try again.";
  }

  try {
    await sendVerificationEmail(email, token);
  } catch {
    // Roll back user and token so they can register again
    await prisma.user.delete({ where: { email } }).catch(() => {});
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return "Failed to send verification email. Please try again.";
  }

  redirect("/check-email");
}
