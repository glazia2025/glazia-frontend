import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AdminProvider } from "@/contexts/AdminContext";
import CartSidebar from "@/components/CartSidebar";
import DataInitializer from "@/components/DataInitializer";
import UserDataRefresher from "@/components/UserDataRefresher";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})


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
        className={`${inter.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AppProvider>
          <AdminProvider>
            <DataInitializer />
            <UserDataRefresher />
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
