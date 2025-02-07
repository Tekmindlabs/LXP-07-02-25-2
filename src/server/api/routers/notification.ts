import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { NotificationType, UserType } from "@prisma/client";

export const notificationRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				content: z.string(),
				type: z.enum(["ANNOUNCEMENT", "ASSIGNMENT", "GRADE", "REMINDER", "SYSTEM"]),
				scheduledFor: z.date().optional(),
				recipients: z.object({
					programIds: z.array(z.string()).optional(),
					classGroupIds: z.array(z.string()).optional(),
					classIds: z.array(z.string()).optional(),
					userIds: z.array(z.string()).optional(),
				}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Check user permissions based on role
			const user = await ctx.prisma.user.findUnique({
				where: { id: ctx.session.user.id },
				include: {
					userRoles: {
						include: { role: true },
					},
					coordinatorProfile: {
						include: { programs: true },
					},
					teacherProfile: {
						include: { classes: true },
					},
				},
			});

			if (!user) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User not found",
				});
			}

			// Get all recipient users based on the hierarchical structure
			const recipientUsers = new Set<string>();

			// Add directly specified users
			if (input.recipients.userIds) {
				input.recipients.userIds.forEach((id) => recipientUsers.add(id));
			}

			// Add users from programs (if user is admin or coordinator of these programs)
			if (input.recipients.programIds) {
				const programs = await ctx.prisma.program.findMany({
					where: {
						id: { in: input.recipients.programIds },
						OR: [
							{
								coordinatorId: user.coordinatorProfile?.id,
							},
							{
								// Admin can send to any program
								id: user.userType === "ADMIN" ? undefined : null,
							},
						],
					},
					include: {
						classGroups: {
							include: {
								classes: {
									include: {
										students: {
											include: { user: true },
										},
										teachers: {
											include: { teacher: { include: { user: true } } },
										},
									},
								},
							},
						},
					},
				});

				programs.forEach((program) => {
					program.classGroups.forEach((group) => {
						group.classes.forEach((cls) => {
							cls.students.forEach((student) => recipientUsers.add(student.userId));
							cls.teachers.forEach((teacher) => recipientUsers.add(teacher.teacher.userId));
						});
					});
				});
			}

			// Add users from class groups
			if (input.recipients.classGroupIds) {
				const classGroups = await ctx.prisma.classGroup.findMany({
					where: {
						id: { in: input.recipients.classGroupIds },
						program: user.coordinatorProfile
							? { coordinatorId: user.coordinatorProfile.id }
							: undefined,
					},
					include: {
						classes: {
							include: {
								students: {
									include: { user: true },
								},
								teachers: {
									include: { teacher: { include: { user: true } } },
								},
							},
						},
					},
				});

				classGroups.forEach((group) => {
					group.classes.forEach((cls) => {
						cls.students.forEach((student) => recipientUsers.add(student.userId));
						cls.teachers.forEach((teacher) => recipientUsers.add(teacher.teacher.userId));
					});
				});
			}

			// Add users from classes
			if (input.recipients.classIds) {
				const classes = await ctx.prisma.class.findMany({
					where: {
						id: { in: input.recipients.classIds },
						teachers: user.teacherProfile
							? { some: { teacherId: user.teacherProfile.id } }
							: undefined,
					},
					include: {
						students: {
							include: { user: true },
						},
						teachers: {
							include: { teacher: { include: { user: true } } },
						},
					},
				});

				classes.forEach((cls) => {
					cls.students.forEach((student) => recipientUsers.add(student.userId));
					cls.teachers.forEach((teacher) => recipientUsers.add(teacher.teacher.userId));
				});
			}

			// Create the notification
			const notification = await ctx.prisma.notification.create({
				data: {
					title: input.title,
					content: input.content,
					type: input.type,
					senderId: ctx.session.user.id,
					recipients: {
						create: Array.from(recipientUsers).map((userId) => ({
							recipientId: userId,
						})),
					},
				},
				include: {
					sender: true,
					recipients: {
						include: {
							recipient: true,
						},
					},
				},
			});

			return notification;
		}),

	getAll: protectedProcedure
		.input(
			z.object({
				type: z.enum(["SENT", "RECEIVED"]).default("RECEIVED"),
				filters: z
					.object({
						type: z.enum(["ANNOUNCEMENT", "ASSIGNMENT", "GRADE", "REMINDER", "SYSTEM"]).optional(),
						startDate: z.date().optional(),
						endDate: z.date().optional(),
						read: z.boolean().optional(),
					})
					.optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			if (input.type === "SENT") {
				return ctx.prisma.notification.findMany({
					where: {
						senderId: ctx.session.user.id,
						type: input.filters?.type,
						createdAt: {
							gte: input.filters?.startDate,
							lte: input.filters?.endDate,
						},
					},
					include: {
						sender: true,
						recipients: {
							include: {
								recipient: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				});
			}

			return ctx.prisma.notification.findMany({
				where: {
					recipients: {
						some: {
							recipientId: ctx.session.user.id,
							read: input.filters?.read,
						},
					},
					type: input.filters?.type,
					createdAt: {
						gte: input.filters?.startDate,
						lte: input.filters?.endDate,
					},
				},
				include: {
					sender: true,
					recipients: {
						include: {
							recipient: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
			});
		}),

	markAsRead: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			await ctx.prisma.notificationRecipient.updateMany({
				where: {
					notificationId: input,
					recipientId: ctx.session.user.id,
				},
				data: {
					read: true,
					readAt: new Date(),
				},
			});
		}),

	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const notification = await ctx.prisma.notification.findUnique({
				where: { id: input },
			});

			if (!notification) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Notification not found",
				});
			}

			if (notification.senderId !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete notifications you sent",
				});
			}

			await ctx.prisma.notification.delete({
				where: { id: input },
			});
		}),

	getSettings: protectedProcedure.query(async ({ ctx }) => {
		return ctx.prisma.notificationSettings.upsert({
			where: { userId: ctx.session.user.id },
			update: {},
			create: { userId: ctx.session.user.id },
		});
	}),

	updateSettings: protectedProcedure
		.input(
			z.object({
				emailNotifications: z.boolean().optional(),
				pushNotifications: z.boolean().optional(),
				timetableChanges: z.boolean().optional(),
				assignmentUpdates: z.boolean().optional(),
				gradeUpdates: z.boolean().optional(),
				systemUpdates: z.boolean().optional(),
				doNotDisturb: z.boolean().optional(),
				doNotDisturbStart: z.date().optional(),
				doNotDisturbEnd: z.date().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.notificationSettings.upsert({
				where: { userId: ctx.session.user.id },
				update: input,
				create: { userId: ctx.session.user.id, ...input },
			});
		}),

	createSystemNotification: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				content: z.string(),
				type: z.enum(["ANNOUNCEMENT", "ASSIGNMENT", "GRADE", "REMINDER", "SYSTEM"]),
				entityType: z.string(),
				entityId: z.string(),
				metadata: z.record(z.any()).optional(),
				recipientIds: z.array(z.string()),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Verify sender has permission
			const user = await ctx.prisma.user.findUnique({
				where: { id: ctx.session.user.id },
				include: { userRoles: { include: { role: true } } },
			});

			if (!user || user.userType !== "ADMIN") {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only admins can create system notifications",
				});
			}

			// Filter recipients based on their notification settings
			const recipientsWithSettings = await ctx.prisma.notificationSettings.findMany({
				where: {
					userId: { in: input.recipientIds },
					OR: [
						{ doNotDisturb: false },
						{
							AND: [
								{ doNotDisturb: true },
								{ doNotDisturbStart: { gt: new Date() } },
								{ doNotDisturbEnd: { lt: new Date() } },
							],
						},
					],
				},
			});

			const eligibleRecipients = recipientsWithSettings.filter((settings) => {
				switch (input.entityType) {
					case "TIMETABLE":
						return settings.timetableChanges;
					case "ASSIGNMENT":
						return settings.assignmentUpdates;
					case "GRADE":
						return settings.gradeUpdates;
					case "SYSTEM":
						return settings.systemUpdates;
					default:
						return true;
				}
			});

			return ctx.prisma.notification.create({
				data: {
					title: input.title,
					content: input.content,
					type: input.type,
					entityType: input.entityType,
					entityId: input.entityId,
					metadata: input.metadata,
					senderId: ctx.session.user.id,
					recipients: {
						create: eligibleRecipients.map((settings) => ({
							recipientId: settings.userId,
						})),
					},
				},
				include: {
					sender: true,
					recipients: { include: { recipient: true } },
				},
			});
		}),
});