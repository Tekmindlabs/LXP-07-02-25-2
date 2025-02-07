'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export const SystemMetrics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: async () => {
      // Fetch system metrics
      return {
        cpuUsage: '45%',
        memoryUsage: '60%',
        diskSpace: '75%',
        activeUsers: 234
      };
    }
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>CPU Usage: {data?.cpuUsage}</div>
          <div>Memory: {data?.memoryUsage}</div>
          <div>Disk: {data?.diskSpace}</div>
          <div>Active Users: {data?.activeUsers}</div>
        </div>
      </CardContent>
    </Card>
  );
};