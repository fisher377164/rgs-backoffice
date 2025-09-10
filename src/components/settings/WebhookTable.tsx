import React from 'react';
import Table from '@/components/ui/Table';

type Webhook = {
  id: number;
  name: string;
  url: string;
  triggers: string;
  status: 'Enabled' | 'Disabled';
};

const webhooks: Webhook[] = [
  {
    id: 1,
    name: 'Send email',
    url: 'https://example.com/email',
    triggers: 'entry.create',
    status: 'Enabled',
  },
  {
    id: 2,
    name: 'Indexing service',
    url: 'https://example.com/index',
    triggers: 'entry.update',
    status: 'Disabled',
  },
];

export default function WebhookTable() {
  const headers = ['Name', 'URL', 'Triggers', 'Status'];
  const rows = webhooks.map((w) => [w.name, w.url, w.triggers, w.status]);

  return <Table headers={headers} rows={rows} />;
}
