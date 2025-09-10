"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Configuration", href: "/builder/configuration" },
  { name: "Game Preview", href: "/builder/game-preview" },
];

export default function BuilderTabs() {
  const pathname = usePathname();
  return (
    <nav className="overflow-x-auto border-b border-[var(--border)] bg-[var(--card-bg)]">
      <ul className="flex min-w-max tab-scroll">
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              className={cn(
                "inline-block px-4 py-2 text-sm font-medium whitespace-nowrap",
                pathname === tab.href
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {tab.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
