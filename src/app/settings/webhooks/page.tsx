import React from 'react';
import Button from '@/components/ui/Button';
import WebhookTable from '@/components/settings/WebhookTable';

export default function WebhooksPage() {
  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Webhooks</h1>
        <Button>Create new webhook</Button>
      </header>
      <WebhookTable />
    </div>
  );
}
