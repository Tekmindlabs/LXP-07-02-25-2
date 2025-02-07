import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const calendarSchema = z.object({
	id: z.string(),
	inheritSettings: z.boolean().optional(),
});

export const classGroupRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({
			name: z.string(),
			description: z.string().optional(),
			programId: z.string(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).default(Status.ACTIVE),
			calendar: calendarSchema,
		}))
		.mutation(async ({ ctx, input }) => {
			const { calendar, ...classGroupData } = input;

			return ctx.prisma.$transaction(async (tx) => {
				const classGroup = await tx.classGroup.create({
					data: {
						...classGroupData,
						calendarId: calendar.id,
					},
					include: {
						classes: true,
						calendar: true,
					}
				});

				return classGroup;
			});
		}),

	update: protectedProcedure

		.input(z.object({
		  id: z.string(),
		  name: z.string().optional(),
		  description: z.string().optional(),
		  programId: z.string().optional(),
		  status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional(),
		  calendar: calendarSchema.optional(),
		}))
		.mutation(async ({ ctx, input }) => {
		  const { id, calendar, ...data } = input;

		  return ctx.prisma.$transaction(async (tx) => {
			const classGroup = await tx.classGroup.update({
			  where: { id },
			  data: {
				...data,
				...(calendar && { calendarId: calendar.id }),
			  },
			  include: {
				classes: true,
				calendar: true,
			  }
			});

			return classGroup;
		  });
		}),


	deleteClassGroup: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.classGroup.delete({
				where: { id: input },
			});
		}),

	getClassGroup: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.classGroup.findUnique({
				where: { id: input },
				include: {
					program: true,
					subjects: true,
					classes: true,
					timetables: true,
				},
			});
		}),

	getAllClassGroups: protectedProcedure
		.input(z.object({
			programId: z.string().optional(),
		}).optional())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.classGroup.findMany({
				where: input ? { programId: input.programId } : undefined,
				include: {
					program: true,
					subjects: true,
					classes: true,
					calendar: true,
				},
				orderBy: {
					name: 'asc',
				},
			});
		}),

	getByProgramId: protectedProcedure
		.input(z.object({
			programId: z.string().min(1, "Program ID is required")
		}))
		.query(async ({ ctx, input }) => {
			try {
				// First check if program exists
				const program = await ctx.prisma.program.findUnique({
					where: { id: input.programId }
				});

				if (!program) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Program not found",
					});
				}

				const classGroups = await ctx.prisma.classGroup.findMany({
					where: { programId: input.programId },
					include: {
						classes: {
							include: {
								students: true,
								teachers: true,
							},
						},
						program: true,
						subjects: true,
					},
					orderBy: {
						name: 'asc'
					}
				});

				return classGroups;
			} catch (error) {
				if (error instanceof TRPCError) throw error;
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch class groups",
					cause: error,
				});
			}
		}),

	addSubjectsToClassGroup: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			subjectIds: z.array(z.string()),
		}))
		.mutation(async ({ ctx, input }) => {
			const classGroup = await ctx.prisma.classGroup.update({
				where: { id: input.classGroupId },
				data: {
					subjects: {
						connect: input.subjectIds.map(id => ({ id })),
					},
				},
				include: {
					subjects: true,
				},
			});
			return classGroup;
		}),

	removeSubjectsFromClassGroup: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			subjectIds: z.array(z.string()),
		}))
		.mutation(async ({ ctx, input }) => {
			const classGroup = await ctx.prisma.classGroup.update({
				where: { id: input.classGroupId },
				data: {
					subjects: {
						disconnect: input.subjectIds.map(id => ({ id })),
					},
				},
				include: {
					subjects: true,
				},
			});
			return classGroup;
		}),

	getClassGroupWithDetails: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.classGroup.findUnique({
				where: { id: input },
				include: {
					program: {
						include: {
							classGroups: {
								include: {
									timetables: {
										include: {
											term: {
												include: {
													calendar: true,
												},
											},
										},
									},
								},
							},
						},
					},
					subjects: true,
					classes: {
						include: {
							students: true,
							teachers: {
								include: {
									teacher: {
										include: {
											user: true,
										},
									},
								},
							},
						},
					},
					timetables: {
						include: {
							term: {
								include: {
									calendar: true,
								},
							},
							periods: {
								include: {
									subject: true,
									classroom: true,
								},
							},
						},
					},
					activities: true,
				},
			});
		}),

	addSubjects: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			subjectIds: z.array(z.string()),
		}))
		.mutation(async ({ ctx, input }) => {
			const { classGroupId, subjectIds } = input;

			// Add subjects to class group
			const classGroup = await ctx.prisma.classGroup.update({
				where: { id: classGroupId },
				data: {
					subjects: {
						connect: subjectIds.map(id => ({ id })),
					},
				},
				include: {
					subjects: true,
				},
			});

			// Inherit subjects to all classes in the group
			const classes = await ctx.prisma.class.findMany({
				where: { classGroupId },
			});

			// Update timetable for each class if needed
			for (const cls of classes) {
				const timetable = await ctx.prisma.timetable.findFirst({
					where: { classId: cls.id }
				});

				if (timetable) {
					await ctx.prisma.period.createMany({
						data: subjectIds.map(subjectId => ({
							timetableId: timetable.id,
							subjectId,
							teacherId: "", // This should be set to a valid teacher ID in production
							startTime: new Date(),
							endTime: new Date(),
							dayOfWeek: 1,
							classroomId: "" // This should be set to a valid classroom ID in production
						}))
					});
				}

			}

			return classGroup;
		}),

	removeSubjects: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			subjectIds: z.array(z.string()),
		}))
		.mutation(async ({ ctx, input }) => {
			const { classGroupId, subjectIds } = input;

			// Remove subjects from class group
			return ctx.prisma.classGroup.update({
				where: { id: classGroupId },
				data: {
					subjects: {
						disconnect: subjectIds.map(id => ({ id })),
					},
				},
				include: {
					subjects: true,
				},
			});
		}),

	inheritCalendar: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			calendarId: z.string(),
			classId: z.string(), // Required for timetable creation
		}))
		.mutation(async ({ ctx, input }) => {
			const { classGroupId, calendarId, classId } = input;

			// Get the calendar and its terms
			const calendar = await ctx.prisma.calendar.findUnique({
				where: { id: calendarId },
				include: {
					terms: true,
				},
			});

			if (!calendar) {
				throw new Error("Calendar not found");
			}

			// Create a timetable for the class group using the first term
			const term = calendar.terms[0];
			if (!term) {
				throw new Error("No terms found in calendar");
			}

			const _timetable = await ctx.prisma.timetable.create({
				data: {
					termId: term.id,
					classGroupId,
					classId, // Add required classId
				},
			});

			return ctx.prisma.classGroup.findUnique({
				where: { id: classGroupId },
				include: {
					timetables: {
						include: {
							term: {
								include: {
									calendar: true,
								},
							},
						},
					},
				},
			});
		}),

	list: protectedProcedure
		.query(({ ctx }) => {
			return ctx.prisma.classGroup.findMany({
				include: {
					program: true,
					classes: true,
					subjects: true,
					timetables: {
						include: {
							periods: {
								include: {
									subject: true,
									classroom: true,
								},
							},
						},
					},
					activities: true,
				},
			});
		}),

	getOverallAnalytics: protectedProcedure
		.query(async ({ ctx }) => {
			const now = new Date();
			const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

			// Get current and previous period data
			const [currentPeriodData, previousPeriodData] = await Promise.all([
				ctx.prisma.classGroup.findMany({
					include: {
						classes: {
							include: {
								students: true,
								teachers: true,
							}
						},
						subjects: true,
					},
					where: {
						createdAt: {
							gte: lastMonth,
						}
					}
				}),
				ctx.prisma.classGroup.findMany({
					include: {
						classes: {
							include: {
								students: true,
								teachers: true,
							}
						},
						subjects: true,
					},
					where: {
						createdAt: {
							lt: lastMonth,
						}
					}
				})
			]);

			// Calculate student growth
			const currentStudents = currentPeriodData.reduce((acc, group) => 
				acc + group.classes.reduce((sum, cls) => sum + cls.students.length, 0), 0);
			const previousStudents = previousPeriodData.reduce((acc, group) => 
				acc + group.classes.reduce((sum, cls) => sum + cls.students.length, 0), 0);
			
			const studentGrowth = previousStudents > 0 
				? ((currentStudents - previousStudents) / previousStudents) * 100 
				: 0;

			// Calculate average performance from activities
			const activities = await ctx.prisma.classActivity.findMany({
				where: {
					createdAt: {
						gte: lastMonth,
					}
				},
				include: {
					submissions: true,
				}
			});

			const averagePerformance = activities.length > 0 
				? activities.reduce((acc, activity) => {
						const activityAvg = activity.submissions.reduce((sum, sub) => 
							sum + (sub.obtainedMarks / sub.totalMarks * 100), 0) / 
							(activity.submissions.length || 1);
						return acc + activityAvg;
					}, 0) / activities.length
				: 0;

			return {
				studentGrowth,
				averagePerformance: Math.round(averagePerformance * 100) / 100,
			};
		}),

	getById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.classGroup.findUnique({
				where: { id: input },
				include: {
					program: true,
					classes: {
						include: {
							timetables: {
								include: {
									periods: {
										include: {
											subject: true,
											classroom: true,
											teacher: {
												include: {
													user: true,
												},
											},
										},
									},
								},
							},
						},
					},
					timetables: {
						include: {
							periods: {
								include: {
									subject: true,
									classroom: true,
									teacher: {
										include: {
											user: true,
										},
									},
								},
							},
						},
					},
					subjects: true,
					activities: true,
				},
			});
		}),

	createTimetable: protectedProcedure
		.input(z.object({
			classGroupId: z.string(),
			termId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			const existingTimetable = await ctx.prisma.timetable.findFirst({
				where: { classGroupId: input.classGroupId },
			});

			if (existingTimetable) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Timetable already exists for this class group",
				});
			}

			return ctx.prisma.timetable.create({
				data: {
					term: { connect: { id: input.termId } },
					classGroup: { connect: { id: input.classGroupId } },
					class: { connect: { id: input.classId } }
				},
				include: {
					periods: {
						include: {
							subject: true,
							classroom: true,
							teacher: {
								include: {
									user: true
								}
							}
						}
					}
				}
			});
		}),

	getHistoricalAnalytics: protectedProcedure
		.input(z.object({
			id: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const { id, startDate, endDate } = input;

			// Get historical student counts
			const historicalStudents = await ctx.prisma.historicalStudentRecord.findMany({
				where: {
					studentId: {
						in: (await ctx.prisma.class.findMany({
							where: { classGroupId: id },
							include: { students: true }
						})).flatMap(c => c.students.map(s => s.userId))
					},
					timestamp: {
						gte: startDate,
						lte: endDate
					}
				}
			});

			// Calculate growth percentage
			const studentGrowth = historicalStudents.length > 0 
				? ((Array.isArray(historicalStudents[historicalStudents.length - 1]?.grades) 
					? (historicalStudents[historicalStudents.length - 1]?.grades as any[])?.length || 0
					: 0) - 
				   (Array.isArray(historicalStudents[0]?.grades)
					? (historicalStudents[0]?.grades as any[])?.length || 0
					: 0)) / 
				  (Array.isArray(historicalStudents[0]?.grades)
					? (historicalStudents[0]?.grades as any[])?.length || 1
					: 1) * 100
				: 0;

			return {
				studentGrowth,
				historicalData: historicalStudents
			};
		}),

	getPerformanceTrends: protectedProcedure
		.input(z.object({
			id: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const { id, startDate, endDate } = input;

			// Get all activities and their submissions for the class group
			const activities = await ctx.prisma.classActivity.findMany({
				where: {
					classGroupId: id,
					createdAt: {
						gte: startDate,
						lte: endDate
					}
				},
				include: {
					submissions: true,
					subject: true
				}
			});

			// Calculate average scores by date
			const performanceData = activities.map(activity => ({
				date: activity.createdAt.toISOString().split('T')[0],
				averageScore: activity.submissions.reduce((acc, sub) => acc + (sub.obtainedMarks / sub.totalMarks * 100), 0) / 
							 (activity.submissions.length || 1)
			}));

			// Calculate subject-wise performance
			const subjectWise = activities.reduce((acc, activity) => {
				const subjectName = activity.subject.name;
				if (!acc[subjectName]) {
					acc[subjectName] = {
						subject: subjectName,
						totalScore: 0,
						count: 0
					};
				}
				
				const avgScore = activity.submissions.reduce((sum, sub) => 
					sum + (sub.obtainedMarks / sub.totalMarks * 100), 0) / 
					(activity.submissions.length || 1);
				
				acc[subjectName].totalScore += avgScore;
				acc[subjectName].count += 1;
				return acc;
			}, {} as Record<string, { subject: string; totalScore: number; count: number; }>);

			const subjectPerformance = Object.values(subjectWise).map(data => ({
				subject: data.subject,
				averageScore: data.totalScore / data.count
			}));

			return {
				data: performanceData,
				subjectWise: subjectPerformance
			};
		}),

	getAttendanceStats: protectedProcedure
		.input(z.object({
			id: z.string(),
			startDate: z.date(),
			endDate: z.date()
		}))
		.query(async ({ ctx, input }) => {
			const { id, startDate, endDate } = input;

			// Get all students in the class group
			const students = await ctx.prisma.class.findMany({
				where: { classGroupId: id },
				include: { students: true }
			});

			const studentIds = students.flatMap(c => c.students.map(s => s.id));

			// Get attendance records
			const attendance = await ctx.prisma.attendance.findMany({
				where: {
					studentId: { in: studentIds },
					date: {
						gte: startDate,
						lte: endDate
					}
				}
			});

			// Calculate daily attendance rates
			const attendanceByDate = attendance.reduce((acc, record) => {
				const date = record.date.toISOString().split('T')[0];
				if (!acc[date]) {
					acc[date] = { present: 0, total: 0 };
				}
				acc[date].total += 1;
				if (record.status === 'PRESENT') {
					acc[date].present += 1;
				}
				return acc;
			}, {} as Record<string, { present: number; total: number; }>);

			const trends = Object.entries(attendanceByDate).map(([date, stats]) => ({
				date,
				attendanceRate: (stats.present / stats.total) * 100
			}));

			return {
				trends,
				averageAttendance: trends.reduce((acc, day) => acc + day.attendanceRate, 0) / trends.length
			};
		}),
});