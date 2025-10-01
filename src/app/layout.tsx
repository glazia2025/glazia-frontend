import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import CartSidebar from "@/components/CartSidebar";
import DataInitializer from "@/components/DataInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Glazia - Premium Windoors Profiles & Hardware Solutions",
  description: "Discover premium windoors profiles, window hardware, door hardware, and glazing solutions at Glazia. Your trusted partner for quality windoors systems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AppProvider>
          <DataInitializer />
          {children}
          <CartSidebar />
        </AppProvider>
      </body>
    </html>
  );
}
