import axios from "axios";
import { Router } from "express";
import { asyncRouter } from "../asyncRouter";
import { baseUrl } from "../config";
import { IDatabase } from "../database/mongoDB";
import { Company, Ownership } from "../models/models";
import { findHistoricalInvestors } from "../use-cases/findHistoricalInvestors";
import { removeOrgnrWhitespace } from "../utils/removeOrgnrWhitespace";

/**
 * Server-rendered, crawlable company pages (/selskap/:orgnr) built from data we
 * already hold. These are the organic-search landing pages (and OG targets), so
 * they carry the Aksjegrafen brand (neumorphic cards, teal accents) while staying
 * a single self-contained HTML response: inline CSS, same-origin logo only.
 */
export const selskapRoutes = ({ db }: { db: IDatabase }) => {
  const router = Router();

  router.get(
    "/:orgnr",
    asyncRouter(async (req, res) => {
      const orgnr = removeOrgnrWhitespace(req.params.orgnr ?? "");
      if (!/^\d{9}$/.test(orgnr)) return notFound(res);

      const company = await db.companies.findOne({ orgnr });
      if (!company) return notFound(res);

      const year = latestCompanyYear(company);
      const [investors, financials] = await Promise.all([
        year ? findHistoricalInvestors({ orgnr, year, limit: 10 }).catch(() => []) : [],
        fetchFinancials(orgnr),
      ]);

      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .set("Cache-Control", "public, max-age=86400")
        .send(renderCompanyPage({ company, year, investors, financials }));
    })
  );

  return router;
};

const notFound = (res: any) =>
  res
    .status(404)
    .set("Content-Type", "text/html; charset=utf-8")
    .send(
      renderShell({
        title: "Fant ikke selskapet | Aksjegrafen",
        description: "Selskapet finnes ikke i Aksjegrafen.",
        canonicalPath: null,
        body: `<section class="card hero">
      <h1>Fant ikke selskapet</h1>
      <p>Vi fant ikke noe selskap med dette organisasjonsnummeret i aksjonærregisterdataene.</p>
      <p><a class="cta" href="/">Søk i Aksjegrafen →</a></p>
    </section>`,
      })
    );

/** The most recent year the company has registry data for. */
const latestCompanyYear = (company: Company): number | undefined => {
  const years = Object.keys(company.shares ?? {})
    .map(Number)
    .filter(Number.isFinite);
  return years.length ? Math.max(...years) : undefined;
};

const fetchFinancials = async (orgnr: string) => {
  try {
    const res = await axios({
      method: "GET",
      url: `https://data.brreg.no/regnskapsregisteret/regnskap/${orgnr}`,
      timeout: 3_000,
    });
    return Array.isArray(res.data) && res.data.length ? res.data[0] : null;
  } catch {
    // Financials are nice-to-have; the page must render without them.
    return null;
  }
};

const nf = new Intl.NumberFormat("nb-NO");
const cf = new Intl.NumberFormat("nb-NO", { notation: "compact", maximumFractionDigits: 1 });
const pf = new Intl.NumberFormat("nb-NO", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

const escapeHtml = (value: string | number | undefined | null): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

const statTile = (label: string, value: string): string =>
  `<div class="tile"><span class="tile-label">${escapeHtml(label)}</span><span class="tile-value">${escapeHtml(
    value
  )}</span></div>`;

const renderCompanyPage = ({
  company,
  year,
  investors,
  financials,
}: {
  company: Company;
  year?: number;
  investors: Ownership[];
  financials: any;
}): string => {
  const name = company.name;
  const title = `${name} – aksjonærer og eiere | Aksjegrafen`;
  const description = year
    ? `Se aksjonærene i ${name} (org.nr ${company.orgnr}) per 31.12.${year}: eierandeler, eierskapsgraf og nøkkeltall. Data fra Aksjonærregisteret og Brønnøysundregistrene.`
    : `Se eierskapsdata for ${name} (org.nr ${company.orgnr}) i Aksjegrafen. Data fra Aksjonærregisteret og Brønnøysundregistrene.`;

  const totalShares = year ? company.shares?.[year]?.total : undefined;
  // The merge step in findHistoricalInvestors can shuffle order; re-sort by stake.
  const investorRows = [...investors]
    .sort((a, b) => (year ? (b.holdings?.[year]?.total ?? 0) - (a.holdings?.[year]?.total ?? 0) : 0))
    .map((o) => {
      const stocks = year ? o.holdings?.[year]?.total : undefined;
      if (!stocks) return "";
      const share = totalShares ? stocks / totalShares : undefined;
      const investorName = o.investor?.shareholder?.name ?? o.investor?.company?.name ?? "Ukjent";
      const investorOrgnr = o.shareholderOrgnr;
      const nameCell = investorOrgnr
        ? `<a href="/selskap/${escapeHtml(investorOrgnr)}">${escapeHtml(investorName)}</a>`
        : escapeHtml(investorName);
      const shareCell =
        share !== undefined
          ? `<div class="share"><span class="share-bar"><span style="width:${Math.min(100, share * 100).toFixed(
              1
            )}%"></span></span>${pf.format(share)}</div>`
          : "–";
      return `<tr><td>${nameCell}</td><td class="num stocks">${nf.format(stocks)}</td><td class="num">${shareCell}</td></tr>`;
    })
    .filter(Boolean)
    .join("\n");

  const investorCount = year ? company.investorCount?.[year] : undefined;

  const result = financials?.resultatregnskapResultat;
  const balance = financials?.egenkapitalGjeld;
  const financialsYear: string | undefined = financials?.regnskapsperiode?.tilDato?.slice(0, 4);
  const financialRows = [
    ["Driftsinntekter", result?.driftsresultat?.driftsinntekter?.sumDriftsinntekter],
    ["Driftsresultat", result?.driftsresultat?.driftsresultat],
    ["Årsresultat", result?.aarsresultat],
    ["Egenkapital", balance?.egenkapital?.sumEgenkapital],
    ["Sum eiendeler", financials?.eiendeler?.sumEiendeler],
  ]
    .filter(([, v]) => typeof v === "number")
    .map(([label, v]) => `<tr><td>${label}</td><td class="num">${nf.format(v as number)}</td></tr>`)
    .join("\n");

  const tiles = [
    investorCount !== undefined ? statTile("Aksjonærer", nf.format(investorCount)) : "",
    totalShares !== undefined ? statTile("Aksjer utstedt", cf.format(totalShares)) : "",
    typeof result?.driftsresultat?.driftsinntekter?.sumDriftsinntekter === "number"
      ? statTile(`Driftsinntekter ${financialsYear ?? ""}`.trim(), `${cf.format(
          result.driftsresultat.driftsinntekter.sumDriftsinntekter
        )} kr`)
      : "",
    typeof result?.aarsresultat === "number"
      ? statTile(`Årsresultat ${financialsYear ?? ""}`.trim(), `${cf.format(result.aarsresultat)} kr`)
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: `${baseUrl()}/selskap/${company.orgnr}`,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "organisasjonsnummer",
      value: company.orgnr,
    },
    ...(company.location || company.zipCode
      ? {
          address: {
            "@type": "PostalAddress",
            ...(company.location ? { addressLocality: company.location } : {}),
            ...(company.zipCode ? { postalCode: company.zipCode } : {}),
            addressCountry: company.countryCode ?? "NO",
          },
        }
      : {}),
  };

  const graphUrl = `/graf?graphType=Default&sourceOrgnr=${company.orgnr}`;

  const body = `
    <nav class="crumbs"><a href="/">Aksjegrafen</a> <span aria-hidden="true">/</span> <span>${escapeHtml(
      name
    )}</span></nav>

    <section class="card hero">
      <h1>${escapeHtml(name)}</h1>
      <p class="facts">Org.nr ${escapeHtml(company.orgnr)}${
    company.location ? ` · ${escapeHtml(company.location)}` : ""
  }${company.zipCode ? ` (${escapeHtml(company.zipCode)})` : ""}</p>
      <a class="cta" href="${graphUrl}">Utforsk eierskapsgrafen →</a>
    </section>

    ${tiles ? `<div class="kpis">${tiles}</div>` : ""}

    ${
      investorRows
        ? `<section class="card">
      <h2>Største aksjonærer <span class="vintage">per 31.12.${year}</span></h2>
      <div class="table-wrap">
      <table>
        <thead><tr><th>Aksjonær</th><th class="num stocks">Aksjer</th><th class="num">Andel</th></tr></thead>
        <tbody>${investorRows}</tbody>
      </table>
      </div>
      <p class="muted">${
        investorCount ? `${nf.format(investorCount)} aksjonær${investorCount === 1 ? "" : "er"} totalt. ` : ""
      }${totalShares ? `${nf.format(totalShares)} aksjer utstedt. ` : ""}<a href="${graphUrl}">Se alle i grafen →</a></p>
    </section>`
        : `<section class="card"><p>Ingen aksjonærdata registrert for selskapet.</p></section>`
    }

    ${
      financialRows
        ? `<section class="card">
      <h2>Nøkkeltall <span class="vintage">${financialsYear ? `regnskapsåret ${escapeHtml(financialsYear)}` : ""}</span></h2>
      <div class="table-wrap">
      <table>
        <thead><tr><th>Post</th><th class="num">NOK</th></tr></thead>
        <tbody>${financialRows}</tbody>
      </table>
      </div>
    </section>`
        : ""
    }

    <footer>
      <p class="muted">
        Aksjonærdata: Skatteetatens aksjonærregister, per 31.12.${year ?? "—"}.
        Regnskapstall og roller: Brønnøysundregistrene, gjort tilgjengelig under
        <a href="https://data.norge.no/nlod/no/1.0" rel="license">NLOD 1.0</a>.
        Innholdet kan inneholde feil og er ikke en godkjent utskrift fra offentlige registre.
      </p>
    </footer>`;

  return renderShell({
    title,
    description,
    canonicalPath: `/selskap/${company.orgnr}`,
    jsonLd,
    body,
  });
};

const renderShell = ({
  title,
  description,
  canonicalPath,
  jsonLd,
  body,
}: {
  title: string;
  description: string;
  canonicalPath: string | null;
  jsonLd?: object;
  body: string;
}): string => `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
${
  canonicalPath
    ? `<link rel="canonical" href="${baseUrl()}${canonicalPath}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Aksjegrafen" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:url" content="${baseUrl()}${canonicalPath}" />
<meta property="og:image" content="${baseUrl()}/logo-512x512.png" />`
    : `<meta name="robots" content="noindex" />`
}
<link rel="icon" href="/favicon.ico" />
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}
<style>
  :root {
    color-scheme: light dark;
    --bg: #efeeee;
    --card: #f8f9fa;
    --text: #212529;
    --muted: #5f676e;
    --accent: #117a8b;
    --accent-soft: rgba(23, 162, 184, 0.18);
    --line: rgba(33, 37, 41, 0.08);
    --card-shadow: -6px -6px 16px 0 rgba(255, 255, 255, 0.5), 6px 6px 16px 0 rgba(209, 205, 199, 0.5);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #212529;
      --card: #343a40;
      --text: #f8f9fa;
      --muted: #9aa3ab;
      --accent: #4cc3d6;
      --accent-soft: rgba(76, 195, 214, 0.22);
      --line: rgba(248, 249, 250, 0.1);
      --card-shadow: -4px -4px 8px 0 rgba(0, 0, 0, 0.2), 4px 4px 8px 0 rgba(60, 60, 60, 0.2);
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text);
    margin: 0;
    line-height: 1.55;
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .site-header { display: flex; align-items: center; max-width: 52rem; margin: 0 auto; padding: 1rem; }
  .brand { display: flex; align-items: center; gap: 0.6rem; color: var(--text); font-weight: 700; font-size: 1.05rem; }
  .brand:hover { text-decoration: none; }
  .brand img { width: 36px; height: 36px; }

  main { max-width: 52rem; margin: 0 auto; padding: 0 1rem 3rem; }
  .crumbs { font-size: 0.85rem; color: var(--muted); margin: 0.25rem 0 1rem; }
  .crumbs a { color: inherit; }

  .card {
    background: var(--card);
    border-radius: 12px;
    box-shadow: var(--card-shadow);
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.25rem;
  }
  .hero h1 { margin: 0 0 0.25rem; font-size: 1.7rem; line-height: 1.25; }
  .facts { color: var(--muted); margin: 0 0 1.1rem; }
  .cta {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-weight: 600;
    padding: 0.6rem 1.1rem;
    border-radius: 8px;
  }
  .cta:hover { text-decoration: none; filter: brightness(1.08); }
  @media (prefers-color-scheme: dark) { .cta { color: #14262a; } }

  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
  .tile { background: var(--card); border-radius: 12px; box-shadow: var(--card-shadow); padding: 0.9rem 1.1rem; display: flex; flex-direction: column; gap: 0.15rem; }
  .tile-label { font-size: 0.8rem; color: var(--muted); }
  .tile-value { font-size: 1.35rem; font-weight: 600; }

  h2 { font-size: 1.1rem; margin: 0 0 0.75rem; }
  .vintage { font-size: 0.8rem; font-weight: 400; color: var(--muted); margin-left: 0.35rem; }
  .table-wrap { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: 0.45rem 0.75rem 0.45rem 0; border-bottom: 1px solid var(--line); }
  th { font-size: 0.8rem; color: var(--muted); font-weight: 600; }
  tbody tr:last-child td { border-bottom: none; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .share { display: inline-flex; align-items: center; gap: 0.5rem; }
  .share-bar { width: 4.5rem; height: 6px; border-radius: 4px; background: var(--accent-soft); overflow: hidden; display: inline-block; }
  .share-bar span { display: block; height: 100%; border-radius: 4px; background: var(--accent); }

  /* On narrow screens the raw share count loses to the ownership share. */
  @media (max-width: 480px) {
    .stocks { display: none; }
    .share-bar { width: 2.75rem; }
    .card { padding: 1.1rem 1.15rem; }
  }

  .muted { color: var(--muted); font-size: 0.85rem; }
  footer { padding: 0.5rem 0.25rem; }
</style>
</head>
<body>
<header class="site-header">
  <a class="brand" href="/"><img src="/logo-64x64.png" alt="" width="36" height="36" />Aksjegrafen</a>
</header>
<main>
${body}
</main>
</body>
</html>`;
