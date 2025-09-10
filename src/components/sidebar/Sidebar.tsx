"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Hammer,
  Users,
  Settings,
  ChevronDown,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItemClass = (href: string) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400",
      pathname === href && "bg-gray-800",
      collapsed && "justify-center"
    );

  return (
    <aside
      className={cn(
        "flex flex-col bg-[var(--sidebar-bg)] text-[var(--sidebar-foreground)]", // base style
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-800">
        <span className={cn("font-semibold", collapsed && "sr-only")}>RGS Back Office</span>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-gray-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4 text-sm">
        <ul className="space-y-1">
          <li>
            <Link href="#" className={navItemClass("/dashboard")} aria-disabled>
              <LayoutDashboard className="h-4 w-4" />
              {!collapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className="mt-4 text-xs uppercase tracking-wide text-gray-400 px-3">
            {!collapsed && "Builder"}
          </li>
          <li>
            <Link
              href="/builder/configuration"
              className={navItemClass("/builder/configuration")}
            >
              <Hammer className="h-4 w-4" />
              {!collapsed && <span>Configuration</span>}
            </Link>
          </li>
          <li>
            <Link
              href="/builder/game-preview"
              className={navItemClass("/builder/game-preview")}
            >
              <Hammer className="h-4 w-4" />
              {!collapsed && <span>Game Preview</span>}
            </Link>
          </li>
          <li className="mt-4">
            <button
              disabled
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm opacity-50 cursor-not-allowed",
                collapsed && "justify-center"
              )}
              aria-disabled="true"
            >
              <Users className="h-4 w-4" />
              {!collapsed && <span>Users & Roles</span>}
            </button>
          </li>
          <li className="mt-4">
            <div
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-400",
                collapsed && "justify-center"
              )}
            >
              <Settings className="h-4 w-4" />
              {!collapsed && <span>Settings</span>}
              {!collapsed && <ChevronDown className="ml-auto h-4 w-4" />}
            </div>
          </li>
        </ul>
      </nav>
      <div className="border-t border-gray-800 p-4">
        <DropdownMenu
          label={
            <div
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-gray-800",
                collapsed && "justify-center"
              )}
            >
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-700 text-sm font-medium">
                AV
              </div>
              {!collapsed && (
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">Andrii Vdovychenko</span>
                  <span className="text-xs text-gray-400">Admin</span>
                </div>
              )}
              {!collapsed && <ChevronDown className="ml-auto h-4 w-4" />}
            </div>
          }
        >
          <DropdownMenuItem onSelect={() => {}}>Profile</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => {}}>Logout</DropdownMenuItem>
        </DropdownMenu>
      </div>
    </aside>
  );
}
