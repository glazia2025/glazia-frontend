import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AdminProvider } from "@/contexts/AdminContext";
import CartSidebar from "@/components/CartSidebar";
import DataInitializer from "@/components/DataInitializer";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glazia - Premium Aluminium Profiles & Hardware Solutions",
  description: "Discover premium windoors profiles, window hardware, door hardware, and glazing solutions at Glazia. Your trusted partner for quality windoors systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-VVEW7G623L`}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AppProvider>
          <AdminProvider>
            <DataInitializer />
            <AnalyticsWrapper>
                {children}
            </AnalyticsWrapper>
            <CartSidebar />
          </AdminProvider>
        </AppProvider>
      </body>
    </html>
  );
}
