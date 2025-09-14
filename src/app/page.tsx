import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Welcome" subtitle="Public landing page" />
      <Card>
        <p>This is the public home page.</p>
      </Card>
    </div>
  );
}
