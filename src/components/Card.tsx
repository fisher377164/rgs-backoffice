export type CardProps = { title?: string; children: React.ReactNode; footer?: React.ReactNode };
export function Card({ title, children, footer }: CardProps) {
  return (
    <section className="rounded-2xl border border-border bg-surface shadow-card">
      {title && <header className="border-b border-border px-4 py-3 text-sm font-medium">{title}</header>}
      <div className="p-4">{children}</div>
      {footer && <footer className="border-t border-border px-4 py-3 text-sm text-muted">{footer}</footer>}
    </section>
  );
}
