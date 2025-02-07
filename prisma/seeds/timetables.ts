import { PrismaClient } from '@prisma/client';
import { ClassGroup, Class, Subject, Classroom } from '@prisma/client';

interface TimetableParams {
	classGroups: ClassGroup[];
	classes: Class[];
	subjects: Subject[];
	classrooms: Classroom[];
}

export async function seedTimetables(prisma: PrismaClient, params: TimetableParams) {
	console.log('Creating timetables and periods...');
	
	// Get teachers for assignments
	const teachers = await prisma.teacherProfile.findMany({
		include: {
			user: true
		}
	});

	if (teachers.length === 0) {
		throw new Error("No teachers found in the database");
	}

	// Get first term
	const term = await prisma.term.findFirst({
		where: {
			name: 'Fall Semester 2024'
		}
	});

	if (!term) {
		throw new Error("Term not found");
	}

	// Create timetables for each class group
	const timetables = await Promise.all(
		params.classGroups.map(async (classGroup, index) => {
			const classForGroup = params.classes[index];
			
			return prisma.timetable.upsert({
				where: {
					termId_classGroupId_classId: {
						termId: term.id,
						classGroupId: classGroup.id,
						classId: classForGroup.id
					}
				},
				update: {},
				create: {
					termId: term.id,
					classGroupId: classGroup.id,
					classId: classForGroup.id
				}
			});
		})
	);

	// Create periods for each timetable
	console.log('Creating periods...');
	for (let index = 0; index < timetables.length; index++) {
		const timetable = timetables[index];
		const dayOffset = index + 1; // Different days for each class
		const teacherIndex = index % teachers.length;
		const classroomIndex = index % params.classrooms.length;

		await Promise.all([
			prisma.period.upsert({
				where: {
					timetableId_dayOfWeek_startTime: {
						timetableId: timetable.id,
						dayOfWeek: dayOffset,
						startTime: new Date('2024-08-01T08:00:00Z')
					}
				},
				update: {},
				create: {
					startTime: new Date('2024-08-01T08:00:00Z'),
					endTime: new Date('2024-08-01T09:00:00Z'),
					dayOfWeek: dayOffset,
					durationInMinutes: 60,
					subject: { connect: { id: params.subjects[0].id } },
					classroom: { connect: { id: params.classrooms[classroomIndex].id } },
					timetable: { connect: { id: timetable.id } },
					teacher: { connect: { id: teachers[teacherIndex].id } }
				}
			}),
			prisma.period.upsert({
				where: {
					timetableId_dayOfWeek_startTime: {
						timetableId: timetable.id,
						dayOfWeek: dayOffset,
						startTime: new Date('2024-08-01T09:00:00Z')
					}
				},
				update: {},
				create: {
					startTime: new Date('2024-08-01T09:00:00Z'),
					endTime: new Date('2024-08-01T10:00:00Z'),
					dayOfWeek: dayOffset,
					durationInMinutes: 60,
					subject: { connect: { id: params.subjects[1].id } },
					classroom: { connect: { id: params.classrooms[(classroomIndex + 1) % params.classrooms.length].id } },
					timetable: { connect: { id: timetable.id } },
					teacher: { connect: { id: teachers[(teacherIndex + 1) % teachers.length].id } }
				}
			})
		]);
	}

	return timetables;
}