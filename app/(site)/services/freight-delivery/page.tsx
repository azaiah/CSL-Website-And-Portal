import type { Metadata } from "next";
import { ServiceDetail } from "@/components/service-detail";
import { serviceIcons } from "@/components/service-icons";
import { serviceContent } from "@/lib/service-content";
import { serviceLines } from "@/lib/company-brain";

const slug = "freight-delivery";
const line = serviceLines.find((s) => s.slug === slug)!;

export const metadata: Metadata = {
  title: "Freight & Delivery in Richmond, VA — Local Courier & Routes",
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
