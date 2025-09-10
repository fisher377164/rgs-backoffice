import React from 'react';

type TableProps = {
  headers: string[];
  rows: React.ReactNode[][];
};

export default function Table({ headers, rows }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, idx) => (
            <tr key={idx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2 text-sm text-gray-900">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
