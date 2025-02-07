import { prisma } from '@/server/db';

export async function submitDataRequest(
  userId: string,
  type: DataSubjectRequest['type'],
  details?: string
) {
  return prisma.dataSubjectRequest.create({
    data: {
      userId,
      type,
      status: 'pending',
      details,
      requestDate: new Date(),
    },
  });
}

export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      userRoles: true,
      activityLogs: true,
      consents: true,
    },
  });

  return {
    personalData: {
      name: user?.name,
      email: user?.email,
      createdAt: user?.createdAt,
    },
    roles: user?.userRoles,
    activityLogs: user?.activityLogs,
    consents: user?.consents,
  };
}