import PageHeader from '@/components/PageHeader';
import { Tabs } from '@/components/Tabs';
import { DataTable, Column } from '@/components/DataTable';

interface Project {
  id: number;
  name: string;
  owner: string;
  status: string;
  updated: string;
}

const data: Project[] = [
  { id: 1, name: 'Project Alpha', owner: 'Alice', status: 'Active', updated: '2024-06-10' },
  { id: 2, name: 'Project Beta', owner: 'Bob', status: 'Archived', updated: '2024-05-01' },
  { id: 3, name: 'Project Gamma', owner: 'Carol', status: 'Active', updated: '2024-05-20' },
];

const columns: Column<Project>[] = [
  { key: 'name', header: 'Name' },
  { key: 'owner', header: 'Owner' },
  { key: 'status', header: 'Status' },
  { key: 'updated', header: 'Updated', widthClass: 'w-32' },
];

export default function GamesPage() {
  const tabs = [
    { id: 'all', label: 'All', content: <DataTable columns={columns} data={data} /> },
    { id: 'active', label: 'Active', content: <DataTable columns={columns} data={data.filter(d => d.status === 'Active')} /> },
    { id: 'archived', label: 'Archived', content: <DataTable columns={columns} data={data.filter(d => d.status === 'Archived')} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Games"
        actions={<button className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500">Create</button>}
      />
      <Tabs tabs={tabs} />
    </div>
  );
}
