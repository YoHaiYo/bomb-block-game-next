"use client";

import { usePathname } from "next/navigation";

export default function BodyWrapper({ children }) {
  const pathname = usePathname();

  const bodyClass = pathname?.startsWith("/bombblock")
    ? "overflow-y-hidden md:overflow-y-auto"
    : "";

  return <body className={bodyClass}>{children}</body>;
}
