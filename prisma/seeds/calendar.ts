import { PrismaClient, Status, EventType, CalendarType, Visibility, Priority } from '@prisma/client';

export async function seedCalendar(prisma: PrismaClient) {
	console.log('Creating demo calendar...');
	
	// Create Calendar
	const calendar = await prisma.calendar.upsert({
		where: {
			name_type: {
				name: "2024-2025 Academic Calendar",
				type: CalendarType.PRIMARY
			}
		},
		update: {
			description: 'Main academic calendar for 2024-2025',
			startDate: new Date('2024-08-01'),
			endDate: new Date('2025-05-31'),
			status: Status.ACTIVE,
			isDefault: true,
			visibility: Visibility.ALL,
			metadata: {
				academicYear: '2024-2025',
				semester: 'BOTH',
				terms: 2
			}
		},
		create: {
			name: '2024-2025 Academic Calendar',
			description: 'Main academic calendar for 2024-2025',
			startDate: new Date('2024-08-01'),
			endDate: new Date('2025-05-31'),
			type: CalendarType.PRIMARY,
			status: Status.ACTIVE,
			isDefault: true,
			visibility: Visibility.ALL,
			metadata: {
				academicYear: '2024-2025',
				semester: 'BOTH',
				terms: 2
			}
		}
	});

	console.log('Creating demo events...');
	await Promise.all([
		// Academic Events
		prisma.event.upsert({
			where: {
				title_calendarId_eventType: {
					title: 'First Day of School',
					calendarId: calendar.id,
					eventType: EventType.ACADEMIC
				}
			},
			update: {
				description: 'Opening ceremony and first day of classes',
				startDate: new Date('2024-08-01'),
				endDate: new Date('2024-08-01'),
				status: Status.ACTIVE,
				priority: Priority.HIGH,
				visibility: Visibility.ALL
			},
			create: {
				title: 'First Day of School',
				description: 'Opening ceremony and first day of classes',
				eventType: EventType.ACADEMIC,
				startDate: new Date('2024-08-01'),
				endDate: new Date('2024-08-01'),
				calendarId: calendar.id,
				status: Status.ACTIVE,
				priority: Priority.HIGH,
				visibility: Visibility.ALL
			}
		}),
		// Holidays
		prisma.event.upsert({
			where: {
				title_calendarId_eventType: {
					title: 'Fall Break',
					calendarId: calendar.id,
					eventType: EventType.HOLIDAY
				}
			},
			update: {
				description: 'Fall semester break',
				startDate: new Date('2024-10-14'),
				endDate: new Date('2024-10-18'),
				status: Status.ACTIVE,
				priority: Priority.MEDIUM,
				visibility: Visibility.ALL
			},
			create: {
				title: 'Fall Break',
				description: 'Fall semester break',
				eventType: EventType.HOLIDAY,
				startDate: new Date('2024-10-14'),
				endDate: new Date('2024-10-18'),
				calendarId: calendar.id,
				status: Status.ACTIVE,
				priority: Priority.MEDIUM,
				visibility: Visibility.ALL
			}
		}),
		// Terms
		prisma.term.upsert({
			where: {
				name_calendarId: {
					name: "Fall Semester 2024",
					calendarId: calendar.id
				}
			},
			update: {
				startDate: new Date('2024-08-01'),
				endDate: new Date('2024-12-20'),
				status: Status.ACTIVE,
				gradingPeriods: {
					deleteMany: {},
					create: [
						{
							name: 'Fall Quarter 1',
							startDate: new Date('2024-08-01'),
							endDate: new Date('2024-10-04'),
							weight: 50,
							status: Status.ACTIVE
						},
						{
							name: 'Fall Quarter 2',
							startDate: new Date('2024-10-21'),
							endDate: new Date('2024-12-20'),
							weight: 50,
							status: Status.ACTIVE
						}
					]
				}
			},
			create: {
				name: 'Fall Semester 2024',
				startDate: new Date('2024-08-01'),
				endDate: new Date('2024-12-20'),
				calendarId: calendar.id,
				status: Status.ACTIVE,
				gradingPeriods: {
					create: [
						{
							name: 'Fall Quarter 1',
							startDate: new Date('2024-08-01'),
							endDate: new Date('2024-10-04'),
							weight: 50,
							status: Status.ACTIVE
						},
						{
							name: 'Fall Quarter 2',
							startDate: new Date('2024-10-21'),
							endDate: new Date('2024-12-20'),
							weight: 50,
							status: Status.ACTIVE
						}
					]
				}
			}
		})
	]);

	return calendar;
}