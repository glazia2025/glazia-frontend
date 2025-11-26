"use client";

import { usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { pageview } from "@/utils/gtag";

interface AnalyticsWrapperProps {
  children: ReactNode;
}

export default function AnalyticsWrapper({ children }: AnalyticsWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
