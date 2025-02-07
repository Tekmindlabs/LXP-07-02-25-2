import { Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <header className="container mx-auto px-4 py-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Shield className="h-8 w-8" />
        <span className="text-2xl font-bold">RBAC Starter</span>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {!isDashboard && (
          session ? (
            <UserNav />
          ) : (
            <Link href="/auth/signin">
              <Button size="lg">Sign In</Button>
            </Link>
          )
        )}
      </div>
    </header>
  );
}