import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { DefaultRoles } from "@/utils/permissions";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Overview } from "@/components/dashboard/coordinator/overview";
import { RecentActivities } from "@/components/dashboard/coordinator/recent-activities";
import { PerformanceMetrics } from "@/components/dashboard/coordinator/performance-metrics";

export default async function DashboardPage({
  params,
}: {
  params: { role: string };
}) {
  const session = await getServerAuthSession();
  const roleParam = await Promise.resolve(params.role);
  
  // Normalize the role to uppercase and replace hyphens with underscores
  const normalizedRole = roleParam.toUpperCase().replace(/-/g, '_');
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user has the required role (case-insensitive)
  const userRoles = session.user.roles.map(r => r.toLowerCase());
  if (!userRoles.includes(roleParam.toLowerCase())) {
    redirect(`/dashboard/${session.user.roles[0]}`);
  }


  // If the role is coordinator, render the coordinator dashboard
  if (roleParam.toLowerCase() === 'coordinator') {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Program Coordinator Dashboard</h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Class Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">48</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,300</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivities />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceMetrics />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 grid-cols-1">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention Required</AlertTitle>
                <AlertDescription>
                  There are 3 classes with below-average performance metrics that need attention.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            {/* Analytics content will be implemented later */}
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            {/* Reports content will be implemented later */}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // For other roles, render the default dashboard content
  return <DashboardContent role={normalizedRole as keyof typeof DefaultRoles} />;
}
