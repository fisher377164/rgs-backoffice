export type PageHeaderProps = { title: string; subtitle?: string; actions?: React.ReactNode };
export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-2 md:mb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
