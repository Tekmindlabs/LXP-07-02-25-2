import { PrismaClient, UserType, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DefaultRoles, Permissions } from '../src/utils/permissions';

const prisma = new PrismaClient();

async function main() {
  // First, create the roles with their permissions
  const superAdminRole = await prisma.role.upsert({
    where: { name: DefaultRoles.SUPER_ADMIN },
    update: {},
    create: {
      name: DefaultRoles.SUPER_ADMIN,
      description: 'Super Administrator with full access',
    },
  });

  // Create permissions
  const permissions = Object.values(Permissions).map(permission => ({
    name: permission,
    description: `Permission for ${permission}`
  }));

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Assign all permissions to super-admin role
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: (await prisma.permission.findUnique({ where: { name: permission.name } }))!.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: (await prisma.permission.findUnique({ where: { name: permission.name } }))!.id,
      },
    });
  }

  // Create super admin user
  const hashedPassword = await bcrypt.hash('superadmin123', 12);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password: hashedPassword,
      status: Status.ACTIVE,
      userType: UserType.ADMIN,
      userRoles: {
        create: {
          roleId: superAdminRole.id,
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


