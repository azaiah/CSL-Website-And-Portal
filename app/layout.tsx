import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PageLoader } from "@/components/page-loader";
import { company } from "@/lib/company-brain";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: {
    default:
      "Capital Solutions & Logistics — Medical Courier in Richmond, VA",
    template: "%s | Capital Solutions & Logistics",
  },
  description: company.description,
  keywords: [
    "medical courier Richmond VA",
    "HIPAA specimen transport",
    "pharmacy delivery Richmond",
    "lab specimen courier Virginia",
    "medical delivery Richmond",
    "NEMT Virginia",
  ],
  authors: [{ name: company.name }],
  applicationName: company.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: company.url,
    siteName: company.name,
    title: "Capital Solutions & Logistics — Medical Courier in Richmond, VA",
    description: company.description,
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: company.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capital Solutions & Logistics — Medical Courier in Richmond, VA",
    description: company.description,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.description,
    url: company.url,
    telephone: company.contact.phone,
    email: company.contact.email,
    slogan: company.promise,
    foundingDate: String(company.founded),
    areaServed: {
      "@type": "City",
      name: "Richmond",
      address: { "@type": "PostalAddress", addressRegion: "VA", addressCountry: "US" },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Richmond",
      addressRegion: "VA",
      addressCountry: "US",
    },
    knowsAbout: [
      "Medical courier",
      "HIPAA-compliant specimen transport",
      "Pharmacy delivery",
      "Non-emergency medical transportation",
    ],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Medical Courier" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Freight & Delivery" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Facilities Management" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Workforce Solutions" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Secure Warehouse Storage" } },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
