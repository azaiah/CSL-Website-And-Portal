import type { MetadataRoute } from "next";
import { company } from "@/lib/company-brain";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The portal is a private client tool — keep it out of search results.
        disallow: "/portal",
      },
    ],
    sitemap: `${company.url}/sitemap.xml`,
    host: company.url,
  };
}
