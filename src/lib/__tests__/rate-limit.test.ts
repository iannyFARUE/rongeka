import { describe, it, expect } from "vitest";
import { getIp, retryAfterMinutes } from "@/lib/rate-limit";

describe("getIp", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const headers = { get: (name: string) => (name === "x-forwarded-for" ? "1.2.3.4, 5.6.7.8" : null) };
    expect(getIp(headers)).toBe("1.2.3.4");
  });

  it("trims whitespace from the IP", () => {
    const headers = { get: (name: string) => (name === "x-forwarded-for" ? "  1.2.3.4  " : null) };
    expect(getIp(headers)).toBe("1.2.3.4");
  });

  it('returns "anonymous" when the header is missing', () => {
    const headers = { get: () => null };
    expect(getIp(headers)).toBe("anonymous");
  });
});

describe("retryAfterMinutes", () => {
  it("returns at least 1 when reset is in the past or now", () => {
    expect(retryAfterMinutes(Date.now() - 1000)).toBe(1);
    expect(retryAfterMinutes(Date.now())).toBe(1);
  });

  it("returns the ceiling of minutes until reset", () => {
    expect(retryAfterMinutes(Date.now() + 2 * 60_000)).toBe(2);
    expect(retryAfterMinutes(Date.now() + 90_000)).toBe(2); // 1.5 min → ceil → 2
  });
});
