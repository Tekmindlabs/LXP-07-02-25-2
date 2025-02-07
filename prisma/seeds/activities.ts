import { PrismaClient, ResourceType, ClassActivity, Prisma } from '@prisma/client';
import { Class, Subject, ClassGroup } from '@prisma/client';




interface ActivityParams {
	classes: Class[];
	subjects: Subject[];
	classGroups: ClassGroup[];
}

interface ActivityInput {
	title: string;
	description: string | null;
	type: 'QUIZ_MULTIPLE_CHOICE' | 'GAME_WORD_SEARCH' | 'CLASS_PROJECT' | 'READING';
	status: string;
	deadline: Date | null;
	classId?: string | null;
	classGroupId?: string | null;
	subjectId: string;
	gradingCriteria?: string | null;
	configuration: Prisma.InputJsonValue;
}



export async function seedActivities(prisma: PrismaClient, params: ActivityParams) {
	console.log('Creating demo class activities...');

	const classNames = ['Grade 1-A', 'Grade 7-A', 'Grade 10-A'];
	const createdActivities: ClassActivity[] = [];

	for (const className of classNames) {
		const class_ = await prisma.class.findFirst({
			where: { name: className }
		});

		if (!class_) continue;

		const activities: ActivityInput[] = [
			// Auto-graded Activities
			{
				title: `Math Quiz - ${className}`,
				description: 'Multiple choice math quiz',
				type: 'QUIZ_MULTIPLE_CHOICE',
				deadline: new Date('2024-09-15'),
				status: 'PUBLISHED',
				classGroupId: class_.classGroupId,
				subjectId: params.subjects[0]?.id ?? '',
				gradingCriteria: 'Automatic grading based on correct answers',
				configuration: {
					totalMarks: 20,
					passingMarks: 12,
					questions: [
						{
							question: 'What is 2 + 2?',
							options: ['3', '4', '5', '6'],
							correctAnswer: '4',
							marks: 10
						},
						{
							question: 'What is 5 × 5?',
							options: ['15', '20', '25', '30'],
							correctAnswer: '25',
							marks: 10
						}
					],
					timeLimit: 30,
					gradingType: 'AUTOMATIC'
				}
			},
			{
				title: `Vocabulary Game - ${className}`,
				description: 'Interactive word search game',
				type: 'GAME_WORD_SEARCH',
				deadline: new Date('2024-09-20'),
				status: 'PUBLISHED',
				classGroupId: class_.classGroupId,
				subjectId: params.subjects[1]?.id ?? '',
				configuration: {
					totalMarks: 10,
					passingMarks: 6,
					words: ['LEARN', 'STUDY', 'READ', 'WRITE'],
					timeLimit: 15,
					gradingType: 'AUTOMATIC'
				}
			},
			// Manually graded Activities
			{
				title: `Science Project - ${className}`,
				description: 'Research and present a scientific topic',
				type: 'CLASS_PROJECT',
				deadline: new Date('2024-10-30'),
				status: 'PUBLISHED',
				classGroupId: class_.classGroupId,
				subjectId: params.subjects[2]?.id ?? '',
				gradingCriteria: 'Rubric based assessment of research quality and presentation',
				configuration: {
					totalMarks: 100,
					passingMarks: 60,
					requirements: [
						'Research paper (2000 words)',
						'Presentation slides',
						'Oral presentation (15 minutes)'
					],
					rubric: {
						research: 40,
						presentation: 30,
						delivery: 30
					},
					gradingType: 'MANUAL'
				}
			},
			{
				title: `Reading Assignment - ${className}`,
				description: 'Read the assigned chapter and complete comprehension questions',
				type: 'READING',
				deadline: new Date('2024-09-25'),
				status: 'PUBLISHED',
				classGroupId: class_.classGroupId,
				subjectId: params.subjects[1]?.id ?? '',
				configuration: {
					chapter: 'Chapter 3: The Solar System',
					pages: '45-60',
					gradingType: 'NONE'
				}
			}
		];

		for (const activity of activities) {
			const created = await prisma.classActivity.upsert({
				where: {
					title_classId: {
						title: activity.title,
						classId: class_.id
					}
				},
				update: {
					...activity,
					classId: class_.id
				},
				create: {
					...activity,
					classId: class_.id,
					resources: {
						create: [
							{
								title: `${activity.title} Instructions`,
								type: ResourceType.DOCUMENT,
								url: `https://example.com/activities/${activity.title}/instructions.pdf`
							},
							{
								title: `${activity.title} Additional Resources`,
								type: ResourceType.LINK,
								url: `https://example.com/activities/${activity.title}/resources`
							}
						]
					}
				}
			});
			createdActivities.push(created);
		}
	}

	// Add student submissions
	const students = await prisma.studentProfile.findMany({
		include: { user: true }
	});

	if (students.length > 0 && createdActivities.length > 0) {
		console.log('Creating activity submissions...');

		for (const activity of createdActivities) {
			const existingSubmissions = await prisma.activitySubmission.findMany({
				where: {
					activityId: activity.id,
					studentId: {
						in: students.map(s => s.userId)
					}
				},
				select: {
					studentId: true
				}
			});

			const existingStudentIds = new Set(existingSubmissions.map(s => s.studentId));
			const studentsToProcess = students.filter(s => !existingStudentIds.has(s.userId));

			const submissionPromises = studentsToProcess.map(async (student) => {
				const isAutoGraded = activity.type.startsWith('QUIZ_') || activity.type.startsWith('GAME_');

				const obtainedMarks = Math.floor(Math.random() * 100);
				const isPassing = obtainedMarks >= 60; // Assuming 60% passing

				return prisma.activitySubmission.create({
					data: {
						studentId: student.userId,
						activityId: activity.id,
						status: isAutoGraded ? 'GRADED' : 'SUBMITTED',
						content: isAutoGraded ? {
							answers: [
								{ questionId: 1, answer: '4' },
								{ questionId: 2, answer: '25' }
							]
						} : {
							submissionText: 'Sample submission content',
							attachments: ['submission.pdf']
						},
						totalMarks: 100,
						obtainedMarks,
						isPassing,
						gradedAt: isAutoGraded ? new Date() : null,
						gradedBy: isAutoGraded ? 'SYSTEM' : null,
						gradingType: isAutoGraded ? 'AUTOMATIC' : 'MANUAL'
					}
				});

			});

			await Promise.all(submissionPromises);
		}
	}

	return createdActivities;
}

