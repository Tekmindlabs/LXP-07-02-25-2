import { PrismaClient, Status } from '@prisma/client';
import { Program } from '@prisma/client';

export async function seedClassGroups(prisma: PrismaClient, programs: Program[]) {
	console.log('Creating demo class groups...');

	const classGroups = await Promise.all([
		prisma.classGroup.upsert({
			where: {
				name_programId: {
					name: 'Grade 1',
					programId: programs[0].id
				}
			},
			update: {
				description: 'First Grade Classes',
				status: Status.ACTIVE,
			},
			create: {
				name: 'Grade 1',
				description: 'First Grade Classes',
				programId: programs[0].id,
				status: Status.ACTIVE,
				calendarId: programs[0].calendarId
			}
		}),
		prisma.classGroup.upsert({
			where: {
				name_programId: {
					name: 'Grade 7',
					programId: programs[1].id
				}
			},
			update: {
				description: 'Seventh Grade Classes',
				status: Status.ACTIVE,
			},
			create: {
				name: 'Grade 7',
				description: 'Seventh Grade Classes',
				programId: programs[1].id,
				status: Status.ACTIVE,
				calendarId: programs[1].calendarId
			}
		}),
		prisma.classGroup.upsert({
			where: {
				name_programId: {
					name: 'Grade 10',
					programId: programs[2].id
				}
			},
			update: {
				description: 'Tenth Grade Classes',
				status: Status.ACTIVE,
			},
			create: {
				name: 'Grade 10',
				description: 'Tenth Grade Classes',
				programId: programs[2].id,
				status: Status.ACTIVE,
				calendarId: programs[2].calendarId
			}
		})
	]);

	return classGroups;
}