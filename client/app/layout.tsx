import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:5173"),
  title: {
    default: "Rentify — Rent furniture, electronics and more",
    template: "%s · Rentify",
  },
  description:
    "Rent furniture, electronics, and home essentials from people nearby on flexible monthly plans. Rent better. Own less.",
  applicationName: "Rentify",
  keywords: ["rent", "rental marketplace", "furniture rental", "electronics rental", "India"],
  openGraph: {
    title: "Rentify — Rent furniture, electronics and more",
    description:
      "Rent furniture, electronics, and home essentials from people nearby on flexible monthly plans.",
    siteName: "Rentify",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rentify — Rent furniture, electronics and more",
    description: "Rent better. Own less.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-dvh antialiased`}
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
