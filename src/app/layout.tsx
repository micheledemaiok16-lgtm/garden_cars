import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { site } from "@/lib/site";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Marchio "Garden's Cars": font Ethnocentric (auto-hostato) per il wordmark del logo.
const logo = localFont({
  src: "./fonts/Ethnocentric-Regular.otf",
  variable: "--font-logo",
  display: "swap",
});

const description =
  "Garden Cars a Giffoni Valle Piana (SA): vendita auto nuove e usate selezionate e servizio professionale di trattamento pelli e sedili. Passione su quattro ruote.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.gardencars.it"),
  title: {
    default: "Garden Cars, Concessionaria a Giffoni Valle Piana (SA)",
    template: "%s · Garden Cars",
  },
  description,
  keywords: [
    "concessionaria Giffoni Valle Piana",
    "auto nuove Salerno",
    "auto usate Salerno",
    "trattamento pelli auto",
    "rigenerazione sedili",
    "Garden Cars",
  ],
  authors: [{ name: "Garden Cars" }],
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://www.gardencars.it",
    siteName: "Garden Cars",
    title: "Garden Cars, Passione su quattro ruote",
    description,
    images: [
      {
        url: "/generated/hero.webp",
        width: 1200,
        height: 630,
        alt: "Garden Cars, showroom auto a Giffoni Valle Piana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Garden Cars, Passione su quattro ruote",
    description,
    images: ["/generated/hero.webp"],
  },
  icons: { icon: "/brand/logo.jpg", apple: "/brand/logo.jpg" },
  alternates: { canonical: "https://www.gardencars.it" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: site.name,
  description,
  image: "https://www.gardencars.it/generated/hero.webp",
  "@id": "https://www.gardencars.it",
  url: "https://www.gardencars.it",
  telephone: site.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: site.city,
    addressRegion: site.province,
    postalCode: "84095",
    addressCountry: "IT",
  },
  geo: { "@type": "GeoCoordinates", latitude: 40.7056, longitude: 14.945 },
  openingHours: ["Mo-Fr 09:00-13:00", "Mo-Fr 15:30-19:30", "Sa 09:00-13:00"],
  areaServed: "Campania",
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "Trattamento pelli e sedili",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${display.variable} ${body.variable} ${logo.variable}`}>
      <body className="min-h-screen bg-ink text-paper">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
