import { cn } from '@/lib/cn';

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
  widthClass?: string;
};

export function DataTable<T extends { id: string | number }>({ columns, data }: { columns: Column<T>[]; data: T[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn('px-4 py-2 font-medium text-muted', col.widthClass)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              {columns.map((col) => (
                <td key={String(col.key)} className={cn('px-4 py-2', col.widthClass)}>
                  {col.render ? col.render(row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
