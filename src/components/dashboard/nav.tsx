"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const role = pathname.split('/')[2]?.toUpperCase()?.replace(/-/g, '_');

  return (
    <nav className="flex items-center justify-between space-x-4 lg:space-x-6">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">
          Welcome, {session?.user?.name || 'User'}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </nav>
  );
}


