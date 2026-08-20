import { Router } from "express";
import { asyncRouter } from "../asyncRouter";
import { baseUrl } from "../config";
import { IDatabase } from "../database/mongoDB";

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

  router.get(
    "/sitemap-companies-:shard.xml",
    asyncRouter(async (req, res) => {
      const shard = Number(req.params.shard);
      if (!Number.isInteger(shard) || shard < 0) return res.status(404).send("Not found");

      // Suppressed companies must not be listed, and a sitemap must not submit URLs
      // that are served with a noindex header — Search Console flags the contradiction.
      const companies = await db.companies
        .find(
          { suppressed: { $ne: true }, noindex: { $ne: true } },
          {
            projection: { orgnr: 1, _id: 0 },
            sort: { _id: 1 },
            skip: shard * URLS_PER_SITEMAP,
            limit: URLS_PER_SITEMAP,
          }
        )
        .toArray();
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
