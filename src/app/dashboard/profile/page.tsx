"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={session.user.name || ""} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session.user.email || ""} disabled />
            </div>
          </div>

          <div>
            <Label>Roles</Label>
            <div className="flex gap-2 mt-2">
              {session.user.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {session.user.permissions.map((permission) => (
                <Badge key={permission} variant="outline">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button>Update Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}