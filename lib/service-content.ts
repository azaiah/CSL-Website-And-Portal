/**
 * lib/service-content.ts
 * ---------------------------------------------------------------------------
 * Rich content for the four supporting service pages (Medical Courier has its
 * own bespoke page). Keyed by slug. Drawn from the CSL company facts.
 * ---------------------------------------------------------------------------
 */

export interface ServiceDetailContent {
  eyebrow: string;
  lead: string;
  intro: string;
  features: { title: string; body: string }[];
  bullets: string[];
  closingTitle: string;
  closingSubtitle: string;
}

export const serviceContent: Record<string, ServiceDetailContent> = {
  "freight-delivery": {
    eyebrow: "Freight & Delivery",
    lead: "Dependable local freight, parcel, and scheduled delivery across Greater Richmond — with the accountability of a medical-grade courier.",
    intro:
      "The discipline we bring to healthcare transport carries straight into general freight and delivery. Whether it's a single time-critical parcel or a recurring multi-stop route, CSL moves it with tracked hand-offs, professional drivers, and communication you can count on.",
    features: [
      {
        title: "Local & regional delivery",
        body: "Same-day and scheduled runs throughout Richmond, Henrico, Chesterfield, Hanover, and surrounding areas.",
      },
      {
        title: "Recurring routes",
        body: "Set-and-forget scheduled routes with consistent drivers who learn your sites and standards.",
      },
      {
        title: "Careful handling",
        body: "From fragile items to sensitive documents, cargo is handled with the same care as our medical work.",
      },
      {
        title: "Proof & tracking",
        body: "Delivery confirmation and clear communication so you always know a shipment's status.",
      },
    ],
    bullets: [
      "Single-parcel to full-route freight",
      "Same-day and scheduled options",
      "Insured under Lloyd's of London cargo coverage",
      "Professional, background-checked drivers",
      "Clear proof-of-delivery workflow",
    ],
    closingTitle: "Freight you can set your clock by",
    closingSubtitle: "Tell us the pickup, drop-off, and timing — we'll quote it fast.",
  },
  "facilities-management": {
    eyebrow: "Facilities Management",
    lead: "Support services that keep healthcare and business sites running — coordinated by a partner who understands compliance and uptime.",
    intro:
      "Clinical and commercial facilities can't afford downtime or disorganization. CSL provides coordinated facilities support so your team can focus on care and core operations, with a partner that already lives inside healthcare's standards.",
    features: [
      {
        title: "Coordinated support",
        body: "A single point of accountability for the facility tasks that keep your site operating smoothly.",
      },
      {
        title: "Healthcare-aware",
        body: "We understand HIPAA environments, access control, and the uptime clinical operations demand.",
      },
      {
        title: "Reliable scheduling",
        body: "Recurring and on-call support aligned to your operating hours and priorities.",
      },
      {
        title: "Professional team",
        body: "Vetted, compliance-trained personnel who represent your standards on-site.",
      },
    ],
    bullets: [
      "Site support coordinated to your schedule",
      "Compliance-aware, access-controlled operations",
      "Recurring and on-call availability",
      "Single accountable point of contact",
      "Integrated with CSL's courier and storage lines",
    ],
    closingTitle: "Keep your facility running smoothly",
    closingSubtitle: "Let's scope the support your site needs.",
  },
  "workforce-solutions": {
    eyebrow: "Workforce Solutions",
    lead: "Vetted, compliance-trained personnel to help healthcare and logistics operations scale on demand.",
    intro:
      "When demand spikes or a route needs covering, you need people you can trust immediately. CSL supplies screened, credentialed personnel who are trained to healthcare and transport standards — ready to represent your operation from day one.",
    features: [
      {
        title: "Screened & credentialed",
        body: "Background-checked personnel with the compliance training healthcare and logistics work requires.",
      },
      {
        title: "Scale on demand",
        body: "Flex capacity up for seasonal peaks, new routes, or coverage gaps without long lead times.",
      },
      {
        title: "Trained to standard",
        body: "HIPAA, OSHA bloodborne-pathogen, and safe-handling awareness built into onboarding.",
      },
      {
        title: "Ready to represent you",
        body: "Professional people who understand they're an extension of your brand and standards.",
      },
    ],
    bullets: [
      "Vetted, background-checked personnel",
      "Compliance and safe-handling trained",
      "Flexible, on-demand scaling",
      "Healthcare and logistics experience",
      "Managed and accountable to CSL",
    ],
    closingTitle: "Scale your team without the risk",
    closingSubtitle: "Tell us the roles and volume — we'll build the plan.",
  },
  "warehouse-storage": {
    eyebrow: "Secure Warehouse Storage",
    lead: "Secure, organized storage for medical supplies, equipment, and business inventory — integrated with our delivery network.",
    intro:
      "Storage shouldn't be a black box. CSL provides secure, access-controlled warehouse space that's organized, documented, and connected to our courier operation — so items are protected while stored and moving the moment you need them delivered.",
    features: [
      {
        title: "Access-controlled",
        body: "Secure facilities with controlled access to protect medical supplies and business inventory.",
      },
      {
        title: "Organized & documented",
        body: "Structured storage with clear records so you always know what's on hand and where.",
      },
      {
        title: "Delivery-integrated",
        body: "Stored items plug directly into CSL's courier network for fast, compliant distribution.",
      },
      {
        title: "Flexible capacity",
        body: "Space that scales with your inventory needs, without long-term overcommitment.",
      },
    ],
    bullets: [
      "Secure, access-controlled facilities",
      "Organized, documented inventory",
      "Integrated with CSL delivery routes",
      "Suitable for medical supplies & equipment",
      "Flexible, scalable capacity",
    ],
    closingTitle: "Storage that's ready to move",
    closingSubtitle: "Let's size the secure space your inventory needs.",
  },
};
