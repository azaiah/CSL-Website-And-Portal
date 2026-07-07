import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalText,
  LegalList,
} from "@/components/legal-page";
import { company } from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "HIPAA Notice",
  description:
    "HIPAA Notice for Capital Solutions & Logistics — how CSL safeguards protected health information (PHI) during medical courier transport.",
};

export default function HipaaNoticePage() {
  return (
    <LegalPage title="HIPAA Notice" updated="July 7, 2026">
      <LegalText>
        {company.name} provides HIPAA-compliant medical courier services. When we
        transport items that contain protected health information (PHI), we treat
        that information with the confidentiality and safeguards required under the
        Health Insurance Portability and Accountability Act (HIPAA) and the HITECH
        Act.
      </LegalText>

      <LegalHeading>Our commitment</LegalHeading>
      <LegalList
        items={[
          "Personnel who handle PHI complete HIPAA/HITECH training.",
          "We maintain chain-of-custody and secure handling during transport.",
          "We limit access to PHI to what is necessary to provide the service.",
          "We follow exposure control, spill, and incident-reporting procedures.",
        ]}
      />

      <LegalHeading>Business Associate relationships</LegalHeading>
      <LegalText>
        Where CSL acts as a Business Associate of a covered entity, our
        responsibilities are governed by a Business Associate Agreement (BAA). We
        are prepared to enter into a BAA with healthcare clients as part of
        establishing service.
      </LegalText>

      <LegalHeading>Safeguards</LegalHeading>
      <LegalText>
        We apply administrative, physical, and technical safeguards appropriate to
        courier operations, including secure handling, trained personnel, and
        documented procedures for incidents involving PHI.
      </LegalText>

      <LegalHeading>Incident reporting</LegalHeading>
      <LegalText>
        In the event of a suspected or actual breach involving PHI, CSL follows
        established incident-reporting procedures and will notify the affected
        covered entity in accordance with applicable requirements and the governing
        agreement.
      </LegalText>

      <LegalHeading>Contact</LegalHeading>
      <LegalText>
        For HIPAA-related questions, contact {company.contact.name} at{" "}
        <a href={company.contact.emailHref} className="font-medium text-gold hover:underline">
          {company.contact.email}
        </a>{" "}
        or {company.contact.phone}. This notice is starter content and should be
        finalized with CSL&apos;s legal counsel and, where applicable, a Privacy
        Officer.
      </LegalText>
    </LegalPage>
  );
}
