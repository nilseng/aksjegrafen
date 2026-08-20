import { baseUrl } from "../config";

/**
 * Shared chrome for the server-rendered SEO pages (/selskap/:orgnr and the
 * /selskaper browse hubs): one self-contained HTML response per page — inline
 * CSS, same-origin logo only — carrying the Aksjegrafen brand (neumorphic
 * cards, teal accents).
 */

export const nf = new Intl.NumberFormat("nb-NO");
export const cf = new Intl.NumberFormat("nb-NO", { notation: "compact", maximumFractionDigits: 1 });
export const pf = new Intl.NumberFormat("nb-NO", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const escapeHtml = (value: string | number | undefined | null): string =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );

/**
 * Alphabet buckets for the /selskaper browse hubs. Registry names are
 * uppercase, so bucket regexes are case-sensitive simple prefixes that use the
 * companies name index; "andre" catches everything not starting with A–Å.
 */
export interface LetterBucket {
  slug: string;
  label: string;
  pattern: string;
}

export const letterBuckets: LetterBucket[] = [
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({ slug: c.toLowerCase(), label: c, pattern: `^${c}` })),
  { slug: "ae", label: "Æ", pattern: "^Æ" },
  { slug: "oe", label: "Ø", pattern: "^Ø" },
  { slug: "aa", label: "Å", pattern: "^Å" },
  { slug: "andre", label: "0–9 og andre", pattern: "^[^A-ZÆØÅ]" },
];

export const bucketForName = (name: string): LetterBucket => {
  const first = (name?.[0] ?? "").toUpperCase();
  return letterBuckets.find((b) => b.label === first) ?? letterBuckets[letterBuckets.length - 1];
};

export const renderShell = ({
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

  .letter-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .letter-grid a {
    display: inline-block;
    background: var(--card);
    border-radius: 8px;
    box-shadow: var(--card-shadow);
    padding: 0.45rem 0.85rem;
    font-weight: 600;
  }
  .company-list { list-style: none; margin: 0; padding: 0; columns: 2; column-gap: 2rem; }
  .company-list li { margin: 0 0 0.35rem; break-inside: avoid; }
  @media (max-width: 600px) { .company-list { columns: 1; } }
  .pager { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.9rem; }

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

export const renderNotFoundPage = ({ title, message }: { title: string; message: string }): string =>
  renderShell({
    title,
    description: message,
    canonicalPath: null,
    body: `<section class="card hero">
      <h1>${escapeHtml(title.replace(/ \| Aksjegrafen$/, ""))}</h1>
      <p>${escapeHtml(message)}</p>
      <p><a class="cta" href="/">Søk i Aksjegrafen →</a></p>
    </section>`,
  });
