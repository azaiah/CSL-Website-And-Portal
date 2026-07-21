/**
 * lib/company-brain.ts
 * ---------------------------------------------------------------------------
 * Single source of truth for the Capital Solutions & Logistics (CSL) profile.
 * Consumed by the marketing site (content + SEO/JSON-LD) AND the Phase 1 portal
 * (Company Brain page + the AI agent registry). Keep all company facts here so
 * every surface stays consistent.
 * ---------------------------------------------------------------------------
 */

export type CredentialStatus = "active" | "registered" | "in-progress";

export interface Credential {
  label: string;
  short: string;
  description: string;
  status: CredentialStatus;
}

export interface Certification {
  label: string;
  reference?: string;
  description: string;
}

export interface CodeEntry {
  system: "NAICS" | "NIGP";
  code: string;
  label: string;
}

export interface ServiceLine {
  slug: string;
  name: string;
  short: string;
  summary: string;
}

export const company = {
  name: "Capital Solutions & Logistics",
  shortName: "CSL",
  legalNote: 'Capital Solutions & Logistics ("CSL")',
  founded: 2023,
  domain: "trustcsl.com",
  url: "https://trustcsl.com",
  tagline: "Let's work together to deliver better care — together.",
  promise: "On-time, every time.",
  positioning:
    "Reliable, compliant, professional — a trusted extension of your team.",
  description:
    "Professional medical & pharmaceutical courier providing HIPAA-compliant transport of medications, lab specimens, and medical supplies for pharmacies, clinical labs, hospitals, and healthcare facilities across Greater Richmond, Virginia.",
  serviceArea: {
    label: "Greater Richmond, Virginia",
    radiusMiles: 100,
    note: "Currently serving a ~100-mile radius around Richmond, VA — built to expand.",
    city: "Richmond",
    state: "VA",
    region: "Virginia",
  },
  contact: {
    name: "Darren Lewis",
    title: "Managing Member & Director of Operations",
    phone: "(757) 453-3831",
    phoneHref: "tel:+17574533831",
    email: "Info@trustcsl.com",
    emailHref: "mailto:info@trustcsl.com",
    hours: "Standard routes Mon–Fri, 7:00am–7:00pm. STAT & on-demand available 24/7.",
  },
  insurance:
    "Commercial auto liability plus cargo coverage, underwritten through Lloyd's of London.",
} as const;

/** Registrations & designations. Status is labeled honestly per the brief. */
export const credentials: Credential[] = [
  {
    label: "CAGE Code (SAM.gov)",
    short: "CAGE",
    description:
      "Commercial And Government Entity code assigned through SAM.gov — required to receive federal contracts and payments.",
    status: "active",
  },
  {
    label: "Unique Entity ID (UEI)",
    short: "UEI",
    description:
      "Federal Unique Entity Identifier registered in SAM.gov, replacing the legacy DUNS number.",
    status: "active",
  },
  {
    label: "eVA Registered (Virginia)",
    short: "eVA",
    description:
      "Registered supplier in Virginia's eVA electronic procurement marketplace, enabling state and local agency purchasing.",
    status: "registered",
  },
  {
    label: "USDOT Number",
    short: "USDOT",
    description:
      "U.S. Department of Transportation number registered for interstate and for-hire transport operations.",
    status: "active",
  },
  {
    label: "MC Authority",
    short: "MC",
    description:
      "Motor carrier operating authority for interstate and for-hire transport — application in progress.",
    status: "in-progress",
  },
  {
    label: "TSA PreCheck®",
    short: "TSA PreCheck",
    description:
      "Vetted traveler status supporting secure, expedited movement of personnel when travel is required.",
    status: "active",
  },
  {
    label: "TWIC®",
    short: "TWIC",
    description:
      "Transportation Worker Identification Credential — a TSA-vetted security credential for access to secure facilities and ports.",
    status: "active",
  },
  {
    label: "Chesterfield PInG",
    short: "PInG",
    description:
      "Chesterfield County Procurement Information Group registration for local government sourcing opportunities.",
    status: "registered",
  },
  {
    label: "SWaM (Virginia SBSD)",
    short: "SWaM",
    description:
      "Small, Women-owned, and Minority-owned business certification through the Virginia Department of Small Business & Supplier Diversity.",
    status: "in-progress",
  },
  {
    label: "Service-Disabled Veteran-Owned",
    short: "SDVOSB",
    description:
      "Service-Disabled Veteran-Owned small business designation — supports federal and state set-aside preferences.",
    status: "in-progress",
  },
  {
    label: "Minority-Owned Business",
    short: "MBE",
    description:
      "Minority-Owned Business designation supporting supplier-diversity and set-aside preferences.",
    status: "in-progress",
  },
];

/** Training & safety certifications the team maintains. */
export const certifications: Certification[] = [
  {
    label: "HIPAA / HITECH",
    description:
      "Privacy and security training for handling protected health information (PHI) throughout transport.",
  },
  {
    label: "OSHA Bloodborne Pathogens",
    reference: "29 CFR 1910.1030",
    description:
      "Safe handling of blood and other potentially infectious materials, including exposure controls.",
  },
  {
    label: "DOT HazMat",
    reference: "49 CFR 171–180",
    description:
      "Hazardous materials transport training covering classification, packaging, labeling, and documentation.",
  },
  {
    label: "Specimen Integrity & Transportation",
    description:
      "Proper packaging, temperature control, and handling to preserve diagnostic specimen viability.",
  },
  {
    label: "Exposure Control",
    description:
      "Procedures to prevent and respond to occupational exposure incidents during transport.",
  },
  {
    label: "Spill & Incident Reporting",
    description:
      "Containment, cleanup, and documentation protocols for spills and transport incidents.",
  },
  {
    label: "Chemotherapy & Hazardous-Drug Safe Handling",
    description:
      "Specialized handling of chemotherapy and other hazardous drugs to protect people and product.",
  },
];

/** Federal & state procurement codes. */
export const codes: CodeEntry[] = [
  { system: "NAICS", code: "492110", label: "Couriers & Express Delivery Services" },
  { system: "NAICS", code: "485991", label: "Special Needs Transportation (NEMT)" },
  { system: "NIGP", code: "962-86", label: "Transportation of Goods / Freight" },
  { system: "NIGP", code: "948-55", label: "Medical Transportation Services" },
];

/** The five service lines. Medical Courier is the flagship. */
export const serviceLines: ServiceLine[] = [
  {
    slug: "medical-courier",
    name: "Medical Courier",
    short: "HIPAA-compliant specimen, pharmacy & medical-supply transport.",
    summary:
      "Our flagship service: HIPAA-compliant transport of medications, lab specimens, and medical supplies with chain-of-custody, temperature control, and on-time delivery for pharmacies, labs, clinics, and hospitals.",
  },
  {
    slug: "freight-delivery",
    name: "Freight & Delivery",
    short: "Reliable local freight, parcel, and scheduled delivery routes.",
    summary:
      "Dependable freight and delivery across Greater Richmond — from single parcels to recurring routes — with the same professionalism and accountability as our medical work.",
  },
  {
    slug: "facilities-management",
    name: "Facilities Management",
    short: "Support services that keep healthcare and business sites running.",
    summary:
      "Facilities support that keeps clinical and commercial sites operating smoothly, coordinated by a partner who understands healthcare compliance and uptime.",
  },
  {
    slug: "workforce-solutions",
    name: "Workforce Solutions",
    short: "Vetted, trained personnel to scale your operation on demand.",
    summary:
      "Vetted, compliance-trained personnel to help healthcare and logistics operations scale — screened, credentialed, and ready to represent your standards.",
  },
  {
    slug: "warehouse-storage",
    name: "Secure Warehouse Storage",
    short: "Secure, organized storage for medical and business inventory.",
    summary:
      "Secure warehouse storage for medical supplies, equipment, and business inventory — organized, access-controlled, and integrated with our delivery network.",
  },
];

/** Trust badges shown on the home page strip (subset of credentials/certs). */
export const trustBadges: string[] = [
  "HIPAA / HITECH",
  "OSHA BBP",
  "DOT HazMat",
  "TWIC",
  "TSA PreCheck",
  "SAM / CAGE",
  "eVA",
  "SWaM",
];

/** Reusable capability-statement content (used by the portal Company Brain). */
export const capabilityStatement = {
  coreCompetencies: [
    "HIPAA-compliant medical & pharmaceutical courier",
    "Lab specimen transport with chain-of-custody",
    "STAT / on-demand & scheduled route delivery",
    "Temperature-controlled & HazMat-trained handling",
    "Proof-of-delivery and route accountability",
  ],
  differentiators: [
    "Local Richmond team with a compliance-first culture",
    "USDOT active; MC authority in progress — plus TWIC, TSA PreCheck, SAM/CAGE",
    "Lloyd's of London cargo & commercial auto coverage",
    "Small-business / diversity designations (SWaM, SDVOSB — in progress)",
    '"On-time, every time" service standard',
  ],
  pastPerformanceNote:
    "Founded 2023. Reference engagements available on request as CSL scales its healthcare-courier operations across Greater Richmond.",
};

export const helpers = {
  statusLabel(status: CredentialStatus): string {
    switch (status) {
      case "active":
        return "Active";
      case "registered":
        return "Registered";
      case "in-progress":
        return "In progress";
    }
  },
};
