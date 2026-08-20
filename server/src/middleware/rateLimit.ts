import { Request } from "express";
import rateLimit from "express-rate-limit";
import { ApiTier } from "../models/models";

// Windows/limits are env-tunable so they can change without a code deploy.
// The interactive web app is anonymous traffic, so the anonymous limit is deliberately
// generous — it should never bite a real user browsing the graph, only rapid programmatic hammering.
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const ANONYMOUS_MAX = Number(process.env.RATE_LIMIT_ANONYMOUS_MAX) || 120;
const FREE_MAX = Number(process.env.RATE_LIMIT_FREE_MAX) || 1200;

// Requests from our own site (the interactive web app) are never rate limited, so real
// users browsing the graph can never hit a 429 — the tiers apply to external API clients.
const FIRST_PARTY_HOSTS = (
  process.env.FIRST_PARTY_HOSTS || "aksjegrafen.com,www.aksjegrafen.com,localhost"
)
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const isFirstParty = (req: Request): boolean => {
  const source = req.get("origin") || req.get("referer");
  if (!source) return false;
  try {
    return FIRST_PARTY_HOSTS.includes(new URL(source).hostname);
  } catch {
    return false;
  }
};

const limitForTier = (req: Request): number => {
  switch (req.apiTier) {
    case ApiTier.Paid:
      return Number.MAX_SAFE_INTEGER; // never limited (also covered by skip below)
    case ApiTier.Free:
      return FREE_MAX;
    default:
      return ANONYMOUS_MAX;
  }
};

export const tieredRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: limitForTier,
  standardHeaders: true,
  legacyHeaders: false,
  // Paid keys and our own web app are never rate limited.
  skip: (req: Request) => req.apiTier === ApiTier.Paid || isFirstParty(req),
  // Bucket by API key when present, else by client IP (req.ip is correct thanks to trust proxy).
  keyGenerator: (req: Request) => req.apiKey?.key ?? req.ip ?? "unknown",
  // Skip express-rate-limit's dev-time config validators (avoids version-specific startup noise).
  validate: false,
  message: {
    error: "Rate limit exceeded.",
    hint: "Include an API key via the 'x-api-key' header for a higher tier, or contact hei@aksjegrafen.com for unlimited access.",
  },
});
