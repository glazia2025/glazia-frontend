import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel - Glazia",
  description: "Admin panel for managing Glazia products, orders, and users",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
