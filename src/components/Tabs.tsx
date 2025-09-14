'use client';
import { useState, useRef } from 'react';
import { cn } from '@/lib/cn';

export type Tab = { id: string; label: string; content: React.ReactNode };
export function Tabs({ tabs, defaultId }: { tabs: Tab[]; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? tabs[0]?.id);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const newIndex = (idx + dir + tabs.length) % tabs.length;
      const newTab = tabs[newIndex];
      setActive(newTab.id);
      refs.current[newTab.id]?.focus();
    }
  };

  return (
    <div>
      <div role="tablist" className="flex border-b border-border">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            role="tab"
            ref={(el) => (refs.current[tab.id] = el)}
            tabIndex={active === tab.id ? 0 : -1}
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={cn(
              'px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500',
              active === tab.id
                ? 'border-b-2 border-brand-500 font-medium'
                : 'text-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
