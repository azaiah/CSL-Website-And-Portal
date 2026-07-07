import type { Metadata } from "next";
import { ServiceDetail } from "@/components/service-detail";
import { serviceIcons } from "@/components/service-icons";
import { serviceContent } from "@/lib/service-content";
import { serviceLines } from "@/lib/company-brain";

const slug = "workforce-solutions";
const line = serviceLines.find((s) => s.slug === slug)!;

export const metadata: Metadata = {
  title: "Workforce Solutions — Vetted, Compliance-Trained Personnel",
  description: line.summary,
};

export default function Page() {
  return (
    <ServiceDetail
      slug={slug}
      name={line.name}
      icon={serviceIcons[slug]}
      content={serviceContent[slug]}
    />
  );
}
