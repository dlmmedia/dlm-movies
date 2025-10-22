import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

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
    default: 'DLM Movies — Discover, explore, and track films',
    template: '%s | DLM Movies'
  },
  description: 'DLM Movies - Your ultimate destination for discovering movies, curated collections, and personalized recommendations.',
  openGraph: {
    title: 'DLM Movies',
    description: 'Discover curated movie collections, trending films, and detailed information about your favorite movies.',
    url: '/',
    siteName: 'DLM Movies',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DLM Movies',
    description: 'Discover trending movies and curated collections.'
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
        <Header />
        {children}
      </body>
    </html>
  );
}
