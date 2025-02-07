import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users';
import { seedCalendar } from './calendar';
import { seedPrograms } from './programs';
import { seedClassGroups } from './class-groups';
import { seedSubjects } from './subjects';
import { seedClasses } from './classes';
import { seedClassrooms } from './classrooms';
import { seedTimetables } from './timetables';
import { seedActivities } from './activities';
import { seedAttendance } from './attendance';

const prisma = new PrismaClient();

async function seedDemoData() {
	try {
		console.log('Starting demo data seeding...');
		
		// Create users and roles first as they are required by other entities
		await seedUsers(prisma);
		
		// Create calendar and events
		const calendar = await seedCalendar(prisma);
		
		// Create programs
		const programs = await seedPrograms(prisma, calendar.id);
		
		// Create class groups
		const classGroups = await seedClassGroups(prisma, programs);
		
		// Create subjects
		const subjects = await seedSubjects(prisma, classGroups);
		
		// Create classes
		const classes = await seedClasses(prisma, classGroups);
		
		// Seed attendance data after classes are created
		await seedAttendance(prisma);
		
		// Create classrooms
		const classrooms = await seedClassrooms(prisma);
		
		// Create timetables and periods
		await seedTimetables(prisma, { classGroups, classes, subjects, classrooms });
		
		// Create activities and resources
		await seedActivities(prisma, { classes, subjects });

		console.log('Demo data seeding completed successfully');
	} catch (error) {
		console.error('Error seeding demo data:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

seedDemoData()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});