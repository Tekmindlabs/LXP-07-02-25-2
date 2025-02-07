import { PrismaClient, Status } from '@prisma/client';

export async function seedAcademicYear(prisma: PrismaClient) {
	console.log('Creating academic year settings...');
	
	// Create Academic Year Settings
	const settings = await prisma.academicYearSettings.upsert({
		where: { id: 'default-settings' },
		update: {
			startMonth: 8,  // August
			startDay: 1,
			endMonth: 5,   // May
			endDay: 31
		},
		create: {
			id: 'default-settings',
			startMonth: 8,
			startDay: 1,
			endMonth: 5,
			endDay: 31
		}
	});

	console.log('Creating academic year...');
	
	// Create Academic Year
	const academicYear = await prisma.academicYear.upsert({
		where: { name: '2024-2025' },
		update: {
			startDate: new Date('2024-08-01'),
			endDate: new Date('2025-05-31'),
			status: Status.ACTIVE
		},
		create: {
			name: '2024-2025',
			startDate: new Date('2024-08-01'),
			endDate: new Date('2025-05-31'),
			status: Status.ACTIVE
		}
	});

	return { settings, academicYear };
}