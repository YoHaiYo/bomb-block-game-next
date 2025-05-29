"use client";

import { usePathname } from "next/navigation";

export default function BodyWrapper({ children }) {
  const pathname = usePathname();

  const bodyClass = pathname?.startsWith("/bombblock")
    ? "overflow-y-hiddenXXX md:overflow-y-autoXXX"
    : "";

  return <body className={`${bodyClass} overflow-x-hidden`}>{children}</body>;
}
