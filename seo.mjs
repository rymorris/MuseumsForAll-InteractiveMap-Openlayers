// Centralized SEO / LLM-SEO helpers.
//
// Both the root index build (webpack.config.mjs) and the per-state build
// (buildStates.mjs) call buildSeo() so every generated page gets:
//   - a unique <title> + meta description
//   - a canonical URL + Open Graph / Twitter tags
//   - valid JSON-LD structured data (@graph: WebSite/WebApplication + ItemList
//     of museums + FAQPage + BreadcrumbList)
//   - a crawlable HTML "directory" of museums + an FAQ, so search engines and
//     LLM crawlers (which don't run JavaScript) can read the actual content.

const SITE = 'https://museumsforallmap.com';
const OG_IMAGE = `${SITE}/Red-Circle-Transparent.ico`;

// Display name: "New-York" -> "New York", "District-of-Columbia" -> "District of Columbia"
export function displayName(stateSlug) {
  return String(stateSlug || '').trim().replace(/-/g, ' ');
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// A phone string -> tel: href (digits and leading + only)
function telHref(phone) {
  const cleaned = String(phone || '').replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '';
}

function mapsHref(name, address) {
  const q = encodeURIComponent(`${name} ${address}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

// Shared FAQ used across every page (LLMs love clean Q/A pairs).
function faqItems(stateName, count) {
  const items = [];
  if (stateName) {
    items.push({
      q: `How many Museums for All locations are in ${stateName}?`,
      a: `There ${count === 1 ? 'is' : 'are'} ${count} participating Museums for All location${count === 1 ? '' : 's'} listed in ${stateName}, each offering free or reduced admission to EBT/SNAP cardholders.`,
    });
  }
  items.push(
    {
      q: 'What is Museums for All?',
      a: 'Museums for All is a national access program that encourages families receiving food assistance (SNAP) benefits to visit museums for free or a reduced fee. Participating museums offer free admission or admission for $3 or less per person (up to four people) upon presentation of a SNAP EBT card.',
    },
    {
      q: 'Who qualifies for free or reduced museum admission?',
      a: 'Anyone with a valid SNAP EBT (Electronic Benefits Transfer) card qualifies. Simply present your EBT card, usually along with a photo ID, at the participating museum\'s admissions desk.',
    },
    {
      q: 'How much does admission cost with an EBT card?',
      a: 'At participating Museums for All locations, admission is free or $3 or less per person for up to four people, depending on the museum.',
    },
    {
      q: 'Is this the official Museums for All website?',
      a: 'No. This is a free, independent, open-source map and is not affiliated with Museums for All, the Institute of Museum and Library Services (IMLS), the Association of Children\'s Museums (ACM), or SNAP/EBT. Always confirm current admission details with the museum directly.',
    }
  );
  return items;
}

// Build the JSON-LD @graph (returns a compact, VALID JSON string).
function buildJsonLd({ stateName, canonical, institutions, pageTitle, description }) {
  const graph = [];

  graph.push({
    '@type': stateName ? 'WebPage' : 'WebApplication',
    name: pageTitle,
    description,
    url: canonical,
    ...(stateName
      ? {}
      : {
          applicationCategory: 'TravelApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free or reduced-price museum admission for EBT recipients.',
          },
        }),
    isPartOf: { '@type': 'WebSite', name: 'Museums for All Map', url: `${SITE}/` },
  });

  if (institutions && institutions.length) {
    graph.push({
      '@type': 'ItemList',
      name: `Museums for All locations in ${stateName}`,
      numberOfItems: institutions.length,
      itemListElement: institutions.map((m, i) => {
        const museum = {
          '@type': 'Museum',
          name: m.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: m.address,
            addressRegion: stateName,
            addressCountry: 'US',
          },
        };
        if (m.phone) museum.telephone = m.phone;
        if (m.website) museum.url = m.website;
        if (m.coordinates && m.coordinates.latitude != null) {
          museum.geo = {
            '@type': 'GeoCoordinates',
            latitude: m.coordinates.latitude,
            longitude: m.coordinates.longitude,
          };
        }
        return { '@type': 'ListItem', position: i + 1, item: museum };
      }),
    });
  }

  const faqs = faqItems(stateName, institutions ? institutions.length : 0);
  graph.push({
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });

  const breadcrumb = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
  ];
  if (stateName) {
    breadcrumb.push({ '@type': 'ListItem', position: 2, name: 'States', item: `${SITE}/states.html` });
    breadcrumb.push({ '@type': 'ListItem', position: 3, name: stateName, item: canonical });
  }
  graph.push({ '@type': 'BreadcrumbList', itemListElement: breadcrumb });

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// Build the <head> SEO block (title, meta, canonical, OG/Twitter, JSON-LD, scoped styles).
export function buildSeoHead({ stateName = '', url = '', institutions = [] }) {
  const canonical = `${SITE}/${url}`.replace(/\/+$/, url ? '' : '/');
  const count = institutions.length;

  const pageTitle = stateName
    ? `${stateName} Museums for All — Free & Reduced EBT Admission (${count} Location${count === 1 ? '' : 's'})`
    : 'Museums for All Map — Free & Reduced Museum Admission with EBT';

  const description = stateName
    ? `Browse ${count} Museums for All location${count === 1 ? '' : 's'} in ${stateName} with free or reduced admission for SNAP EBT cardholders — addresses, phone numbers, and an interactive map.`
    : 'Find Museums for All locations across the U.S. with free or reduced admission for SNAP EBT cardholders. Search the interactive map by city, state, or ZIP code.';

  const keywords = [
    stateName ? `${stateName} museums` : 'museums for all',
    'Museums for All',
    'EBT museum discount',
    'free museum admission',
    'SNAP museum access',
    'reduced-price museums',
  ].join(', ');

  const jsonLd = buildJsonLd({ stateName, canonical, institutions, pageTitle, description });

  return `<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="keywords" content="${escapeHtml(keywords)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta property="og:site_name" content="Museums for All Map">
<meta property="og:title" content="${escapeHtml(pageTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(pageTitle)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<script type="application/ld+json">${jsonLd}</script>`;
}

// Build the crawlable body content: an intro, a museum directory, and an FAQ.
export function buildSeoContent({ stateName = '', url = '', urlPrefix = '', institutions = [] }) {
  const count = institutions.length;
  const scope = stateName || 'the United States';

  const intro = stateName
    ? `Below is a text directory of the ${count} Museums for All location${count === 1 ? '' : 's'} in ${escapeHtml(stateName)}. Each participating museum offers free or reduced admission (free or $3 or less per person, up to four people) when you present a SNAP EBT card. Map locations are approximate — use the Google Maps link for exact directions.`
    : 'Museums for All is a national initiative that offers free or reduced admission to visitors presenting a SNAP EBT card. Use the interactive map above to find participating museums near you, or browse the full directory by state.';

  const listHtml = institutions.length
    ? `<ul class="seo-directory__list">
${institutions
        .map((m) => {
          const name = escapeHtml(m.name);
          const address = escapeHtml(m.address);
          const tel = telHref(m.phone);
          const phoneLink = m.phone
            ? `<a href="${tel}">${escapeHtml(m.phone)}</a>`
            : '';
          const siteLink = m.website
            ? `<a href="${escapeHtml(m.website)}" rel="noopener nofollow" target="_blank">Website</a>`
            : '';
          const maps = `<a href="${escapeHtml(mapsHref(m.name, m.address))}" rel="noopener nofollow" target="_blank">Directions</a>`;
          const meta = [phoneLink, siteLink, maps].filter(Boolean).join(' &middot; ');
          return `<li class="seo-directory__item">
  <h3 class="seo-directory__name">${name}</h3>
  <p class="seo-directory__addr">${address}</p>
  <p class="seo-directory__links">${meta}</p>
</li>`;
        })
        .join('\n')}
</ul>`
    : `<p><a href="${urlPrefix}states.html">Browse Museums for All locations by state &rarr;</a></p>`;

  const faqs = faqItems(stateName, count);
  const faqHtml = `<h2 class="seo-directory__h2">Frequently Asked Questions</h2>
<dl class="seo-faq">
${faqs
    .map(
      (f) => `  <dt>${escapeHtml(f.q)}</dt>
  <dd>${escapeHtml(f.a)}</dd>`
    )
    .join('\n')}
</dl>`;

  const otherStates = stateName
    ? `<p class="seo-directory__more"><a href="${urlPrefix}states.html">See Museums for All locations in other states &rarr;</a></p>`
    : '';

  return `<section class="seo-directory" aria-label="Museums for All directory for ${escapeHtml(scope)}">
  <div class="seo-directory__inner">
    <h2 class="seo-directory__h2">Museums for All Locations in ${escapeHtml(stateName || 'the United States')}${
    stateName ? ` (${count})` : ''
  }</h2>
    <p class="seo-directory__intro">${intro}</p>
    ${listHtml}
    ${faqHtml}
    ${otherStates}
  </div>
</section>`;
}

// Scoped CSS for the directory (injected once into <head> via the template).
export const SEO_STYLES = `<style>
  body.has-seo-directory { overflow-y: auto; height: auto; min-height: 100dvh; }
  .seo-directory { background:#fff; color:#212529; padding:2.5rem 1rem 4rem; border-top:3px solid #d9534f; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height:1.55; }
  .seo-directory__inner { max-width:960px; margin:0 auto; }
  .seo-directory__h2 { font-size:1.6rem; margin:1.5rem 0 .75rem; }
  .seo-directory__intro { color:#495057; margin-bottom:1.5rem; }
  .seo-directory__list { list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; }
  .seo-directory__item { border:1px solid #e9ecef; border-radius:8px; padding:1rem; }
  .seo-directory__name { font-size:1.05rem; margin:0 0 .35rem; }
  .seo-directory__addr { margin:0 0 .5rem; color:#495057; font-size:.92rem; }
  .seo-directory__links { margin:0; font-size:.9rem; }
  .seo-directory__links a { color:#0d6efd; text-decoration:none; }
  .seo-directory__links a:hover { text-decoration:underline; }
  .seo-faq dt { font-weight:600; margin-top:1rem; }
  .seo-faq dd { margin:.25rem 0 0; color:#495057; }
  .seo-directory__more { margin-top:1.5rem; }
</style>`;
