import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { FEATURES } from "@/lib/features"
import { checkRateLimit, getIp } from "@/lib/rate-limit"
import authConfig from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { isPro: true },
        });
        token.isPro = dbUser?.isPro ?? false;
      }

      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.isPro !== undefined) session.user.isPro = token.isPro as boolean;
      return session;
    },
  },
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string
          password: string
        }
        if (!email || !password) return null

        const ip = getIp(await headers())
        const { success } = await checkRateLimit("login", `${ip}:${email}`)
        if (!success) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null

        const passwordsMatch = await bcrypt.compare(password, user.password)
        if (!passwordsMatch) return null

        if (FEATURES.emailVerification && !user.emailVerified) return null

        return user
      },
    }),
  ],
})
