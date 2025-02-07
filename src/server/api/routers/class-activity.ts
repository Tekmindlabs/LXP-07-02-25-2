import { ResourceType } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const ActivityTypes = {
	// Online Activities (Auto-graded)
	QUIZ_MULTIPLE_CHOICE: 'QUIZ_MULTIPLE_CHOICE',
	QUIZ_DRAG_DROP: 'QUIZ_DRAG_DROP',
	QUIZ_FILL_BLANKS: 'QUIZ_FILL_BLANKS',
	QUIZ_MEMORY: 'QUIZ_MEMORY',
	QUIZ_TRUE_FALSE: 'QUIZ_TRUE_FALSE',
	GAME_WORD_SEARCH: 'GAME_WORD_SEARCH',
	GAME_CROSSWORD: 'GAME_CROSSWORD',
	GAME_FLASHCARDS: 'GAME_FLASHCARDS',
	VIDEO_YOUTUBE: 'VIDEO_YOUTUBE',
	READING: 'READING',
	// In-Class Activities (Manually graded)
	CLASS_ASSIGNMENT: 'CLASS_ASSIGNMENT',
	CLASS_PROJECT: 'CLASS_PROJECT',
	CLASS_PRESENTATION: 'CLASS_PRESENTATION',
	CLASS_TEST: 'CLASS_TEST',
	CLASS_EXAM: 'CLASS_EXAM'
} as const;

type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];

export const classActivityRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({
			title: z.string(),
			description: z.string().optional(),
			type: z.enum(Object.values(ActivityTypes) as [ActivityType, ...ActivityType[]]),
			classId: z.string(),
			subjectId: z.string(),
			deadline: z.date().optional(),
			gradingCriteria: z.string().optional(),
			configuration: z.object({
				totalMarks: z.number().min(1),
				passingMarks: z.number().min(1),
				activityMode: z.enum(['ONLINE', 'IN_CLASS']),
				gradingType: z.enum(['AUTOMATIC', 'MANUAL']),
				isGraded: z.boolean(),
				timeLimit: z.number().optional(),
				attempts: z.number().optional(),
			}),
			resources: z.array(z.object({
				title: z.string(),
				type: z.nativeEnum(ResourceType),
				url: z.string()
			})).optional()
		}))
		.mutation(async ({ ctx, input }) => {
			const { resources, ...activityData } = input;
			return ctx.prisma.classActivity.create({
				data: {
					...activityData,
					status: 'PUBLISHED',
					...(resources && {
						resources: {
							create: resources
						}
					})
				},
				include: {
					resources: true,
					class: {
						select: {
							name: true
						}
					},
					classGroup: {
						select: {
							name: true
						}
					}
				}
			});
		}),

	getAll: protectedProcedure
		.input(z.object({
			classId: z.string().optional(),
			search: z.string().optional(),
			type: z.enum(Object.values(ActivityTypes) as [ActivityType, ...ActivityType[]]).optional(),
			classGroupId: z.string().optional()
		}))
		.query(async ({ ctx, input }) => {
			try {
				const { search, type, classId, classGroupId } = input;
				const activities = await ctx.prisma.classActivity.findMany({
					where: {
						...(classId && { classId }),
						...(type && { type }),
						...(classGroupId && { classGroupId }),
						...(search && {
							OR: [
								{ title: { contains: search, mode: 'insensitive' } },
								{ description: { contains: search, mode: 'insensitive' } },
							],
						}),
					},
					include: {
						resources: true,
						class: {
							select: {
								name: true
							}
						},
						classGroup: {
							select: {
								name: true
							}
						},
						submissions: {
							select: {
								id: true,
								status: true,
								submittedAt: true,
								studentId: true,
								obtainedMarks: true,
								totalMarks: true,
								feedback: true,
								student: {
									select: {
										id: true,
										name: true
									}
								}

							}
						}
					},
					orderBy: {
						createdAt: 'desc'
					}
				});

				return activities;

			} catch (error) {
				console.error('Error in getAll query:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch class activities',
					cause: error
				});
			}
		}),


	getById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			try {
				const activity = await ctx.prisma.classActivity.findUnique({
					where: { id: input },
					include: {
						resources: true,
						class: {
							select: {
								name: true
							}
						},
						classGroup: {
							select: {
								name: true
							}
						},
						submissions: {
							select: {
								id: true,
								status: true,
								submittedAt: true,
								studentId: true,
								obtainedMarks: true,
								totalMarks: true,
								feedback: true,
								student: {
									select: {
										id: true,
										name: true
									}
								}
							}
						}
					}
				});

				if (!activity) {
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Activity not found',
					});
				}

				return activity;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}
				console.error('Error in getById query:', error);
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch activity details. Please try again.',
					cause: error
				});
			}
		}),


	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string(),
			description: z.string().optional(),
			type: z.enum(Object.values(ActivityTypes) as [ActivityType, ...ActivityType[]]),
			classId: z.string(),
			subjectId: z.string(),
			deadline: z.date().optional(),
			gradingCriteria: z.string().optional(),
			configuration: z.object({
				totalMarks: z.number().min(1),
				passingMarks: z.number().min(1),
				activityMode: z.enum(['ONLINE', 'IN_CLASS']),
				gradingType: z.enum(['AUTOMATIC', 'MANUAL']),
				isGraded: z.boolean(),
				timeLimit: z.number().optional(),
				attempts: z.number().optional(),
			})
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.prisma.classActivity.update({
				where: { id },
				data,
				include: {
					resources: true
				}
			});
		}),

	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.classActivity.delete({
				where: { id: input }
			});
		}),

	submitActivity: protectedProcedure
		.input(z.object({
			activityId: z.string(),
			studentId: z.string(),
			content: z.any(),
			status: z.enum(['PENDING', 'SUBMITTED', 'GRADED', 'LATE', 'MISSED'])
		}))
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.activitySubmission.create({
				data: {
					activity: { connect: { id: input.activityId } },
					student: { connect: { id: input.studentId } },
					status: input.status,
					content: input.content,
					submittedAt: new Date(),
					totalMarks: 0, // Default value
					obtainedMarks: 0, // Default value 
					isPassing: false, // Default value
					gradingType: 'MANUAL' // Default value
				}
			});
		}),

	gradeSubmission: protectedProcedure
		.input(z.object({
			submissionId: z.string(),
			obtainedMarks: z.number(),
			totalMarks: z.number(),
			isPassing: z.boolean(),
			feedback: z.string().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.activitySubmission.update({
				where: { id: input.submissionId },
				data: {
					obtainedMarks: input.obtainedMarks,
					totalMarks: input.totalMarks,
					isPassing: input.isPassing,
					feedback: input.feedback,
					status: 'GRADED',
					gradedAt: new Date()
				}
			});
		})
});