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

async function runAllSeeds() {
	try {
		console.log('Starting complete database seeding...');
		
		console.time('Total Seeding Time');
		
		// Users and roles (required first)
		console.time('Users Seeding');
		await seedUsers(prisma);
		console.timeEnd('Users Seeding');
		
		// Calendar and events
		console.time('Calendar Seeding');
		const calendar = await seedCalendar(prisma);
		console.timeEnd('Calendar Seeding');
		
		// Programs
		console.time('Programs Seeding');
		const programs = await seedPrograms(prisma, calendar.id);
		console.timeEnd('Programs Seeding');
		
		
		
		// Class groups
		console.time('Class Groups Seeding');
		const classGroups = await seedClassGroups(prisma, programs);
		console.timeEnd('Class Groups Seeding');
		
		// Subjects
		console.time('Subjects Seeding');
		const subjects = await seedSubjects(prisma, classGroups);
		console.timeEnd('Subjects Seeding');
		
		// Classes
		console.time('Classes Seeding');
		const classes = await seedClasses(prisma, classGroups);
		console.timeEnd('Classes Seeding');
		
		// Classrooms
		console.time('Classrooms Seeding');
		const classrooms = await seedClassrooms(prisma);
		console.timeEnd('Classrooms Seeding');
		
		// Timetables and periods
		console.time('Timetables Seeding');
		await seedTimetables(prisma, { classGroups, classes, subjects, classrooms });
		console.timeEnd('Timetables Seeding');
		
		// Activities and resources
		console.time('Activities Seeding');
		await seedActivities(prisma, { classes, subjects, classGroups });
		console.timeEnd('Activities Seeding');

		// Attendance
		console.time('Attendance Seeding');
		await seedAttendance(prisma);
		console.timeEnd('Attendance Seeding');

		console.timeEnd('Total Seeding Time');
		console.log('All seeds completed successfully');
	} catch (error) {
		console.error('Error during seeding:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

runAllSeeds()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});