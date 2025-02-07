import { PrismaClient, Prisma } from "@prisma/client";
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" 
      ? ['query', 'error', 'warn'] as Prisma.LogLevel[]
      : ['error'] as Prisma.LogLevel[],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;