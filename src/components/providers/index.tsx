'use client';

import { AuthProvider } from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import { TRPCProvider } from "@/app/providers";
import { type Session } from "next-auth";

export function Providers({ 
  children,
  session 
}: { 
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <AuthProvider session={session}>
      <TRPCProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TRPCProvider>
    </AuthProvider>
  );
}
