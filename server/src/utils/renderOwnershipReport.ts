import PDFDocument from "pdfkit";
import { GraphNode, OwnershipChain, OwnershipReport } from "../models/models";

// Renderers for the KYC/AML "eierskapskart" report. All copy is Norwegian and numbers use
// comma decimals; the CSV uses semicolons and a BOM so Norwegian Excel opens it correctly.

const RRR_THRESHOLD = 0.25;

const formatPct = (share: number) => `${(share * 100).toFixed(2).replace(".", ",")} %`;

const formatDate = (date: Date) =>
  `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;

const investorDetails = (investor: GraphNode) => {
  if (investor.properties.orgnr) return `Org.nr ${investor.properties.orgnr}`;
  return [
    investor.properties.yearOfBirth ? `Født ${investor.properties.yearOfBirth}` : undefined,
    investor.properties.location,
  ]
    .filter((part) => part)
    .join(", ");
};

const formatChain = (chain: OwnershipChain) =>
  chain.nodes
    .map((node, i) => (i === 0 ? node.name : `-> ${formatPct(chain.shares[i - 1])} -> ${node.name}`))
    .join(" ");

const sourceLines = (report: OwnershipReport) => [
  `Kilde: Skatteetatens aksjonærregister for ${report.year}, beholdning per 31.12.${report.year}. ` +
    `Registeret er basert på selskapenes egen innrapportering.`,
  `Effektiv eierandel er summen over alle eierskapskjeder (inntil ${report.maxDepth} ledd) av produktet av ` +
    `eierandelene i hvert ledd. Eiere med effektiv andel under ${formatPct(report.minShare)} er utelatt.`,
  `Rapporten er generert automatisk av aksjegrafen.com og er ikke juridisk rådgivning. Opplysningene må ` +
    `verifiseres mot primærkilder før bruk i kundetiltak etter hvitvaskingsloven.`,
];

export const renderOwnershipReportPdf = (report: OwnershipReport, stream: NodeJS.WritableStream) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(stream);

  const left = 50;
  const contentWidth = doc.page.width - 2 * left;
  const bottom = () => doc.page.height - 60;
  const ensureSpace = (needed: number) => {
    if (doc.y + needed > bottom()) doc.addPage();
  };

  doc.font("Helvetica-Bold").fontSize(18).text("Eierskapsrapport");
  doc.moveDown(0.3);
  doc.fontSize(13).text(report.company.name);
  doc.font("Helvetica").fontSize(10);
  if (report.company.orgnr) doc.text(`Org.nr ${report.company.orgnr}`);
  doc.moveDown(0.6);
  doc
    .fontSize(9)
    .text(`Eierandelsår: ${report.year} (beholdning per 31.12.${report.year})`)
    .text(`Generert: ${formatDate(new Date(report.generatedAt))} av aksjegrafen.com`);
  doc.moveDown(1);

  // Owners ranked by effective share.
  const columns = [
    { label: "Nr", x: left, width: 22, align: "left" as const },
    { label: "Navn", x: left + 25, width: 185, align: "left" as const },
    { label: "Detaljer", x: left + 215, width: 100, align: "left" as const },
    { label: "Direkte", x: left + 320, width: 55, align: "right" as const },
    { label: "Indirekte", x: left + 380, width: 55, align: "right" as const },
    { label: "Effektiv", x: left + 440, width: 55, align: "right" as const },
  ];
  doc.font("Helvetica-Bold").fontSize(12).text("Eiere etter effektiv eierandel");
  doc.moveDown(0.5);
  const headerY = doc.y;
  doc.fontSize(8);
  columns.forEach((column) =>
    doc.text(column.label, column.x, headerY, { width: column.width, align: column.align, lineBreak: false })
  );
  doc.moveTo(left, headerY + 12).lineTo(left + contentWidth, headerY + 12).stroke();
  doc.y = headerY + 16;
  doc.font("Helvetica").fontSize(9);
  report.investors.forEach((ownership, index) => {
    ensureSpace(16);
    const rowY = doc.y;
    const cells = [
      `${index + 1}`,
      ownership.investor.properties.name ?? "(uten navn)",
      investorDetails(ownership.investor),
      formatPct(ownership.directShare),
      formatPct(ownership.effectiveShare - ownership.directShare),
      formatPct(ownership.effectiveShare),
    ];
    columns.forEach((column, i) =>
      doc.text(cells[i], column.x, rowY, {
        width: column.width,
        align: column.align,
        lineBreak: false,
        ellipsis: true,
        height: 12,
      })
    );
    doc.y = rowY + 14;
  });
  doc.x = left;
  doc.moveDown(1.2);

  // Possible beneficial owners (reelle rettighetshavere) per the 25 % AML threshold.
  ensureSpace(60);
  doc.font("Helvetica-Bold").fontSize(12).text("Eiere med minst 25 % effektiv eierandel", left);
  doc.font("Helvetica").fontSize(9);
  doc.text(
    "Indikasjon på mulige reelle rettighetshavere etter hvitvaskingsloven § 14. Roller og annen kontroll enn eierskap inngår ikke i beregningen.",
    { width: contentWidth }
  );
  doc.moveDown(0.5);
  const rrrCandidates = report.investors.filter((ownership) => ownership.effectiveShare >= RRR_THRESHOLD);
  if (rrrCandidates.length === 0) {
    doc.text("Ingen enkelteiere med effektiv eierandel på minst 25 % ble funnet innenfor beregningsgrensene.", {
      width: contentWidth,
    });
  } else {
    rrrCandidates.forEach((ownership) => {
      ensureSpace(14);
      const details = investorDetails(ownership.investor);
      doc.text(
        `•  ${ownership.investor.properties.name}${details ? ` (${details})` : ""} — effektiv andel ${formatPct(
          ownership.effectiveShare
        )}, hvorav direkte ${formatPct(ownership.directShare)}`,
        { width: contentWidth }
      );
    });
  }
  doc.moveDown(1.2);

  // The documented chains for significant owners.
  ensureSpace(60);
  doc.font("Helvetica-Bold").fontSize(12).text("Eierskapskjeder", left);
  doc.font("Helvetica").fontSize(9);
  doc.text("Kjedene viser hvordan den effektive eierandelen oppstår, for eiere med minst 5 % effektiv andel.", {
    width: contentWidth,
  });
  doc.moveDown(0.5);
  if (report.investorChains.length === 0) {
    doc.text("Ingen eiere med minst 5 % effektiv eierandel innenfor beregningsgrensene.", { width: contentWidth });
  }
  report.investorChains.forEach(({ investor, effectiveShare, chains }) => {
    ensureSpace(30);
    doc
      .font("Helvetica-Bold")
      .text(`${investor.properties.name} — effektiv andel ${formatPct(effectiveShare)}`, { width: contentWidth });
    doc.font("Helvetica");
    chains.forEach((chain) => {
      ensureSpace(24);
      doc.text(`${formatChain(chain)}  (kjedens bidrag: ${formatPct(chain.product)})`, {
        width: contentWidth,
        indent: 10,
      });
    });
    doc.moveDown(0.5);
  });
  doc.moveDown(0.7);

  ensureSpace(90);
  doc.font("Helvetica-Bold").fontSize(10).text("Kilder og forbehold", left);
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(8);
  sourceLines(report).forEach((line) => {
    doc.text(line, { width: contentWidth });
    doc.moveDown(0.3);
  });

  doc.end();
};

const csvEscape = (value: string) => (/[;"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

const csvRow = (...cells: string[]) => cells.map(csvEscape).join(";");

export const renderOwnershipReportCsv = (report: OwnershipReport): string => {
  const lines: string[] = [];
  lines.push(csvRow("Eierskapsrapport", report.company.name));
  if (report.company.orgnr) lines.push(csvRow("Org.nr", report.company.orgnr));
  lines.push(csvRow("Eierandelsår", `${report.year} (beholdning per 31.12.${report.year})`));
  lines.push(csvRow("Generert", `${formatDate(new Date(report.generatedAt))} av aksjegrafen.com`));
  lines.push("");

  lines.push(csvRow("Eiere etter effektiv eierandel"));
  lines.push(
    csvRow(
      "Nr",
      "Navn",
      "Org.nr",
      "Fødselsår",
      "Sted",
      "Direkte andel",
      "Indirekte andel",
      "Effektiv andel",
      "Antall kjeder",
      "Korteste kjede (ledd)"
    )
  );
  report.investors.forEach((ownership, index) => {
    lines.push(
      csvRow(
        `${index + 1}`,
        ownership.investor.properties.name ?? "",
        ownership.investor.properties.orgnr ?? "",
        ownership.investor.properties.yearOfBirth ?? "",
        ownership.investor.properties.location ?? "",
        formatPct(ownership.directShare),
        formatPct(ownership.effectiveShare - ownership.directShare),
        formatPct(ownership.effectiveShare),
        `${ownership.pathCount}`,
        `${ownership.minDepth}`
      )
    );
  });
  lines.push("");

  lines.push(csvRow("Eierskapskjeder (eiere med minst 5 % effektiv andel)"));
  lines.push(csvRow("Eier", "Kjede", "Kjedens bidrag"));
  report.investorChains.forEach(({ investor, chains }) => {
    chains.forEach((chain) => {
      lines.push(csvRow(investor.properties.name ?? "", formatChain(chain), formatPct(chain.product)));
    });
  });
  lines.push("");

  sourceLines(report).forEach((line) => lines.push(csvRow(line)));

  // BOM so Norwegian Excel detects UTF-8 (æøå in names).
  return "\uFEFF" + lines.join("\r\n");
};
