"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DefaultRoles } from "@/utils/permissions";

const testCredentials = [
  {
    role: DefaultRoles.SUPER_ADMIN,
    email: "superadmin@example.com",
    password: "superadmin123",
  },
  {
    role: DefaultRoles.ADMIN,
    email: "admin@example.com",
    password: "admin123",
  },
  {
    role: DefaultRoles.PROGRAM_COORDINATOR,
    email: "coordinator@example.com",
    password: "coordinator123",
  },
  {
    role: DefaultRoles.TEACHER,
    email: "teacher@example.com",
    password: "teacher123",
  },
  {
    role: DefaultRoles.STUDENT,
    email: "student@example.com",
    password: "student123",
  },
  {
    role: DefaultRoles.PARENT,
    email: "parent@example.com",
    password: "parent123",
  },
];

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: searchParams.get("callbackUrl") || "/dashboard"
      });

      if (result?.error) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCredentials = (credentials: typeof testCredentials[0]) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <span className="text-muted-foreground">Test Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {testCredentials.map((cred) => (
                <Button
                  key={cred.role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestCredentials(cred)}
                >
                  {cred.role}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}