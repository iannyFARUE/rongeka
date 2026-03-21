import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth(function proxy(req) {
  if (!req.auth) {
    return Response.redirect(new URL("/api/auth/signin", req.nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
