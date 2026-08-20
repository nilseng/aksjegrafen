import { Router } from "express";
import { asyncRouter } from "../asyncRouter";
import { baseUrl } from "../config";
import { IDatabase } from "../database/mongoDB";
import { getLatestYear } from "../services/yearService";
import { letterBuckets } from "./pageShell";

// Google's hard limit per sitemap file; ~580k companies means ~12 shards,
// so a sitemap index points at per-shard files generated from the collection.
const URLS_PER_SITEMAP = 50_000;

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>`;

export const sitemapRoutes = ({ db }: { db: IDatabase }) => {
  const router = Router();

  router.get(
    "/sitemap.xml",
    asyncRouter(async (_, res) => {
      const count = await db.companies.estimatedDocumentCount();
      const shards = Math.max(1, Math.ceil(count / URLS_PER_SITEMAP));
      const entries = [
        `<sitemap><loc>${baseUrl()}/sitemap-static.xml</loc></sitemap>`,
        `<sitemap><loc>${baseUrl()}/sitemap-hubs.xml</loc></sitemap>`,
        ...Array.from(
          { length: shards },
          (_, i) => `<sitemap><loc>${baseUrl()}/sitemap-companies-${i}.xml</loc></sitemap>`
        ),
      ].join("\n");
      return sendXml(
        res,
        `${XML_HEADER}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`
      );
    })
  );

  router.get("/sitemap-static.xml", (_, res) => {
    const urls = ["/", "/api-docs"].map((path) => `<url><loc>${baseUrl()}${path}</loc></url>`).join("\n");
    sendXml(
      res,
      `${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
    );
  });

  // The browse hubs (first page of each bucket; deeper pages are found by crawling).
  router.get("/sitemap-hubs.xml", (_, res) => {
    const urls = ["/selskaper", "/selskaper/storste", ...letterBuckets.map((b) => `/selskaper/${b.slug}`)]
      .map((path) => `<url><loc>${baseUrl()}${path}</loc></url>`)
      .join("\n");
    sendXml(
      res,
      `${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
    );
  });

  router.get(
    "/sitemap-companies-:shard.xml",
    asyncRouter(async (req, res) => {
      const shard = Number(req.params.shard);
      if (!Number.isInteger(shard) || shard < 0) return res.status(404).send("Not found");

      // Shards are ordered by shareholder count so Google's limited crawl budget
      // lands on the companies with real search demand first, not random _id order.
      // Until ensureSeoIndexes has built the investorCount index (first boot after
      // a deploy or an import-year bump), that sort would blow Mongo's in-memory
      // sort limit — fall back to _id order rather than failing the sitemap.
      // Suppressed companies must not be listed, and a sitemap must not submit URLs
      // that are served with a noindex header — Search Console flags the contradiction.
      const fetchShard = (sort: Record<string, 1 | -1>) =>
        db.companies
          .find(
            { suppressed: { $ne: true }, noindex: { $ne: true } },
            {
              projection: { orgnr: 1, _id: 0 },
              sort,
              skip: shard * URLS_PER_SITEMAP,
              limit: URLS_PER_SITEMAP,
            }
          )
          .toArray();
      const companies = await fetchShard({ [`investorCount.${getLatestYear()}`]: -1, _id: 1 }).catch((e) => {
        console.error("Sitemap priority sort failed, falling back to _id order:", e);
        return fetchShard({ _id: 1 });
      });
      if (!companies.length) return res.status(404).send("Not found");

      const urls = companies.map((c) => `<url><loc>${baseUrl()}/selskap/${c.orgnr}</loc></url>`).join("\n");
      return sendXml(
        res,
        `${XML_HEADER}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
      );
    })
  );

  return router;
};

const sendXml = (res: any, xml: string) =>
  res.status(200).set("Content-Type", "application/xml; charset=utf-8").set("Cache-Control", "public, max-age=86400").send(xml);
