import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const classroomRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				capacity: z.number().min(1),
				resources: z.string().optional(), // JSON string of available resources
			})
		)
		.mutation(({ ctx, input }) => {
			return ctx.prisma.classroom.create({
				data: input,
			});
		}),

	getAll: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.classroom.findMany({
			include: {
				periods: {
					include: {
						subject: true,
						timetable: {
							include: {
								class: true,
								classGroup: true,
							},
						},
					},
				},
			},
		});
	}),

	getById: protectedProcedure
		.input(z.string())
		.query(({ ctx, input }) => {
			return ctx.prisma.classroom.findUnique({
				where: { id: input },
				include: {
					periods: {
						include: {
							subject: true,
							timetable: {
								include: {
									class: true,
									classGroup: true,
								},
							},
						},
					},
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string(),
				capacity: z.number().min(1),
				resources: z.string().optional(),
			})
		)
		.mutation(({ ctx, input }) => {
			const { id, ...data } = input;
			return ctx.prisma.classroom.update({
				where: { id },
				data,
			});
		}),

	delete: protectedProcedure
		.input(z.string())
		.mutation(({ ctx, input }) => {
			return ctx.prisma.classroom.delete({
				where: { id: input },
			});
		}),

	getAvailability: protectedProcedure
		.input(
			z.object({
				classroomId: z.string(),
				date: z.date(),
			})
		)
		.query(async ({ ctx, input }) => {
			const periods = await ctx.prisma.period.findMany({
				where: {
					classroomId: input.classroomId,
					dayOfWeek: input.date.getDay() || 7, // Convert Sunday (0) to 7
				},
				include: {
					subject: true,
					timetable: {
						include: {
							class: true,
							classGroup: true,
						},
					},
				},
				orderBy: {
					startTime: 'asc',
				},
			});

			return periods;
		}),

	list: protectedProcedure
		.query(({ ctx }) => {
			return ctx.prisma.classroom.findMany({
				include: {
					periods: {
						include: {
							subject: true,
							timetable: {
								include: {
									classGroup: true,
									class: true,
								},
							},
						},
					},
				},
			});
		}),
});