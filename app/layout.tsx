import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { SelectionProvider } from "@/components/SelectionContext";
import SelectionBar from "@/components/SelectionBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap'
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dlmmovies.com'),
  title: {
    default: 'DLM Screenwriter — AI-Powered Screenplay Generator',
    template: '%s | DLM Screenwriter'
  },
  description: 'DLM Screenwriter - Create professional screenplays powered by AI. Select movie references, generate scripts, cast, and posters.',
  openGraph: {
    title: 'DLM Screenwriter',
    description: 'AI-powered screenplay generator. Create professional scripts inspired by your favorite films.',
    url: '/',
    siteName: 'DLM Screenwriter',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DLM Screenwriter',
    description: 'AI-powered screenplay generator. Create professional scripts.'
  },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  robots: { index: true, follow: true }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
        <SelectionProvider>
          <Header />
          {children}
          <SelectionBar />
        </SelectionProvider>
      </body>
    </html>
  );
}
