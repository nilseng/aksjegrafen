import { NextFunction, Request, Response } from "express";
import { IDatabase } from "../database/mongoDB";
import { findNoindexOrgnrs } from "../use-cases/manageSuppressions";

const cacheTtlMs = 5 * 60 * 1000;

/**
 * Serves an X-Robots-Tag noindex header for any request whose path references an
 * orgnr on the noindex suppression list (e.g. /selskap/<orgnr>), so search engines
 * drop those pages. The SPA renders every path from the same index.html, so the
 * header is the only way to noindex individual pages.
 */
export const noindexSuppressedPages = ({ db }: { db: IDatabase }) => {
  let cache: { orgnrs: Set<string>; fetchedAt: number } | undefined;

  const getNoindexedOrgnrs = async () => {
    if (!cache || Date.now() - cache.fetchedAt > cacheTtlMs) {
      const orgnrs = await findNoindexOrgnrs({ db });
      cache = { orgnrs: new Set(orgnrs), fetchedAt: Date.now() };
    }
    return cache.orgnrs;
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgnrs = await getNoindexedOrgnrs();
      if (orgnrs.size > 0 && req.path.split("/").some((segment) => orgnrs.has(segment))) {
        res.setHeader("X-Robots-Tag", "noindex, noarchive");
      }
    } catch (error) {
      // A failed lookup must not take down the request — the page just stays indexable.
      console.error("Could not resolve noindex suppressions:", error);
    }
    next();
  };
};
