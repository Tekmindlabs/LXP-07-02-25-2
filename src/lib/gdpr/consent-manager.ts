import { prisma } from '@/server/db';

export async function saveConsentPreferences(
  userId: string,
  preferences: ConsentPreferences
) {
  return prisma.userConsent.upsert({
    where: { userId },
    update: {
      ...preferences,
      updatedAt: new Date(),
    },
    create: {
      userId,
      ...preferences,
    },
  });
}

export async function getConsentPreferences(
  userId: string
): Promise<ConsentPreferences | null> {
  const consent = await prisma.userConsent.findUnique({
    where: { userId },
  });
  return consent;
}

export async function withdrawConsent(userId: string): Promise<void> {
  await prisma.userConsent.update({
    where: { userId },
    data: {
      analytics: false,
      marketing: false,
    },
  });
}