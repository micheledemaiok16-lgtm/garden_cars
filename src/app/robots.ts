import type { MetadataRoute } from "next";

// robots.txt generato da Next (file convention). Consente la scansione completa
// e indica la sitemap ai crawler.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.gardencars.it/sitemap.xml",
    host: "https://www.gardencars.it",
  };
}
