/**
 * Feature flags — all toggles live here.
 * Set the corresponding env variable to override the default.
 */
export const FEATURES = {
  /**
   * When true, registration sends a verification email and users must verify
   * before signing in with credentials.
   *
   * Disable during development if you don't have a Resend domain configured:
   *   EMAIL_VERIFICATION_ENABLED=false
   *
   * Defaults to true (production-safe).
   */
  emailVerification: process.env.EMAIL_VERIFICATION_ENABLED !== "false",
} as const;
