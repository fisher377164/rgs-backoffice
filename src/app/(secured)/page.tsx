import PageHeader from '@/components/PageHeader';
import { Card } from '@/components/Card';

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" subtitle="Dashboard overview" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <Card key={i}>
            <p className="text-2xl font-semibold">123</p>
            <p className="text-sm text-muted">Metric {i}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Chart">
          <div className="flex h-64 items-center justify-center text-muted">Chart</div>
        </Card>
        <Card title="Activity">
          <ul className="space-y-2 text-sm">
            <li>User logged in</li>
            <li>Created project</li>
            <li>Updated settings</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
