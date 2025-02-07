import { PrismaClient, UserType, Status } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
	console.log('Creating demo users...');
	
	// Create or get existing roles
	const roleNames = ['ADMIN', 'TEACHER', 'STUDENT'];
	const roles = await Promise.all(
		roleNames.map(async (name) => {
			const existingRole = await prisma.role.findUnique({
				where: { name }
			});
			
			if (existingRole) return existingRole;
			
			return prisma.role.create({
				data: {
					name,
					description: `${name.charAt(0) + name.slice(1).toLowerCase()} Role`
				}
			});
		})
	);

	// Create users with profiles
	const users = await Promise.all([
		// Admin
		prisma.user.upsert({
			where: { email: 'admin@school.com' },
			update: {},
			create: {
				name: 'Admin User',
				email: 'admin@school.com',
				userType: UserType.ADMIN,
				status: Status.ACTIVE,
				userRoles: {
					create: {
						roleId: roles[0].id
					}
				}
			}
		}),
		// Teachers
		prisma.user.upsert({
			where: { email: 'teacher1@school.com' },
			update: {},
			create: {
				name: 'John Teacher',
				email: 'teacher1@school.com',
				userType: UserType.TEACHER,
				status: Status.ACTIVE,
				teacherProfile: {
					create: {
						specialization: 'Mathematics'
					}
				},
				userRoles: {
					create: {
						roleId: roles[1].id
					}
				}
			}
		}),
		prisma.user.upsert({
			where: { email: 'teacher2@school.com' },
			update: {},
			create: {
				name: 'Jane Teacher',
				email: 'teacher2@school.com',
				userType: UserType.TEACHER,
				status: Status.ACTIVE,
				teacherProfile: {
					create: {
						specialization: 'Science'
					}
				},
				userRoles: {
					create: {
						roleId: roles[1].id
					}
				}
			}
		}),
		// Students
		prisma.user.upsert({
			where: { email: 'student1@school.com' },
			update: {},
			create: {
				name: 'Student One',
				email: 'student1@school.com',
				userType: UserType.STUDENT,
				status: Status.ACTIVE,
				studentProfile: {
					create: {
						dateOfBirth: new Date('2010-01-01')
					}
				},
				userRoles: {
					create: {
						roleId: roles[2].id
					}
				}
			}
		}),
		prisma.user.upsert({
			where: { email: 'student2@school.com' },
			update: {},
			create: {
				name: 'Student Two',
				email: 'student2@school.com',
				userType: UserType.STUDENT,
				status: Status.ACTIVE,
				studentProfile: {
					create: {
						dateOfBirth: new Date('2010-06-15')
					}
				},
				userRoles: {
					create: {
						roleId: roles[2].id
					}
				}
			}
		})
	]);

	return users;
}