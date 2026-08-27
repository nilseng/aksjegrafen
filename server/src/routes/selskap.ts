import axios from "axios";
import { Router } from "express";
import { asyncRouter } from "../asyncRouter";
import { baseUrl } from "../config";
import { IDatabase } from "../database/mongoDB";
import { Company, Ownership, Role } from "../models/models";
import { findHistoricalInvestments } from "../use-cases/findHistoricalInvestments";
import { findHistoricalInvestors } from "../use-cases/findHistoricalInvestors";
import { removeOrgnrWhitespace } from "../utils/removeOrgnrWhitespace";
import { bucketForName, cf, escapeHtml, nf, pf, renderNotFoundPage, renderShell } from "./pageShell";

/**
 * Server-rendered, crawlable company pages (/selskap/:orgnr) built from data we
 * already hold. These are the organic-search landing pages (and OG targets); the
 * shared shell lives in pageShell.ts.
 */
export const selskapRoutes = ({ db }: { db: IDatabase }) => {
  const router = Router();

  router.get(
    "/:orgnr",
    asyncRouter(async (req, res) => {
      const orgnr = removeOrgnrWhitespace(req.params.orgnr ?? "");
      if (!/^\d{9}$/.test(orgnr)) return notFound(res);

      const company = await db.companies.findOne({ orgnr, suppressed: { $ne: true } });
      if (!company) return notFound(res);

      const year = latestCompanyYear(company);
      const [investors, investments, roles, financials] = await Promise.all([
        year ? findHistoricalInvestors({ orgnr, year, limit: 10 }).catch(() => []) : [],
        year ? findHistoricalInvestments({ shareholderOrgnr: orgnr, year, limit: 10 }).catch(() => []) : [],
        db.roles
          .find({ orgnr, suppressed: { $ne: true } }, { limit: 40 })
          .toArray()
          .catch(() => [] as Role[]),
        fetchFinancials(orgnr),
      ]);

      // Corporate shareholders and role holders outside the registry (municipalities,
      // foundations, foreign entities) have an orgnr but no /selskap page; linking
      // them would scatter crawlable 404s across every page, so only link orgnrs
      // that resolve to a company.
      const candidateOrgnrs = [
        ...investors.map((o) => o.shareholderOrgnr),
        ...roles.map((r) => r.holder?.unit?.orgnr),
      ].filter((n): n is string => !!n);
      const uniqueOrgnrs = [...new Set(candidateOrgnrs)];
      const linkableOrgnrs = new Set(
        uniqueOrgnrs.length
          ? (
              await db.companies
                .find({ orgnr: { $in: uniqueOrgnrs } }, { projection: { orgnr: 1, _id: 0 } })
                .toArray()
            ).map((c) => c.orgnr)
          : []
      );

      res
        .status(200)
        .set("Content-Type", "text/html; charset=utf-8")
        .set("Cache-Control", "public, max-age=86400")
        .send(renderCompanyPage({ company, year, investors, investments, roles, financials, linkableOrgnrs }));
    })
  );

  return router;
};

const notFound = (res: any) =>
  res
    .status(404)
    .set("Content-Type", "text/html; charset=utf-8")
    .send(
      renderNotFoundPage({
        title: "Fant ikke selskapet | Aksjegrafen",
        message: "Vi fant ikke noe selskap med dette organisasjonsnummeret i aksjonærregisterdataene.",
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

const statTile = (label: string, value: string): string =>
  `<div class="tile"><span class="tile-label">${escapeHtml(label)}</span><span class="tile-value">${escapeHtml(
    value
  )}</span></div>`;

// Brønnøysund role type codes → labels, in display order. Unknown codes fall back
// to the raw code at the end.
const roleTypes: [string, string][] = [
  ["DAGL", "Daglig leder"],
  ["LEDE", "Styrets leder"],
  ["NEST", "Styrets nestleder"],
  ["MEDL", "Styremedlem"],
  ["VARA", "Varamedlem"],
  ["OBS", "Observatør"],
  ["KONT", "Kontaktperson"],
  ["INNH", "Innehaver"],
  ["FFØR", "Forretningsfører"],
  ["REPR", "Norsk representant"],
  ["REVI", "Revisor"],
  ["REGN", "Regnskapsfører"],
];

const roleRank = (type: string): number => {
  const i = roleTypes.findIndex(([code]) => code === type);
  return i === -1 ? roleTypes.length : i;
};

const roleLabel = (type: string): string => roleTypes.find(([code]) => code === type)?.[1] ?? type;

const roleHolderName = (role: Role): string | undefined => {
  const person = role.holder?.person;
  if (person?.fornavn || person?.etternavn) return [person.fornavn, person.etternavn].filter(Boolean).join(" ");
  return role.holder?.unit?.navn;
};

const renderCompanyPage = ({
  company,
  year,
  investors,
  investments,
  roles,
  financials,
  linkableOrgnrs,
}: {
  company: Company;
  year?: number;
  investors: Ownership[];
  investments: Ownership[];
  roles: Role[];
  financials: any;
  linkableOrgnrs: Set<string>;
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
      const investorOrgnr = o.shareholderOrgnr && linkableOrgnrs.has(o.shareholderOrgnr) ? o.shareholderOrgnr : null;
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

  // Companies this company owns shares in. These outbound links turn otherwise
  // orphaned pages (e.g. holding companies owned only by people) into a crawlable
  // ownership graph, which is how Google discovers and indexes the long tail.
  const investmentRows = [...investments]
    .sort((a, b) => (year ? (b.holdings?.[year]?.total ?? 0) - (a.holdings?.[year]?.total ?? 0) : 0))
    .map((o) => {
      const stocks = year ? o.holdings?.[year]?.total : undefined;
      // Skip holdings whose target didn't resolve to a registry company —
      // linking an unresolvable orgnr would produce a crawlable 404.
      if (!stocks || !o.orgnr || !o.investment) return "";
      const targetTotal = year ? o.investment.shares?.[year]?.total : undefined;
      const share = targetTotal ? stocks / targetTotal : undefined;
      const targetName = o.investment.name;
      const shareCell =
        share !== undefined
          ? `<div class="share"><span class="share-bar"><span style="width:${Math.min(100, share * 100).toFixed(
              1
            )}%"></span></span>${pf.format(share)}</div>`
          : "–";
      return `<tr><td><a href="/selskap/${escapeHtml(o.orgnr)}">${escapeHtml(
        targetName
      )}</a></td><td class="num stocks">${nf.format(stocks)}</td><td class="num">${shareCell}</td></tr>`;
    })
    .filter(Boolean)
    .join("\n");

  // importRoles appends without deduplication, so repeated imports can leave
  // duplicate role docs — collapse them by (type, holder) before rendering.
  const seenRoles = new Set<string>();
  const roleRows = [...roles]
    .sort((a, b) => roleRank(a.type) - roleRank(b.type))
    .map((r) => {
      const holderName = roleHolderName(r);
      if (!holderName) return "";
      const key = `${r.type}:${holderName}`;
      if (seenRoles.has(key)) return "";
      seenRoles.add(key);
      const unitOrgnr = r.holder?.unit?.orgnr;
      const holderCell =
        unitOrgnr && linkableOrgnrs.has(unitOrgnr)
          ? `<a href="/selskap/${escapeHtml(unitOrgnr)}">${escapeHtml(holderName)}</a>`
          : escapeHtml(holderName);
      return `<tr><td>${escapeHtml(roleLabel(r.type))}</td><td>${holderCell}</td></tr>`;
    })
    .filter(Boolean)
    .join("\n");

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
  const bucket = bucketForName(name);

  const body = `
    <nav class="crumbs"><a href="/">Aksjegrafen</a> <span aria-hidden="true">/</span> <a href="/selskaper">Selskaper</a> <span aria-hidden="true">/</span> <a href="/selskaper/${
      bucket.slug
    }">${escapeHtml(bucket.label)}</a> <span aria-hidden="true">/</span> <span>${escapeHtml(name)}</span></nav>

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
      investmentRows
        ? `<section class="card">
      <h2>Eierandeler i andre selskaper <span class="vintage">per 31.12.${year}</span></h2>
      <div class="table-wrap">
      <table>
        <thead><tr><th>Selskap</th><th class="num stocks">Aksjer</th><th class="num">Andel</th></tr></thead>
        <tbody>${investmentRows}</tbody>
      </table>
      </div>
    </section>`
        : ""
    }

    ${
      roleRows
        ? `<section class="card">
      <h2>Roller og ledelse <span class="vintage">fra Enhetsregisteret</span></h2>
      <div class="table-wrap">
      <table>
        <thead><tr><th>Rolle</th><th>Navn</th></tr></thead>
        <tbody>${roleRows}</tbody>
      </table>
      </div>
    </section>`
        : ""
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
