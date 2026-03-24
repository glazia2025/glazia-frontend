import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aluminium Window & Door Profiles | Glazia",
  description:
    "Premium aluminium window and door profiles for modern architectural projects. High quality aluminium fenestration systems by Glazia.",
  keywords: [
    "aluminium window profiles",
    "aluminium door profiles",
    "aluminium profiles India",
    "sliding window profiles"
  ]
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}