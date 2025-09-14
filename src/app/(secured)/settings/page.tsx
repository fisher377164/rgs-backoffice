import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <Card>
        <p>Settings content goes here.</p>
      </Card>
    </div>
  );
}
