import type { MetadataRoute } from "next";
import { company, serviceLines } from "@/lib/company-brain";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.url;
  const now = new Date();

  const staticPaths = [
    "",
    "/services",
    "/compliance",
    "/about",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
    "/hipaa-notice",
    "/portal",
  ];

  const servicePaths = serviceLines.map((s) => `/services/${s.slug}`);

  return [...staticPaths, ...servicePaths].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/services") ? 0.8 : 0.6,
  }));
}
