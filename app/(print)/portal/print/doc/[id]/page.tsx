import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  generatedDocuments,
  generatedDocById,
} from "@/lib/data/generated-docs";
import { PrintableDocument } from "@/components/portal/printable-document";
import { PrintControls, AutoPrint } from "@/components/portal/print-controls";

/**
 * Prerender every generated document so a print page is a static file rather
 * than a render on request — the tab has to be ready the instant it opens,
 * because ?auto=1 fires the print dialog on mount.
 */
export function generateStaticParams() {
  return generatedDocuments.map((d) => ({ id: d.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const doc = generatedDocById(params.id);
  return { title: doc ? doc.title : "Document not found" };
}

export default function PrintDocPage({ params }: { params: { id: string } }) {
  const doc = generatedDocById(params.id);
  if (!doc) notFound();

  return (
    <>
      {/* useSearchParams needs a Suspense boundary in a statically rendered
          route. */}
      <Suspense fallback={null}>
        <AutoPrint />
      </Suspense>
      <PrintControls
        backHref={
          doc.relatedOpportunityIds[0]
            ? `/portal/opportunities/${doc.relatedOpportunityIds[0]}`
            : "/portal/documents"
        }
      />
      <PrintableDocument document={doc} />
    </>
  );
}
