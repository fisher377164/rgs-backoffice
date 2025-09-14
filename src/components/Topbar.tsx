'use client';

import { Menu, Search } from 'lucide-react';
import { useSidebar } from './Sidebar';

export default function Topbar() {
  const { setOpen } = useSidebar();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface px-4 shadow-sm md:px-6">
      <button
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center gap-2">
        <Search className="h-4 w-4 text-muted" />
        <input
          type="search"
          placeholder="Search"
          aria-label="Search"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted focus:outline-none"
        />
      </div>
      <div className="h-8 w-8 rounded-full bg-gray-200" aria-label="User avatar" />
    </header>
  );
}
