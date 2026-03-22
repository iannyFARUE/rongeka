import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [
    GitHub,
    Credentials({
      // Real authorize logic lives in auth.ts — this placeholder keeps the
      // provider registered in the edge-compatible config without importing bcrypt
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig
