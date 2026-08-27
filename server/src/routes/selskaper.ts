import { Router } from "express";
import { asyncRouter } from "../asyncRouter";
import { IDatabase } from "../database/mongoDB";
import { getLatestYear } from "../services/yearService";
import { TtlCache } from "../utils/ttlCache";
import { LetterBucket, escapeHtml, letterBuckets, nf, renderNotFoundPage, renderShell } from "./pageShell";

/**
 * Server-rendered browse hubs (/selskaper). Their job is crawlability: they give
 * search engines short link paths from the homepage into every /selskap/:orgnr
 * page, which a flat sitemap alone does not. Alphabet buckets cover the whole
 * registry; "største" surfaces the companies people actually search for.
 */

const PAGE_SIZE = 100;
// Cap the "largest companies" hub — beyond the head, the alphabet covers the rest.
const LARGEST_MAX_PAGES = 20;

const pageCache = new TtlCache<string>(1000 * 60 * 60 * 24, 500);
const countCache = new TtlCache<number>(1000 * 60 * 60 * 24, 100);

// The hubs exist to get /selskap pages crawled, so suppressed companies and pages
// served with a noindex header must not be linked from them.
const excludeSuppressed = {
  suppressed: { $ne: true as const },
  suppressedSearch: { $ne: true as const },
  noindex: { $ne: true as const },
};

export const selskaperRoutes = ({ db }: { db: IDatabase }) => {
  const router = Router();

  const bucketCount = async (bucket: LetterBucket): Promise<number> => {
    const cached = countCache.get(bucket.slug);
    if (cached !== undefined) return cached;
    const count = await db.companies.countDocuments({ name: { $regex: bucket.pattern } });
    countCache.set(bucket.slug, count);
    return count;
  };

  const largestCount = async (): Promise<number> => {
    const cached = countCache.get("storste");
    if (cached !== undefined) return cached;
    const count = await db.companies.countDocuments({ [`investorCount.${getLatestYear()}`]: { $gte: 1 } });
    countCache.set("storste", count);
    return count;
  };

  const sendPage = (res: any, html: string) =>
    res
      .status(200)
      .set("Content-Type", "text/html; charset=utf-8")
      .set("Cache-Control", "public, max-age=86400")
      .send(html);

  const notFound = (res: any) =>
    res
      .status(404)
      .set("Content-Type", "text/html; charset=utf-8")
      .send(
        renderNotFoundPage({
          title: "Fant ikke siden | Aksjegrafen",
          message: "Denne oversiktssiden finnes ikke.",
        })
      );

  // Browse index: all alphabet buckets + the largest-companies hub.
  router.get(
    "/",
    asyncRouter(async (_, res) => {
      const cached = pageCache.get("index");
      if (cached) return sendPage(res, cached);

      const counts = await Promise.all(letterBuckets.map((b) => bucketCount(b)));
      const total = counts.reduce((sum, c) => sum + c, 0);

      const letterLinks = letterBuckets
        .map((b, i) =>
          counts[i] > 0 ? `<a href="/selskaper/${b.slug}" title="${nf.format(counts[i])} selskaper">${b.label}</a>` : ""
        )
        .filter(Boolean)
        .join("\n");

      const body = `
    <nav class="crumbs"><a href="/">Aksjegrafen</a> <span aria-hidden="true">/</span> <span>Selskaper</span></nav>

    <section class="card hero">
      <h1>Alle selskaper i Aksjegrafen</h1>
      <p class="facts">${nf.format(total)} aksjeselskaper fra Aksjonærregisteret. Bla alfabetisk, eller se de største selskapene målt i antall aksjonærer.</p>
      <a class="cta" href="/selskaper/storste">Norges største selskaper →</a>
    </section>

    <section class="card">
      <h2>Bla alfabetisk</h2>
      <div class="letter-grid">
${letterLinks}
      </div>
    </section>

    <footer>
      <p class="muted">Aksjonærdata: Skatteetatens aksjonærregister. Hvert selskap har en egen side med aksjonærer, eierandeler og nøkkeltall.</p>
    </footer>`;

      const html = renderShell({
        title: "Alle selskaper – bla alfabetisk | Aksjegrafen",
        description: `Bla blant ${nf.format(total)} norske aksjeselskaper og se aksjonærer, eierandeler og eierskapsgraf for hvert selskap.`,
        canonicalPath: "/selskaper",
        body,
      });
      pageCache.set("index", html);
      return sendPage(res, html);
    })
  );

  // Largest companies by shareholder count, paginated.
  router.get(
    "/storste/:side?",
    asyncRouter(async (req, res) => {
      const side = parsePage(req.params.side);
      if (!side) return notFound(res);

      const cacheKey = `storste:${side}`;
      const cached = pageCache.get(cacheKey);
      if (cached) return sendPage(res, cached);

      const year = getLatestYear();
      const totalPages = Math.min(LARGEST_MAX_PAGES, Math.max(1, Math.ceil((await largestCount()) / PAGE_SIZE)));
      if (side > totalPages) return notFound(res);

      const companies = await db.companies
        .find(
          { [`investorCount.${year}`]: { $gte: 1 }, ...excludeSuppressed },
          {
            projection: { orgnr: 1, name: 1, [`investorCount.${year}`]: 1, _id: 0 },
            sort: { [`investorCount.${year}`]: -1, _id: 1 },
            skip: (side - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
          }
        )
        .toArray();
      if (!companies.length) return notFound(res);

      const rows = companies
        .map(
          (c) =>
            `<tr><td><a href="/selskap/${escapeHtml(c.orgnr)}">${escapeHtml(c.name)}</a></td><td class="num">${nf.format(
              c.investorCount?.[year] ?? 0
            )}</td></tr>`
        )
        .join("\n");

      const path = (n: number) => (n === 1 ? "/selskaper/storste" : `/selskaper/storste/${n}`);
      const body = `
    <nav class="crumbs"><a href="/">Aksjegrafen</a> <span aria-hidden="true">/</span> <a href="/selskaper">Selskaper</a> <span aria-hidden="true">/</span> <span>Største</span></nav>

    <section class="card hero">
      <h1>Norges største selskaper etter antall aksjonærer</h1>
      <p class="facts">Per 31.12.${year}. Side ${side} av ${totalPages}.</p>
    </section>

    <section class="card">
      <div class="table-wrap">
      <table>
        <thead><tr><th>Selskap</th><th class="num">Aksjonærer</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      </div>
      ${pager({ side, totalPages, path })}
    </section>`;

      const html = renderShell({
        title:
          side === 1
            ? "Norges største selskaper etter antall aksjonærer | Aksjegrafen"
            : `Norges største selskaper – side ${side} | Aksjegrafen`,
        description: `Selskapene med flest aksjonærer i Aksjonærregisteret per 31.12.${year}, med aksjonærliste og eierskapsgraf for hvert selskap.`,
        canonicalPath: path(side),
        body,
      });
      pageCache.set(cacheKey, html);
      return sendPage(res, html);
    })
  );

  // Alphabet buckets, paginated: /selskaper/a, /selskaper/a/2, /selskaper/andre …
  router.get(
    "/:bokstav/:side?",
    asyncRouter(async (req, res) => {
      const bucket = letterBuckets.find((b) => b.slug === req.params.bokstav);
      const side = parsePage(req.params.side);
      if (!bucket || !side) return notFound(res);

      const cacheKey = `${bucket.slug}:${side}`;
      const cached = pageCache.get(cacheKey);
      if (cached) return sendPage(res, cached);

      const totalPages = Math.max(1, Math.ceil((await bucketCount(bucket)) / PAGE_SIZE));
      if (side > totalPages) return notFound(res);

      const companies = await db.companies
        .find(
          { name: { $regex: bucket.pattern }, ...excludeSuppressed },
          {
            projection: { orgnr: 1, name: 1, _id: 0 },
            sort: { name: 1, _id: 1 },
            skip: (side - 1) * PAGE_SIZE,
            limit: PAGE_SIZE,
          }
        )
        .toArray();
      if (!companies.length) return notFound(res);

      const items = companies
        .map((c) => `<li><a href="/selskap/${escapeHtml(c.orgnr)}">${escapeHtml(c.name)}</a></li>`)
        .join("\n");

      const path = (n: number) => (n === 1 ? `/selskaper/${bucket.slug}` : `/selskaper/${bucket.slug}/${n}`);
      const body = `
    <nav class="crumbs"><a href="/">Aksjegrafen</a> <span aria-hidden="true">/</span> <a href="/selskaper">Selskaper</a> <span aria-hidden="true">/</span> <span>${escapeHtml(
        bucket.label
      )}</span></nav>

    <section class="card hero">
      <h1>Selskaper på ${escapeHtml(bucket.label)}</h1>
      <p class="facts">Side ${side} av ${nf.format(totalPages)}.</p>
    </section>

    <section class="card">
      <ul class="company-list">
${items}
      </ul>
      ${pager({ side, totalPages, path })}
    </section>`;

      const html = renderShell({
        title:
          side === 1
            ? `Selskaper på ${bucket.label} | Aksjegrafen`
            : `Selskaper på ${bucket.label} – side ${side} | Aksjegrafen`,
        description: `Norske aksjeselskaper på ${bucket.label}: aksjonærer, eierandeler og eierskapsgraf for hvert selskap.`,
        canonicalPath: path(side),
        body,
      });
      pageCache.set(cacheKey, html);
      return sendPage(res, html);
    })
  );

  return router;
};

const parsePage = (raw: string | undefined): number | null => {
  if (raw === undefined) return 1;
  if (!/^\d{1,5}$/.test(raw)) return null;
  const n = Number(raw);
  // Page 1 lives at the unsuffixed URL only, so /…/1 doesn't duplicate it.
  return n >= 2 ? n : null;
};

const pager = ({
  side,
  totalPages,
  path,
}: {
  side: number;
  totalPages: number;
  path: (n: number) => string;
}): string => {
  if (totalPages <= 1) return "";
  const prev = side > 1 ? `<a href="${path(side - 1)}">← Forrige</a>` : "<span></span>";
  const next = side < totalPages ? `<a href="${path(side + 1)}">Neste →</a>` : "<span></span>";
  return `<div class="pager">${prev}<span class="muted">Side ${nf.format(side)} av ${nf.format(
    totalPages
  )}</span>${next}</div>`;
};
