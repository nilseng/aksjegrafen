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
 * already hold. The SPA stays untouched; these pages exist for search engines and
 * as shareable landing pages that link into the interactive graph.
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
        body: `<h1>Fant ikke selskapet</h1>
      <p>Vi fant ikke noe selskap med dette organisasjonsnummeret i aksjonærregisterdataene.</p>
      <p><a href="/">Søk i Aksjegrafen</a></p>`,
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
const pf = new Intl.NumberFormat("nb-NO", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

const escapeHtml = (value: string | number | undefined | null): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

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
      return `<tr><td>${nameCell}</td><td class="num">${nf.format(stocks)}</td><td class="num">${
        share !== undefined ? pf.format(share) : "–"
      }</td></tr>`;
    })
    .filter(Boolean)
    .join("\n");

  const investorCount = year ? company.investorCount?.[year] : undefined;

  const result = financials?.resultatregnskapResultat;
  const balance = financials?.egenkapitalGjeld;
  const financialsPeriod: string | undefined = financials?.regnskapsperiode?.tilDato?.slice(0, 4);
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

  const graphUrl = `/?graphType=Default&sourceOrgnr=${company.orgnr}`;

  const body = `
    <nav class="crumbs"><a href="/">Aksjegrafen</a> / <span>${escapeHtml(name)}</span></nav>
    <h1>${escapeHtml(name)}</h1>
    <p class="facts">
      Org.nr ${escapeHtml(company.orgnr)}${company.location ? ` · ${escapeHtml(company.location)}` : ""}${
    company.zipCode ? ` (${escapeHtml(company.zipCode)})` : ""
  }
    </p>
    <p><a class="cta" href="${graphUrl}">Utforsk eierskapsgrafen til ${escapeHtml(name)} →</a></p>

    ${
      investorRows
        ? `<section>
      <h2>Største aksjonærer per 31.12.${year}</h2>
      <table>
        <thead><tr><th>Aksjonær</th><th class="num">Aksjer</th><th class="num">Andel</th></tr></thead>
        <tbody>${investorRows}</tbody>
      </table>
      <p class="muted">${
        investorCount ? `${nf.format(investorCount)} aksjonær${investorCount === 1 ? "" : "er"} totalt. ` : ""
      }${totalShares ? `${nf.format(totalShares)} aksjer utstedt. ` : ""}<a href="${graphUrl}">Se alle i grafen.</a></p>
    </section>`
        : `<p>Ingen aksjonærdata registrert for selskapet.</p>`
    }

    ${
      financialRows
        ? `<section>
      <h2>Nøkkeltall${financialsPeriod ? ` (${escapeHtml(financialsPeriod)})` : ""}</h2>
      <table>
        <thead><tr><th>Post</th><th class="num">NOK</th></tr></thead>
        <tbody>${financialRows}</tbody>
      </table>
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
  :root { color-scheme: light dark; }
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0 auto; max-width: 46rem; padding: 1.5rem 1rem 3rem; line-height: 1.5; }
  h1 { margin-bottom: 0.25rem; }
  .facts { color: #666; margin-top: 0; }
  .crumbs { font-size: 0.85rem; color: #666; margin-bottom: 1.5rem; }
  .crumbs a { color: inherit; }
  .cta { font-weight: 600; }
  table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
  th, td { text-align: left; padding: 0.3rem 0.5rem 0.3rem 0; border-bottom: 1px solid #ddd; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: #666; font-size: 0.85rem; }
  footer { margin-top: 3rem; border-top: 1px solid #ddd; padding-top: 1rem; }
  @media (prefers-color-scheme: dark) {
    .facts, .crumbs, .muted { color: #aaa; }
    th, td, footer { border-color: #444; }
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
