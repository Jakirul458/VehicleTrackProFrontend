import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDir = resolve(process.cwd(), "dist");
const configuredUrl =
  process.env.VITE_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");

if (
  !process.env.VITE_SITE_URL &&
  !process.env.VERCEL_PROJECT_PRODUCTION_URL &&
  !process.env.VERCEL_URL
) {
  console.warn(
    "No production site URL configured; falling back to http://localhost:5173 for sitemap and canonical links.",
  );
}
let siteUrl;
try {
  const parsedUrl = new URL(
    /^https?:\/\//i.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`,
  );
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("URL must use HTTP or HTTPS.");
  }
  siteUrl = parsedUrl.origin;
} catch (error) {
  throw new Error(
    `Invalid site URL "${configuredUrl}". Set VITE_SITE_URL to a valid HTTP(S) origin.`,
    { cause: error },
  );
}
const publicPaths = ["/", "/about", "/contact", "/pricing", "/privacy-policy", "/terms-of-service"];
const escapeXml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...publicPaths.map((path) => `  <url><loc>${escapeXml(new URL(path, siteUrl).href)}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

await writeFile(resolve(outputDir, "sitemap.xml"), sitemap, "utf8");

const robotsPath = resolve(outputDir, "robots.txt");
const robots = await readFile(robotsPath, "utf8");
const robotsWithoutSitemap = robots.replace(/^Sitemap:.*\r?\n?/gim, "").trimEnd();
await writeFile(
  resolve(outputDir, "robots.txt"),
  `${robotsWithoutSitemap}\nSitemap: ${siteUrl}/sitemap.xml\n`,
  "utf8",
);

const indexPath = resolve(outputDir, "index.html");
let html = await readFile(indexPath, "utf8");
const homeUrl = new URL("/", siteUrl).href;
html = html.replace(
  "</head>",
  `  <link rel="canonical" href="${homeUrl}" />\n    <meta property="og:url" content="${homeUrl}" />\n  </head>`,
);

if (process.env.VITE_GOOGLE_SITE_VERIFICATION) {
  html = html.replace(
    "</head>",
    `    <meta name="google-site-verification" content="${process.env.VITE_GOOGLE_SITE_VERIFICATION}" />\n  </head>`,
  );
}
if (process.env.VITE_BING_SITE_VERIFICATION) {
  html = html.replace(
    "</head>",
    `    <meta name="msvalidate.01" content="${process.env.VITE_BING_SITE_VERIFICATION}" />\n  </head>`,
  );
}

await writeFile(indexPath, html, "utf8");

function setMeta(htmlContent, attribute, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta ${attribute}="${escapedKey}" content="[^"]*" \\/>`);
  const replacement = `<meta ${attribute}="${key}" content="${content}" />`;
  return pattern.test(htmlContent)
    ? htmlContent.replace(pattern, replacement)
    : htmlContent.replace("</head>", `    ${replacement}\n  </head>`);
}

const routePages = [
  {
    path: "/about",
    file: "about.html",
    title: "About VehicleTrack Pro | Insurance, Tax & PUC Management",
    description:
      "Learn how VehicleTrack Pro helps agents and vehicle service providers track insurance, road tax and PUC renewals.",
    keywords: "about VehicleTrack Pro, vehicle service software, insurance agent software",
    indexable: true,
  },
  {
    path: "/contact",
    file: "contact.html",
    title: "Contact VehicleTrack Pro | Support & Enquiries",
    description:
      "Contact VehicleTrack Pro for product information, account support and questions about insurance, tax and PUC document management.",
    indexable: true,
  },
  {
    path: "/pricing",
    file: "pricing.html",
    title: "Pricing | VehicleTrack Pro",
    description:
      "Compare annual Insurance, Road Tax and PUC subscription plans, including discounted service combinations.",
    keywords: "VehicleTrack Pro pricing, insurance tax PUC subscription plans",
    indexable: true,
  },
  {
    path: "/privacy-policy",
    file: "privacy-policy.html",
    title: "Privacy Policy | VehicleTrack Pro",
    description:
      "Learn how VehicleTrack Pro collects, uses, protects and retains account, customer and vehicle information.",
    indexable: true,
  },
  {
    path: "/terms-of-service",
    file: "terms-of-service.html",
    title: "Terms of Service | VehicleTrack Pro",
    description:
      "Read the terms for using VehicleTrack Pro vehicle document management and renewal reminder services.",
    indexable: true,
  },
  {
    path: "/login",
    file: "login.html",
    title: "Sign in | VehicleTrack Pro",
    description: "Sign in to your VehicleTrack Pro account.",
    indexable: false,
  },
  {
    path: "/signup",
    file: "signup.html",
    title: "Start your one-month free trial | VehicleTrack Pro",
    description: "Create an account and try Insurance, Tax and PUC tracking free for one month.",
    indexable: false,
  },
  {
    path: "/register",
    file: "register.html",
    title: "Start your one-month free trial | VehicleTrack Pro",
    description: "Create an account and try Insurance, Tax and PUC tracking free for one month.",
    indexable: false,
  },
];

for (const page of routePages) {
  const pageUrl = new URL(page.path, siteUrl).href;
  let pageHtml = html.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  pageHtml = setMeta(pageHtml, "name", "description", page.description);
  pageHtml = setMeta(pageHtml, "property", "og:title", page.title);
  pageHtml = setMeta(pageHtml, "property", "og:description", page.description);
  pageHtml = setMeta(pageHtml, "name", "twitter:title", page.title);
  pageHtml = setMeta(pageHtml, "name", "twitter:description", page.description);
  pageHtml = setMeta(
    pageHtml,
    "name",
    "robots",
    page.indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow",
  );
  pageHtml = setMeta(
    pageHtml,
    "name",
    "googlebot",
    page.indexable ? "index,follow,max-image-preview:large" : "noindex,nofollow",
  );

  if (page.indexable) {
    pageHtml = pageHtml
      .replace(
        /<link rel="canonical" href="[^"]*" \/>/,
        `<link rel="canonical" href="${pageUrl}" />`,
      )
      .replace(
        /<meta property="og:url" content="[^"]*" \/>/,
        `<meta property="og:url" content="${pageUrl}" />`,
      );
    if (page.keywords) pageHtml = setMeta(pageHtml, "name", "keywords", page.keywords);
  } else {
    pageHtml = pageHtml
      .replace(/\s*<link rel="canonical" href="[^"]*" \/>/, "")
      .replace(/\s*<meta property="og:url" content="[^"]*" \/>/, "");
  }

  await writeFile(resolve(outputDir, page.file), pageHtml, "utf8");
}
