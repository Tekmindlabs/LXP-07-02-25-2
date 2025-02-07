import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

interface PeriodInput {
	startTime: Date;
	endTime: Date;
	dayOfWeek: number;
	durationInMinutes?: number;
	subjectId: string;
	classroomId: string;
	teacherId: string;
	teacherProfileId?: string;
}

export const timetableRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				termId: z.string(),
				classGroupId: z.string(),
				classId: z.string(),
				periods: z.array(
					z.object({
						startTime: z.date(),
						endTime: z.date(),
						durationInMinutes: z.number().int().min(1).max(240).optional().default(45),
						dayOfWeek: z.number().min(1).max(7),
						subjectId: z.string(),
						classroomId: z.string(),
						teacherId: z.string(),
					})
				),
			})
		)
		.mutation(async ({ ctx, input }) => {
      const periodsWithTeachers: PeriodInput[] = [];

      // Check for period conflicts and get teacher profiles
      for (const period of input.periods) {
const teacherProfile = await ctx.prisma.teacherProfile.findFirst({
          where: { userId: period.teacherId },
        });

        if (!teacherProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Teacher profile not found",
          });
        }

const conflictingPeriod = await ctx.prisma.period.findFirst({
          where: {
            OR: [
              {
                // Teacher teaching in another class at the same time
                subject: {
                  teachers: {
                    some: {
                      teacher: {
                        periods: {
                          some: {
                            dayOfWeek: period.dayOfWeek,
                            startTime: {
                              lte: period.endTime,
                            },
                            endTime: {
                              gte: period.startTime,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              {
                // Classroom already booked
                classroomId: period.classroomId,
                dayOfWeek: period.dayOfWeek,
                startTime: {
                  lte: period.endTime,
                },
                endTime: {
                  gte: period.startTime,
                },
              },
            ],
          },
          include: {
            subject: true,
            classroom: true,
            teacher: true,
          },
        });

        if (conflictingPeriod) {
          throw new TRPCError({
            code: "CONFLICT",
            message: conflictingPeriod.teacher 
              ? `Teacher is already assigned to another class at this time`
              : `Classroom ${conflictingPeriod.classroom.name} is already booked at this time`,
          });
        }

        periodsWithTeachers.push({
          ...period,
          teacherProfileId: teacherProfile.id,
        });
      }

return ctx.prisma.timetable.create({
        data: {
          termId: input.termId,
          classGroupId: input.classGroupId,
          classId: input.classId,
          periods: {
            create: periodsWithTeachers.map(period => ({
              startTime: period.startTime,
              endTime: period.endTime,
              dayOfWeek: period.dayOfWeek,
              durationInMinutes: period.durationInMinutes ?? 45,
              subject: { connect: { id: period.subjectId } },
              classroom: { connect: { id: period.classroomId } },
              teacher: { connect: { id: period.teacherProfileId! } },
            })),
          },
        },
        include: {
          periods: {
            include: {
              subject: true,
              classroom: true,
              teacher: true,
            },
          },
        },
      });
    }),

	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.timetable.findMany({
			include: {
				periods: {
					include: {
						subject: true,
						classroom: true,
					},
				},
				classGroup: true,
				class: true,
			},
		});
	}),

	getById: protectedProcedure
		.input(z.string())
		.query(({ ctx, input }) => {
			return ctx.prisma.timetable.findUnique({
				where: { id: input },
				include: {
					periods: {
						include: {
							subject: true,
							classroom: true,
						},
					},
					classGroup: true,
					class: true,
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				periods: z.array(
					z.object({
						id: z.string().optional(),
						startTime: z.date(),
						endTime: z.date(),
						durationInMinutes: z.number().int().min(1).max(240).optional().default(45),
						dayOfWeek: z.number().min(1).max(7),
						subjectId: z.string(),
						classroomId: z.string(),
						teacherId: z.string(),
					})
				),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Delete existing periods
			await ctx.prisma.period.deleteMany({
				where: { timetableId: input.id },
			});

			// Process each period and get teacher profiles
			const periodsWithTeachers = await Promise.all(
				input.periods.map(async (period) => {
					const teacherProfile = await ctx.prisma.teacherProfile.findFirst({
						where: { userId: period.teacherId },
					});

					if (!teacherProfile) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: `Teacher profile not found for teacher ID ${period.teacherId}`,
						});
					}

					return {
						...period,
						teacherProfileId: teacherProfile.id,
					};
				})
			);

			// Create new periods
			return ctx.prisma.timetable.update({
				where: { id: input.id },
				data: {
					periods: {
						create: periodsWithTeachers.map(period => ({
							startTime: period.startTime,
							endTime: period.endTime,
							dayOfWeek: period.dayOfWeek,
							durationInMinutes: period.durationInMinutes ?? 45,
							subject: { connect: { id: period.subjectId } },
							classroom: { connect: { id: period.classroomId } },
							teacher: { connect: { id: period.teacherProfileId } },
						})),
					},
				},
				include: {
					periods: {
						include: {
							subject: true,
							classroom: true,
							teacher: true,
						},
					},
				},
			});
		}),

	delete: protectedProcedure
		.input(z.string())
		.mutation(({ ctx, input }) => {
			return ctx.prisma.timetable.delete({
				where: { id: input },
			});
		}),

	createPeriod: protectedProcedure
		.input(z.object({
			startTime: z.date(),
			endTime: z.date(),
			dayOfWeek: z.number().min(1).max(7),
			durationInMinutes: z.number().int().min(1).max(240),
			subjectId: z.string(),
			classroomId: z.string(),
			teacherId: z.string(),
			timetableId: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			// Check for conflicts
			const existingPeriod = await ctx.prisma.period.findFirst({
				where: {
					OR: [
						{
							AND: [
								{ teacher: { id: input.teacherId } },
								{ startTime: { lte: input.endTime } },
								{ endTime: { gte: input.startTime } },
							],
						},
						{
							AND: [
								{ classroomId: input.classroomId },
								{ startTime: { lte: input.endTime } },
								{ endTime: { gte: input.startTime } },
							],
						},
					],
				},
			});

			if (existingPeriod) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Schedule conflict detected",
				});
			}

			// Get teacher profile ID from user ID
			const teacherProfile = await ctx.prisma.teacherProfile.findFirst({
				where: { userId: input.teacherId },
			});

			if (!teacherProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Teacher profile not found",
				});
			}

			// Create period with teacher association
			const period = await ctx.prisma.period.create({
				data: {
					startTime: input.startTime,
					endTime: input.endTime,
					dayOfWeek: input.dayOfWeek,
					durationInMinutes: input.durationInMinutes,
					subject: { connect: { id: input.subjectId } },
					classroom: { connect: { id: input.classroomId } },
					timetable: { connect: { id: input.timetableId } },
					teacher: { connect: { id: teacherProfile.id } },
				},
				include: {
					subject: true,
					classroom: true,
					teacher: {
						include: {
							user: true,
						},
					},
				},
			});

			return period;
		}),

	updatePeriod: protectedProcedure
		.input(z.object({
			id: z.string(),
			startTime: z.date(),
			endTime: z.date(),
			dayOfWeek: z.number().min(1).max(7),
			durationInMinutes: z.number().int().min(1).max(240),
			subjectId: z.string(),
			classroomId: z.string(),
			teacherId: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			// Get teacher profile ID from user ID
			const teacherProfile = await ctx.prisma.teacherProfile.findFirst({
				where: { userId: input.teacherId },
			});

			if (!teacherProfile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Teacher profile not found",
				});
			}

			// Check for conflicts excluding current period
			const existingPeriod = await ctx.prisma.period.findFirst({
				where: {
					id: { not: input.id },
					OR: [
						{
							AND: [
								{ teacher: { id: teacherProfile.id } },
								{ startTime: { lte: input.endTime } },
								{ endTime: { gte: input.startTime } },
							],
						},
						{
							AND: [
								{ classroomId: input.classroomId },
								{ startTime: { lte: input.endTime } },
								{ endTime: { gte: input.startTime } },
							],
						},
					],
				},
			});

			if (existingPeriod) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Schedule conflict detected",
				});
			}

			const period = await ctx.prisma.period.update({
				where: { id: input.id },
				data: {
					startTime: input.startTime,
					endTime: input.endTime,
					dayOfWeek: input.dayOfWeek,
					durationInMinutes: input.durationInMinutes,
					subject: { connect: { id: input.subjectId } },
					classroom: { connect: { id: input.classroomId } },
					teacher: { connect: { id: teacherProfile.id } },
				},
				include: {
					subject: true,
					classroom: true,
					teacher: {
						include: {
							user: true,
						},
					},
				},
			});

			return period;
		}),
});