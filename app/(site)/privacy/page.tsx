import type { Metadata } from "next";
import {
  LegalPage,
  LegalHeading,
  LegalText,
  LegalList,
} from "@/components/legal-page";
import { company } from "@/lib/company-brain";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Capital Solutions & Logistics — how we collect, use, and protect information submitted through trustcsl.com.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 7, 2026">
      <LegalText>
        {company.name} (&ldquo;CSL,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;)
        respects your privacy. This policy explains what information we collect
        through our website and services, how we use it, and the choices you have.
      </LegalText>

      <LegalHeading>Information we collect</LegalHeading>
      <LegalList
        items={[
          "Contact details you provide through our forms (name, company, email, phone).",
          "Service request details (pickup/drop-off locations, service type, urgency, notes).",
          "Basic website usage data such as pages visited, collected to improve the site.",
        ]}
      />

      <LegalHeading>How we use information</LegalHeading>
      <LegalList
        items={[
          "To respond to quote and pickup requests and provide our services.",
          "To communicate with you about your requests and our services.",
          "To operate, maintain, and improve our website and operations.",
          "To meet legal, regulatory, and contractual obligations.",
        ]}
      />

      <LegalHeading>Protected health information (PHI)</LegalHeading>
      <LegalText>
        In the course of providing medical courier services, CSL may transport
        items containing protected health information. We handle PHI in accordance
        with HIPAA/HITECH and applicable agreements. See our{" "}
        <a href="/hipaa-notice" className="font-medium text-gold hover:underline">
          HIPAA Notice
        </a>{" "}
        for more.
      </LegalText>

      <LegalHeading>Sharing</LegalHeading>
      <LegalText>
        We do not sell your personal information. We may share information with
        service providers who help us operate, and where required by law or to
        fulfill a service you request.
      </LegalText>

      <LegalHeading>Data security</LegalHeading>
      <LegalText>
        We use reasonable administrative, technical, and physical safeguards to
        protect information. No method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </LegalText>

      <LegalHeading>Your choices</LegalHeading>
      <LegalText>
        You may contact us to access, correct, or request deletion of personal
        information you have provided, subject to legal and contractual limits.
      </LegalText>

      <LegalHeading>Contact</LegalHeading>
      <LegalText>
        Questions about this policy? Contact {company.contact.name} at{" "}
        <a href={company.contact.emailHref} className="font-medium text-gold hover:underline">
          {company.contact.email}
        </a>{" "}
        or {company.contact.phone}.
      </LegalText>
    </LegalPage>
  );
}
