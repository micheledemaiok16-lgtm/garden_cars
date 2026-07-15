import type { MetadataRoute } from "next";

// sitemap.xml generato da Next (file convention). Elenca le pagine indicizzabili
// del sito. Aggiornare qui se si aggiungono nuove route.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.gardencars.it";
  const lastModified = new Date();
  return [
    {
      url: base,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/trattamenti`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
