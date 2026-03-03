import { Router } from "express";
import { query, matchedData } from "express-validator";
import { asyncRouter } from "../asyncRouter";
import { IDatabase } from "../database/mongoDB";
import LRUCache from "lru-cache";

const router = Router();

const cache = new LRUCache<string, unknown>({
  max: 5000,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export const companyPageRoutes = ({ db }: { db: IDatabase }) => {
  // Company page data: all info needed for an SEO-friendly company page
  router.get(
    "/company-page/:orgnr",
    asyncRouter(async (req, res) => {
      const { orgnr } = req.params;
      if (!orgnr) return res.status(400).json({ error: "orgnr is required" });

      const cacheKey = `company-page:${orgnr}`;
      const cached = cache.get(cacheKey);
      if (cached) return res.json(cached);

      const company = await db.companies.findOne({ orgnr });
      if (!company) return res.status(404).json({ error: "Company not found" });

      const [investors, investments, roles] = await Promise.all([
        db.ownerships
          .find({ orgnr, "holdings.2024.total": { $gt: 0 } })
          .sort({ "holdings.2024.total": -1 })
          .limit(10)
          .toArray(),
        db.ownerships
          .find({ shareholderOrgnr: orgnr, "holdings.2024.total": { $gt: 0 } })
          .sort({ "holdings.2024.total": -1 })
          .limit(10)
          .toArray(),
        db.roles.find({ orgnr }).limit(20).toArray(),
      ]);

      // Resolve investor/investment names
      const investorIds = investors.map((o) => o.shareHolderId);
      const investmentOrgnrs = investments.map((o) => o.orgnr);

      const [shareholderDocs, investmentDocs] = await Promise.all([
        investorIds.length > 0 ? db.shareholders.find({ id: { $in: investorIds } }).toArray() : [],
        investmentOrgnrs.length > 0 ? db.companies.find({ orgnr: { $in: investmentOrgnrs } }).toArray() : [],
      ]);

      const shareholderMap = new Map(shareholderDocs.map((s) => [s.id, s]));
      const investmentMap = new Map(investmentDocs.map((c) => [c.orgnr, c]));

      const enrichedInvestors = investors.map((o) => ({
        ...o,
        investor: { shareholder: shareholderMap.get(o.shareHolderId) },
      }));

      const enrichedInvestments = investments.map((o) => ({
        ...o,
        investment: investmentMap.get(o.orgnr),
      }));

      const result = {
        company,
        investors: enrichedInvestors,
        investments: enrichedInvestments,
        roles,
      };

      cache.set(cacheKey, result);
      return res.json(result);
    })
  );

  // Sitemap index
  router.get(
    "/sitemap-index.xml",
    asyncRouter(async (_, res) => {
      const cacheKey = "sitemap-index";
      const cached = cache.get(cacheKey);
      if (cached) {
        res.set("Content-Type", "application/xml");
        return res.send(cached);
      }

      const companyCount = await db.companies.countDocuments();
      const pageSize = 10000;
      const pageCount = Math.ceil(companyCount / pageSize);

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      for (let i = 1; i <= pageCount; i++) {
        xml += `  <sitemap>\n`;
        xml += `    <loc>https://aksjegrafen.no/api/seo/sitemap-${i}.xml</loc>\n`;
        xml += `  </sitemap>\n`;
      }
      xml += "</sitemapindex>\n";

      cache.set(cacheKey, xml);
      res.set("Content-Type", "application/xml");
      return res.send(xml);
    })
  );

  // Paginated sitemaps
  router.get(
    "/sitemap-:page.xml",
    query("page").optional(),
    asyncRouter(async (req, res) => {
      const page = parseInt(req.params.page, 10);
      if (isNaN(page) || page < 1) return res.status(400).send("Invalid page");

      const cacheKey = `sitemap-${page}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        res.set("Content-Type", "application/xml");
        return res.send(cached);
      }

      const pageSize = 10000;
      const skip = (page - 1) * pageSize;

      const companies = await db.companies
        .find({}, { projection: { orgnr: 1, name: 1 } })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

      for (const company of companies) {
        const slug = slugify(company.name);
        xml += "  <url>\n";
        xml += `    <loc>https://aksjegrafen.no/selskap/${company.orgnr}/${slug}</loc>\n`;
        xml += "    <changefreq>monthly</changefreq>\n";
        xml += "  </url>\n";
      }

      xml += "</urlset>\n";

      cache.set(cacheKey, xml);
      res.set("Content-Type", "application/xml");
      return res.send(xml);
    })
  );

  return router;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
