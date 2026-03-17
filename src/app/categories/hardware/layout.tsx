import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aluminium Window Hardware | Glazia",
  description:
    "Explore premium aluminium window and door hardware including handles, hinges, locking systems and accessories.",
  keywords: [
    "window hardware",
    "aluminium window handles",
    "window locking systems",
    "aluminium hardware India"
  ]
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}