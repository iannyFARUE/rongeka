"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/resend";
import { FEATURES } from "@/lib/features";

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

  if (!FEATURES.emailVerification) {
    try {
      await prisma.user.create({ data: { name, email, password: hashedPassword } });
    } catch {
      return "Registration failed. Please try again.";
    }
    redirect("/sign-in");
  }

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

// ─── Password Reset ──────────────────────────────────────────────

export async function requestPasswordReset(
  _prevState: string | null | undefined,
  formData: FormData
): Promise<string | null> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return "Enter a valid email address.";
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always succeed to avoid email enumeration
  if (!user || !user.password) {
    return null;
  }

  // Delete any existing reset token for this email before creating a new one
  await prisma.verificationToken
    .deleteMany({ where: { identifier: email } })
    .catch(() => {});

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
  }

  return null;
}

export async function resetPassword(
  _prevState: string | null | undefined,
  formData: FormData
): Promise<string | null> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return "Invalid reset link.";
  if (!password || password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return "This reset link is invalid or has already been used.";
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return "This reset link has expired. Please request a new one.";
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
    select: { emailVerified: true },
  });

  await prisma.user.update({
    where: { email: record.identifier },
    data: {
      password: hashed,
      // If email was never verified, clicking the reset link proves ownership
      ...(user && !user.emailVerified ? { emailVerified: new Date() } : {}),
    },
  });

  await prisma.verificationToken.delete({ where: { token } });

  redirect("/sign-in?reset=1");
}
