import { PrismaClient, AttendanceStatus } from '@prisma/client';

export async function seedAttendance(prisma: PrismaClient) {
	console.log('Seeding attendance data...');

	// Get all classes
	const classes = await prisma.class.findMany({
		include: {
			students: true
		}
	});

	if (classes.length === 0) {
		console.log('No classes found. Skipping attendance seeding.');
		return;
	}

	// Generate attendance records for the last 30 days
	const today = new Date();
	const attendanceRecords = [];

	for (const class_ of classes) {
		for (const student of class_.students) {
			for (let i = 0; i < 30; i++) {
				const date = new Date(today);
				date.setDate(date.getDate() - i);
				
				// Skip weekends (Saturday and Sunday)
				if (date.getDay() === 0 || date.getDay() === 6) continue;

				// Randomly assign attendance status with weighted probability
				const random = Math.random();
				let status: AttendanceStatus;
				if (random < 0.85) status = AttendanceStatus.PRESENT;
				else if (random < 0.90) status = AttendanceStatus.LATE;
				else if (random < 0.95) status = AttendanceStatus.EXCUSED;
				else status = AttendanceStatus.ABSENT;

				attendanceRecords.push({
					studentId: student.id,
					classId: class_.id,
					date,
					status,
					notes: status !== AttendanceStatus.PRESENT ? `Attendance marked as ${status}` : null
				});
			}
		}
	}

	// Create attendance records
	await prisma.attendance.createMany({
		data: attendanceRecords,
		skipDuplicates: true
	});

	console.log(`Created ${attendanceRecords.length} attendance records`);
}