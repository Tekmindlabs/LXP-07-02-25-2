import { PrismaClient, Status } from '@prisma/client';
import { ClassGroup } from '@prisma/client';

export async function seedClasses(prisma: PrismaClient, classGroups: ClassGroup[]) {
	console.log('Creating demo classes...');

	const classes = await Promise.all([
		prisma.class.upsert({
			where: {
				name_classGroupId: {
					name: 'Grade 1-A',
					classGroupId: classGroups[0].id
				}
			},
			update: {},
			create: {
				name: 'Grade 1-A',
				classGroupId: classGroups[0].id,
				capacity: 30,
				status: Status.ACTIVE,
			}
		}),
		prisma.class.upsert({
			where: {
				name_classGroupId: {
					name: 'Grade 7-A',
					classGroupId: classGroups[1].id
				}
			},
			update: {},
			create: {
				name: 'Grade 7-A',
				classGroupId: classGroups[1].id,
				capacity: 35,
				status: Status.ACTIVE,
			}
		}),
		prisma.class.upsert({
			where: {
				name_classGroupId: {
					name: 'Grade 10-A',
					classGroupId: classGroups[2].id
				}
			},
			update: {},
			create: {
				name: 'Grade 10-A',
				classGroupId: classGroups[2].id,
				capacity: 35,
				status: Status.ACTIVE
			}
		})
	]);

	return classes;
}