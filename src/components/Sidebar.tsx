'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gamepad2, Globe2, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

type SidebarState = { open: boolean; setOpen: (open: boolean) => void };
const SidebarContext = createContext<SidebarState | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

export default function Sidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();
  const links = [
    { href: '/(secured)', label: 'Overview', icon: LayoutDashboard },
    { href: '/(secured)/games', label: 'Games', icon: Gamepad2 },
    { href: '/(secured)/jurisdictions', label: 'Jurisdictions', icon: Globe2 },
    { href: '/(secured)/settings', label: 'Settings', icon: Settings },
  ];
  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-surface p-4 shadow-card transition-transform md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-6 text-xl font-semibold">Backoffice</div>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500',
                pathname === href ? 'bg-gray-900 text-white' : 'text-muted hover:bg-bg'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
