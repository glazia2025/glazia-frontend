import Link from "next/link";
import React from "react";

export function renderContent(text: string) {
  const regex = /\[\[(.*?)\|(.*?)\]\]/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, label, href] = match;

    // Link se pehle ka normal text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Clickable Link
    parts.push(
      <Link
        key={match.index}
        href={href}
        className="text-[#2563eb] font-medium hover:underline"
      >
        {label}
      </Link>
    );

    lastIndex = match.index + fullMatch.length;
  }
  parts.push(text.slice(lastIndex));

  return parts;
}