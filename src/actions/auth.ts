"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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
  await prisma.user.create({ data: { name, email, password: hashedPassword } });

  redirect("/sign-in");
}
