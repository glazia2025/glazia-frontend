import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aluminium Railing Systems | Glazia",
  description:
    "Modern aluminium railing systems for balconies, staircases and architectural spaces.",
  keywords: [
    "aluminium railings",
    "glass railing systems",
    "balcony railings",
    "aluminium railing India"
  ]
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}