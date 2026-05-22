import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust the reverse proxy (Replit's shared proxy / custom domain CDN) so that
// req.secure, req.ip, and Set-Cookie Secure flag all behave correctly over HTTPS.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use("/api", router);

// ── SEO files — served with explicit Content-Type so proxies and Google ──────
// don't treat them as text/plain. These routes must live outside /api so the
// reverse proxy can route /sitemap.xml and /robots.txt directly here.

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <url>
    <loc>https://tasvirnigor.com/</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/" />
  </url>

  <url>
    <loc>https://tasvirnigor.com/services</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/services" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/services" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/services" />
  </url>

  <url>
    <loc>https://tasvirnigor.com/portfolio</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/portfolio" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/portfolio" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/portfolio" />
  </url>

  <url>
    <loc>https://tasvirnigor.com/comics</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/comics" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/comics" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/comics" />
  </url>

  <url>
    <loc>https://tasvirnigor.com/team</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/team" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/team" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/team" />
  </url>

  <url>
    <loc>https://tasvirnigor.com/partners</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/partners" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/partners" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/partners" />
  </url>

  <url>
    <loc>https://tasvirnigor.com/contacts</loc>
    <lastmod>2026-05-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="https://tasvirnigor.com/contacts" />
    <xhtml:link rel="alternate" hreflang="ru" href="https://tasvirnigor.com/contacts" />
    <xhtml:link rel="alternate" hreflang="tg" href="https://tasvirnigor.com/contacts" />
  </url>

</urlset>`;

const ROBOTS_TXT = `User-agent: *
Allow: /

# Block admin panel from indexing
Disallow: /admin
Disallow: /admin/

# Sitemap
Sitemap: https://tasvirnigor.com/sitemap.xml
`;

app.get("/sitemap.xml", (_req, res) => {
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(SITEMAP_XML);
});

app.get("/robots.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(ROBOTS_TXT);
});

export default app;
