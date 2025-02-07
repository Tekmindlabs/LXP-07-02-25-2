import { PrismaClient, UserType, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DefaultRoles } from '../src/utils/permissions';

const prisma = new PrismaClient();

async function main() {
  // First, create the roles with their permissions
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: DefaultRoles.SUPER_ADMIN },
      update: {},
      create: {
        name: DefaultRoles.SUPER_ADMIN,
        description: 'Super Administrator with full access',
      },
    }),
    prisma.role.upsert({
      where: { name: DefaultRoles.ADMIN },
      update: {},
      create: {
        name: DefaultRoles.ADMIN,
        description: 'Administrator with elevated access',
      },
    }),
    prisma.role.upsert({
      where: { name: DefaultRoles.PROGRAM_COORDINATOR },
      update: {},
      create: {
        name: DefaultRoles.PROGRAM_COORDINATOR,
        description: 'Program Coordinator role',
      },
    }),
    prisma.role.upsert({
      where: { name: DefaultRoles.TEACHER },
      update: {},
      create: {
        name: DefaultRoles.TEACHER,
        description: 'Teacher role',
      },
    }),
    prisma.role.upsert({
      where: { name: DefaultRoles.STUDENT },
      update: {},
      create: {
        name: DefaultRoles.STUDENT,
        description: 'Student role',
      },
    }),
    prisma.role.upsert({
      where: { name: DefaultRoles.PARENT },
      update: {},
      create: {
        name: DefaultRoles.PARENT,
        description: 'Parent role',
      },
    }),
  ]);

  const demoUsers = [
    {
      email: 'superadmin@example.com',
      password: 'superadmin123',
      name: 'Super Admin',
      role: DefaultRoles.SUPER_ADMIN,
      userType: UserType.ADMIN,
      status: Status.ACTIVE,
    },
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin',
      role: DefaultRoles.ADMIN,
      userType: UserType.ADMIN,
      status: Status.ACTIVE,
    },
    {
      email: 'coordinator@example.com',
      password: 'coordinator123',
      name: 'Program Coordinator',
      role: DefaultRoles.PROGRAM_COORDINATOR,
      userType: UserType.COORDINATOR,
      status: Status.ACTIVE,
    },
    {
      email: 'teacher@example.com',
      password: 'teacher123',
      name: 'Teacher',
      role: DefaultRoles.TEACHER,
      userType: UserType.TEACHER,
      status: Status.ACTIVE,
    },
    {
      email: 'student@example.com',
      password: 'student123',
      name: 'Student',
      role: DefaultRoles.STUDENT,
      userType: UserType.STUDENT,
      status: Status.ACTIVE,
    },
    {
      email: 'parent@example.com',
      password: 'parent123',
      name: 'Parent',
      role: DefaultRoles.PARENT,
      userType: UserType.PARENT,
      status: Status.ACTIVE,
    },
  ] as const;

  for (const demoUser of demoUsers) {
    const hashedPassword = await bcrypt.hash(demoUser.password, 12);
    const role = roles.find((r: Role) => r.name === demoUser.role);

    if (!role) {
      console.log(`Role not found for user: ${demoUser.email}`);
      continue;
    }

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: {
      email: demoUser.email,
      name: demoUser.name,
      password: hashedPassword,
      status: demoUser.status,
      userType: demoUser.userType,
      phoneNumber: null, // Add phoneNumber field
      userRoles: {
        create: {
        roleId: role.id,
        },
      },
      },
      include: {
      userRoles: {
        include: {
        role: true,
        },
      },
      },
    });

    switch (demoUser.role) {
      case DefaultRoles.TEACHER:
        await prisma.teacherProfile.upsert({
          where: { userId: user.id },
          update: { specialization: 'General' },
          create: {
            userId: user.id,
            specialization: 'General',
          },
        });
        break;
      case DefaultRoles.STUDENT:
        await prisma.studentProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
          },
        });
        break;
      case DefaultRoles.PARENT:
        await prisma.parentProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
          },
        });
        break;
      case DefaultRoles.PROGRAM_COORDINATOR:
        await prisma.coordinatorProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
          },
        });
        break;
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error while seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

