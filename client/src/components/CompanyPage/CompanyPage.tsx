import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { AppContext } from "../../AppContext";
import { ICompany, IOwnership, Year } from "../../models/models";
import { useBrregEntityInfo } from "../../services/brregService";
import Loading from "../Loading";
import { CompanyJsonLd } from "./CompanyJsonLd";

interface CompanyPageData {
  company: ICompany;
  investors: (IOwnership & { investor?: { shareholder?: { id: string; name?: string; orgnr?: string } } })[];
  investments: (IOwnership & { investment?: ICompany | null })[];
  roles: { type: string; holder: { person?: { fornavn?: string; etternavn?: string }; unit?: { navn: string; orgnr: string } } }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[æ]/g, "ae")
    .replace(/[ø]/g, "o")
    .replace(/[å]/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CompanyPage = () => {
  const { orgnr } = useParams<{ orgnr: string; slug?: string }>();
  const { theme } = useContext(AppContext);
  const [data, setData] = useState<CompanyPageData>();
  const [loading, setLoading] = useState(true);
  const brregInfo = useBrregEntityInfo(orgnr);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/seo/company-page/${orgnr}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orgnr]);

  if (loading) return <Loading color={theme.primary} backgroundColor="transparent" />;

  if (!data?.company) {
    return (
      <div className="flex flex-col items-center justify-center w-full p-8">
        <h1 style={{ color: theme.text }} className="text-2xl font-bold">
          Selskap ikke funnet
        </h1>
        <p style={{ color: theme.muted }} className="mt-2">
          Fant ingen selskap med organisasjonsnummer {orgnr}
        </p>
        <Link to="/" style={{ color: theme.primary }} className="mt-4 underline">
          Tilbake til forsiden
        </Link>
      </div>
    );
  }

  const { company, investors, investments, roles } = data;
  const companyName = brregInfo?.navn ?? company.name;
  const description = `Se aksjonærer, eierstruktur og regnskap for ${companyName} (${orgnr}). Utforsk eierskapsnettverk og finn reelle rettighetshavere.`;
  const url = `https://aksjegrafen.no/selskap/${orgnr}/${slugify(companyName)}`;

  const latestYear = (Object.keys(company.shares ?? {}).sort().reverse()[0] ?? "2024") as unknown as Year;
  const latestShares = company.shares?.[latestYear];

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 sm:p-8 overflow-auto">
      <Helmet>
        <title>{companyName} – Aksjonærer og eierstruktur | Aksjegrafen</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${companyName} – Aksjegrafen`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${companyName} – Aksjegrafen`} />
        <meta name="twitter:description" content={description} />
        <link rel="canonical" href={url} />
      </Helmet>

      <CompanyJsonLd company={company} brregInfo={brregInfo} roles={roles} url={url} />

      {/* Header */}
      <header className="mb-6">
        <h1 style={{ color: theme.text }} className="text-2xl sm:text-3xl font-bold">
          {companyName}
        </h1>
        <p style={{ color: theme.muted }} className="text-sm mt-1">
          Org.nr: {orgnr}
          {brregInfo?.organisasjonsform?.beskrivelse && ` · ${brregInfo.organisasjonsform.beskrivelse}`}
          {brregInfo?.forretningsadresse?.poststed && ` · ${brregInfo.forretningsadresse.poststed}`}
        </p>
        {brregInfo?.naeringskode1 && (
          <p style={{ color: theme.muted }} className="text-sm">
            {brregInfo.naeringskode1.beskrivelse}
          </p>
        )}
        <Link to={`/?company=${orgnr}`} style={{ color: theme.primary }} className="text-sm mt-2 inline-block underline">
          Se i eiergrafen &rarr;
        </Link>
      </header>

      {/* Quick facts */}
      {(brregInfo?.antallAnsatte || brregInfo?.stiftelsesdato || latestShares) && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {brregInfo?.antallAnsatte ? (
            <Stat label="Ansatte" value={brregInfo.antallAnsatte.toLocaleString()} theme={theme} />
          ) : null}
          {brregInfo?.stiftelsesdato ? (
            <Stat label="Stiftet" value={new Date(brregInfo.stiftelsesdato).getFullYear().toString()} theme={theme} />
          ) : null}
          {latestShares ? (
            <Stat label="Aksjer" value={latestShares.total.toLocaleString()} theme={theme} />
          ) : null}
          {company.investorCount?.[latestYear] ? (
            <Stat label="Aksjonærer" value={company.investorCount[latestYear]!.toLocaleString()} theme={theme} />
          ) : null}
        </section>
      )}

      {/* Investors (shareholders) */}
      {investors.length > 0 && (
        <section className="mb-8">
          <h2 style={{ color: theme.text }} className="text-xl font-semibold mb-3">
            Aksjonærer
          </h2>
          <div style={{ ...theme.elevation }} className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: theme.backgroundSecondary }}>
                  <th style={{ color: theme.muted }} className="text-left p-3 font-medium">Navn</th>
                  <th style={{ color: theme.muted }} className="text-right p-3 font-medium">Aksjer</th>
                  <th style={{ color: theme.muted }} className="text-right p-3 font-medium">Andel</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv) => {
                  const name = inv.investor?.shareholder?.name ?? "Ukjent";
                  const shareholderOrgnr = inv.investor?.shareholder?.orgnr ?? inv.shareholderOrgnr;
                  const holdings = inv.holdings?.[latestYear];
                  const sharePercent = latestShares?.total
                    ? ((holdings?.total ?? 0) / latestShares.total * 100).toFixed(2)
                    : null;

                  return (
                    <tr key={inv._id} style={{ borderBottom: `1px solid ${theme.backgroundSecondary}` }}>
                      <td className="p-3" style={{ color: theme.text }}>
                        {shareholderOrgnr ? (
                          <Link
                            to={`/selskap/${shareholderOrgnr}/${slugify(name)}`}
                            style={{ color: theme.primary }}
                            className="underline"
                          >
                            {name}
                          </Link>
                        ) : (
                          name
                        )}
                      </td>
                      <td className="p-3 text-right" style={{ color: theme.text }}>
                        {holdings?.total?.toLocaleString() ?? "-"}
                      </td>
                      <td className="p-3 text-right" style={{ color: theme.text }}>
                        {sharePercent ? `${sharePercent}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Investments */}
      {investments.length > 0 && (
        <section className="mb-8">
          <h2 style={{ color: theme.text }} className="text-xl font-semibold mb-3">
            Investeringer
          </h2>
          <ul className="space-y-2">
            {investments.map((inv) => {
              const investmentName = inv.investment?.name ?? inv.orgnr;
              return (
                <li key={inv._id}>
                  <Link
                    to={`/selskap/${inv.orgnr}/${slugify(investmentName)}`}
                    style={{ color: theme.primary }}
                    className="underline text-sm"
                  >
                    {investmentName}
                  </Link>
                  <span style={{ color: theme.muted }} className="text-xs ml-2">
                    ({inv.orgnr})
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Roles / Board */}
      {roles.length > 0 && (
        <section className="mb-8">
          <h2 style={{ color: theme.text }} className="text-xl font-semibold mb-3">
            Roller
          </h2>
          <ul className="space-y-1">
            {roles.map((role, i) => {
              const holderName = role.holder.person
                ? `${role.holder.person.fornavn ?? ""} ${role.holder.person.etternavn ?? ""}`.trim()
                : role.holder.unit?.navn ?? "Ukjent";
              return (
                <li key={i} className="text-sm" style={{ color: theme.text }}>
                  <span style={{ color: theme.muted }} className="font-medium">
                    {role.type}
                  </span>{" "}
                  – {role.holder.unit?.orgnr ? (
                    <Link
                      to={`/selskap/${role.holder.unit.orgnr}/${slugify(holderName)}`}
                      style={{ color: theme.primary }}
                      className="underline"
                    >
                      {holderName}
                    </Link>
                  ) : (
                    holderName
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Footer link back */}
      <footer className="mt-auto pt-8 pb-4 text-center">
        <Link to="/" style={{ color: theme.primary }} className="underline text-sm">
          &larr; Tilbake til Aksjegrafen
        </Link>
      </footer>
    </div>
  );
};

const Stat = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <div style={{ ...theme.elevation, backgroundColor: theme.backgroundSecondary }} className="p-3 text-center">
    <p style={{ color: theme.muted }} className="text-xs font-medium">{label}</p>
    <p style={{ color: theme.text }} className="text-lg font-bold">{value}</p>
  </div>
);
