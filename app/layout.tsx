import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from '@/lib/providers/query-provider'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grocery PWA Platform",
  description: "Multi-tenant grocery platform with French and Arabic support for Algerian stores",
  manifest: "/manifest.json",
  keywords: [
    "grocery",
    "shopping",
    "Algeria",
    "Arabic",
    "French",
    "PWA",
    "delivery",
    "mobile"
  ],
  authors: [{ name: "Grocery PWA Platform" }],
  icons: {
    icon: "/images/icon-192x192.png",
    apple: "/images/icon-192x192.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#10B981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Grocery PWA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
          <ServiceWorkerRegistration />
        </QueryProvider>
      </body>
    </html>
  );
}
