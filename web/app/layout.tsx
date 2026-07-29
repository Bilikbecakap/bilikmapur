import type { Metadata } from "next";
import { Baloo_2, Lora } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Bilik Mapur — Digitalisasi Bahasa Daerah",
    template: "%s · Bilik Mapur",
  },
  description:
    "Ruang digital untuk mempelajari, mendokumentasikan, dan mewariskan bahasa serta budaya masyarakat adat Mapur, Pulau Bangka.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${baloo.variable} ${lora.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
