import { Card } from "@/components/ui/card";

export function SystemMetrics() {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">System Metrics</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4 rounded-lg">
          <h3 className="text-sm text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h3 className="text-sm text-muted-foreground">API Health</h3>
          <p className="text-2xl font-bold">--</p>
        </div>
        <div className="border p-4 rounded-lg">
          <h3 className="text-sm text-muted-foreground">Uptime</h3>
          <p className="text-2xl font-bold">--</p>
        </div>
      </div>
    </Card>
  );
}
