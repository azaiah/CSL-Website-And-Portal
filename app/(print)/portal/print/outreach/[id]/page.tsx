import { Suspense } from "react";
import { notFound } from "next/navigation";
import { outreach } from "@/lib/data/outreach";
import { PrintableOutreach } from "@/components/portal/printable-document";
import { PrintControls, AutoPrint } from "@/components/portal/print-controls";

/** Prerender every outreach record — same reasoning as the document route. */
export function generateStaticParams() {
  return outreach.map((r) => ({ id: r.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const record = outreach.find((r) => r.id === params.id);
  return { title: record ? record.subject : "Outreach not found" };
}

export default function PrintOutreachPage({
  params,
}: {
  params: { id: string };
}) {
  const record = outreach.find((r) => r.id === params.id);
  if (!record) notFound();

  return (
    <>
      <Suspense fallback={null}>
        <AutoPrint />
      </Suspense>
      <PrintControls
        backHref={`/portal/opportunities/${record.opportunityId}`}
      />
      <PrintableOutreach record={record} />
    </>
  );
}
