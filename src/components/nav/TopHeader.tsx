"use client";

import { usePathname } from "next/navigation";

export default function TopHeader() {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  let title = "";
  switch (segment) {
    case "builder":
      title = "Builder";
      break;
    default:
      title = "Dashboard";
  }
  return (
    <header className="h-14 flex items-center border-b border-[var(--border)] bg-[var(--card-bg)] px-6 text-sm font-medium">
      {title}
    </header>
  );
}
