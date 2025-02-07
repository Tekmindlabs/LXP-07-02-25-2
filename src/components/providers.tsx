"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/app/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
  session: Session | null;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
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
    </SessionProvider>
  );
}