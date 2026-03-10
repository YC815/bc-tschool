import { PrismaClient } from "../app/generated/prisma/client";

// Prisma 7 requires accelerateUrl or adapter.
// DATABASE_URL should be a prisma:// Accelerate URL for production.
// Without it, API routes fall through try/catch silently.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Return a stub — runtime errors are caught in API route handlers
    return new PrismaClient({ accelerateUrl: "prisma://placeholder" });
  }
  return new PrismaClient({ accelerateUrl: url });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
