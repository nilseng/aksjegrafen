import { Helmet } from "react-helmet-async";
import { ICompany } from "../../models/models";
import { IBrregUnit } from "../../services/brregService";

interface Props {
  company: ICompany;
  brregInfo?: IBrregUnit;
  roles: { type: string; holder: { person?: { fornavn?: string; etternavn?: string }; unit?: { navn: string; orgnr: string } } }[];
  url: string;
}

export const CompanyJsonLd = ({ company, brregInfo, roles, url }: Props) => {
  const address = brregInfo?.forretningsadresse;
  const founders = roles.filter((r) => r.type === "DAGL").map((r) => {
    if (r.holder.person) {
      return `${r.holder.person.fornavn ?? ""} ${r.holder.person.etternavn ?? ""}`.trim();
    }
    return r.holder.unit?.navn ?? "";
  }).filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brregInfo?.navn ?? company.name,
    url,
    identifier: company.orgnr,
  };

  if (address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: address.adresse?.join(", "),
      addressLocality: address.poststed,
      postalCode: address.postnummer,
      addressCountry: address.landkode ?? "NO",
    };
  }

  if (brregInfo?.stiftelsesdato) {
    jsonLd.foundingDate = brregInfo.stiftelsesdato;
  }

  if (brregInfo?.antallAnsatte) {
    jsonLd.numberOfEmployees = {
      "@type": "QuantitativeValue",
      value: brregInfo.antallAnsatte,
    };
  }

  if (brregInfo?.naeringskode1) {
    jsonLd.description = brregInfo.naeringskode1.beskrivelse;
  }

  if (founders.length > 0) {
    jsonLd.member = founders.map((name) => ({
      "@type": "Person",
      name,
      jobTitle: "Daglig leder",
    }));
  }

  if (brregInfo?.hjemmeside) {
    jsonLd.sameAs = /^https?:\/\//.test(brregInfo.hjemmeside)
      ? brregInfo.hjemmeside
      : `https://${brregInfo.hjemmeside}`;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};
