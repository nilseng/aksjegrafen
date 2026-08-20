import { NextFunction, Request, Response } from "express";
import { IDatabase } from "../database/mongoDB";
import { ApiKey, ApiTier } from "../models/models";

// Attach the resolved API-key context to every request.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiTier?: ApiTier;
      apiKey?: ApiKey;
    }
  }
}

// Small in-memory cache so we don't hit Mongo on every request. Keys change rarely.
const CACHE_TTL_MS = 60_000;
interface CacheEntry {
  apiKey: ApiKey | null;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

const extractKey = (req: Request): string | undefined => {
  const header = req.header("x-api-key");
  if (header) return header.trim();
  const auth = req.header("authorization");
  if (auth && /^Bearer\s+/i.test(auth)) return auth.replace(/^Bearer\s+/i, "").trim();
  if (typeof req.query.apiKey === "string") return req.query.apiKey.trim();
  return undefined;
};

export const apiKeyMiddleware =
  (db: IDatabase) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const rawKey = extractKey(req);
      if (!rawKey) {
        req.apiTier = ApiTier.Anonymous;
        return next();
      }

      const now = Date.now();
      const cached = cache.get(rawKey);
      let apiKey: ApiKey | null;
      if (cached && cached.expiresAt > now) {
        apiKey = cached.apiKey;
      } else {
        apiKey = await db.apiKeys.findOne({ key: rawKey, active: true });
        cache.set(rawKey, { apiKey, expiresAt: now + CACHE_TTL_MS });
      }

      if (apiKey) {
        req.apiKey = apiKey;
        req.apiTier = apiKey.tier;
      } else {
        // Unknown/invalid key: fall back to anonymous rather than hard-failing — the API is open.
        req.apiTier = ApiTier.Anonymous;
      }
      return next();
    } catch (e) {
      // Never let a key-lookup error block the open API; degrade to anonymous.
      console.error("apiKeyMiddleware lookup failed:", e);
      req.apiTier = ApiTier.Anonymous;
      return next();
    }
  };
