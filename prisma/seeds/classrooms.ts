import { PrismaClient } from '@prisma/client';

export async function seedClassrooms(prisma: PrismaClient) {
	console.log('Creating demo classrooms...');

	const classrooms = await Promise.all([
		prisma.classroom.upsert({
			where: { name: 'Room 101' },
			update: {},
			create: {
				name: "Room 101",
				capacity: 30,
				resources: "Projector, Whiteboard"
			}
		}),
		prisma.classroom.upsert({
			where: { name: 'Room 102' },
			update: {},
			create: {
				name: 'Room 102',
				capacity: 35,
				resources: 'Smart Board, Computers',
			}
		}),
		prisma.classroom.upsert({
			where: { name: 'Science Lab' },
			update: {},
			create: {
				name: 'Science Lab',
				capacity: 25,
				resources: 'Lab Equipment, Safety Gear',
			}
		})
	]);

	return classrooms;
}