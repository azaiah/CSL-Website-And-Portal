import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalText,
  LegalList,
} from "@/components/legal-page";
import { company } from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Capital Solutions & Logistics — the terms governing use of trustcsl.com and CSL's services.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 7, 2026">
      <LegalText>
        These Terms of Service govern your use of the {company.name} website and,
        where applicable, our services. By using this site you agree to these
        terms.
      </LegalText>

      <LegalHeading>Services</LegalHeading>
      <LegalText>
        CSL provides medical courier and related logistics services within our
        stated service area. Specific service scope, pricing, and service levels
        are set out in individual agreements or quotes.
      </LegalText>

      <LegalHeading>Use of this website</LegalHeading>
      <LegalList
        items={[
          "Use the site only for lawful purposes and as intended.",
          "Do not attempt to disrupt, misuse, or gain unauthorized access to the site.",
          "Information on the site is provided for general purposes and may change without notice.",
        ]}
      />

      <LegalHeading>Quotes and requests</LegalHeading>
      <LegalText>
        Requests submitted through the site are inquiries, not binding contracts.
        Service is confirmed by CSL directly. Estimated values and timelines are
        indicative until confirmed.
      </LegalText>

      <LegalHeading>Limitation of liability</LegalHeading>
      <LegalText>
        To the fullest extent permitted by law, CSL is not liable for indirect or
        consequential damages arising from use of this website. Liability for
        services is governed by the applicable service agreement.
      </LegalText>

      <LegalHeading>Intellectual property</LegalHeading>
      <LegalText>
        The CSL name, logo, and site content are the property of {company.name} and
        may not be used without permission.
      </LegalText>

      <LegalHeading>Contact</LegalHeading>
      <LegalText>
        Questions about these terms? Contact {company.contact.name} at{" "}
        <a href={company.contact.emailHref} className="font-medium text-gold hover:underline">
          {company.contact.email}
        </a>
        .
      </LegalText>
    </LegalPage>
  );
}
