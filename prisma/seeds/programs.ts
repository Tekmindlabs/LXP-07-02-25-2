import { PrismaClient, Status } from '@prisma/client';

export async function seedPrograms(prisma: PrismaClient, calendarId: string) {
	console.log('Creating demo programs...');
	
	const programs = await Promise.all([
		prisma.program.upsert({
			where: { name: 'Elementary Education' },
			update: {
				description: 'K-6 Elementary Education Program',
				status: Status.ACTIVE,
				calendarId,
			},
			create: {
				name: 'Elementary Education',
				description: 'K-6 Elementary Education Program',
				status: Status.ACTIVE,
				calendarId,
			}
		}),
		prisma.program.upsert({
			where: { name: 'Middle School Program' },
			update: {
				description: 'Grades 7-9 Middle School Education',
				status: Status.ACTIVE,
				calendarId,
			},
			create: {
				name: 'Middle School Program',
				description: 'Grades 7-9 Middle School Education',
				status: Status.ACTIVE,
				calendarId,
			}
		}),
		prisma.program.upsert({
			where: { name: 'High School Program' },
			update: {
				description: 'Grades 10-12 High School Education',
				status: Status.ACTIVE,
				calendarId,
			},
			create: {
				name: 'High School Program',
				description: 'Grades 10-12 High School Education',
				status: Status.ACTIVE,
				calendarId,
			}
		})
	]);

	return programs;
}